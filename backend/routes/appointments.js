const express = require('express');
const moment = require('moment');
const { getDatabase } = require('../database/init');
const { parseNaturalLanguageDate } = require('../shared');
const { body, validationResult } = require('express-validator');
const dbUtils = require('../utils/dbUtils');

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const appointments = await dbUtils.getAllAppointments(db);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointments grouped by date for scheduled view
router.get('/scheduled', async (req, res) => {
  try {
    const db = getDatabase();
    const result = await dbUtils.getAppointmentsByDate(db);
    res.json(result);
  } catch (error) {
    console.error('Error fetching scheduled appointments:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled appointments' });
  }
});

// Get available time slots for a specific date
router.get('/available-times/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Check if date is valid
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.json({ available: false, reason: 'Invalid date format' });
    }
    
    // Check if it's Sunday
    const dateObj = moment(date);
    if (dateObj.day() === 0) {
      return res.json({ available: false, reason: 'Closed on Sundays' });
    }
    
    // Check if it's in the past
    const today = moment().startOf('day');
    if (dateObj.isBefore(today)) {
      return res.json({ available: false, reason: 'Cannot book in the past' });
    }
    
    // Check if it's more than 45 days in the future
    const maxDate = moment().add(45, 'days').startOf('day');
    if (dateObj.isAfter(maxDate)) {
      return res.json({ available: false, reason: 'Cannot book more than 45 days in advance' });
    }
    
    const db = getDatabase();
    const availableTimes = await dbUtils.getAvailableTimesForDate(db, date);
    
    // Check if there are any available time slots
    if (availableTimes.length === 0) {
      return res.json({ 
        available: false, 
        reason: 'No available time slots for this date',
        availableTimes: []
      });
    }
    
    // Return available time slots
    res.json({ 
      available: true, 
      availableTimes: availableTimes,
      reason: null
    });
    
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ error: 'Failed to fetch available times' });
  }
});

// Create new appointment
router.post('/', [
  body('date').isISO8601().withMessage('Valid date required'),
  body('time').notEmpty().withMessage('Time required'),
  body('client').notEmpty().withMessage('Client name required'),
  body('category').isIn(['Facial', 'Massage', 'Facial + Massage']).withMessage('Valid category required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { date, time, client, category } = req.body;
  
  // Set payment based on category
  const categoryPrices = {
    'Facial': 100.00,
    'Massage': 120.00,
    'Facial + Massage': 200.00
  };
  
  const payment = categoryPrices[category];
  
  // Validate date and time
  const dateObj = moment(date);
  const today = moment().startOf('day');
  
  if (dateObj.isBefore(today)) {
    return res.status(400).json({ error: 'Cannot book appointments in the past' });
  }
  
  if (dateObj.day() === 0) {
    return res.status(400).json({ error: 'Cannot book appointments on Sundays' });
  }
  
  // Check if it's more than 45 days in the future
  const maxDate = moment().add(45, 'days').startOf('day');
  if (dateObj.isAfter(maxDate)) {
    return res.status(400).json({ error: 'Cannot book more than 45 days in advance' });
  }
  
  // Validate time is between 2 PM and 8 PM (including 30-minute intervals)
  const timeMoment = moment(`${date} ${time}`, 'YYYY-MM-DD h:mm A');
  const timeEnd = moment(timeMoment).add(1, 'hour'); // New appointment ends 1 hour later
  const startTime = moment(`${date} 2:00 PM`, 'YYYY-MM-DD h:mm A');
  const endTime = moment(`${date} 8:00 PM`, 'YYYY-MM-DD h:mm A'); // Last slot is 8:00 PM
  
  if (timeMoment.isBefore(startTime) || timeMoment.isAfter(endTime)) {
    return res.status(400).json({ error: 'Appointments can only be booked between 2:00 PM and 8:00 PM' });
  }
  
  // Check for conflicts with existing appointments (include both pending and completed appointments)
  const db = getDatabase();
  db.all('SELECT time FROM appointments WHERE date = ? AND status != "cancelled"', [date], (err, rows) => {
    if (err) {
      console.error('Error checking time slots:', err);
      return res.status(500).json({ error: 'Failed to check time slot availability' });
    }
    
    const bookedTimes = rows.map(row => row.time);
    
    // Check if exact time is booked
    if (bookedTimes.includes(time)) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }
    
    // Check for conflicts with existing appointments
    const hasConflict = bookedTimes.some(bookedTime => {
      const bookedMoment = moment(`${date} ${bookedTime}`, 'YYYY-MM-DD h:mm A');
      const bookedEnd = moment(bookedMoment).add(1, 'hour'); // Existing appointment ends 1 hour later
      
      // Check if appointments overlap OR are too close together
      // Need at least 30 minutes between appointments
      const gap1 = Math.abs(timeMoment.diff(bookedEnd, 'minutes')); // Gap between new start and existing end
      const gap2 = Math.abs(bookedMoment.diff(timeEnd, 'minutes')); // Gap between existing start and new end
      
      // If either gap is less than 30 minutes, it's a conflict
      // Also check for direct overlap
      const hasOverlap = timeMoment.isBefore(bookedEnd) && timeEnd.isAfter(bookedMoment);
      const hasInsufficientGap = gap1 < 30 || gap2 < 30;
      
      return hasOverlap || hasInsufficientGap;
    });
    
    if (hasConflict) {
      return res.status(400).json({ error: 'Appointments must have at least 30 minutes between them' });
    }
    
    // Create appointment
    db.run(`
      INSERT INTO appointments (date, time, client, category, payment, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [date, time, client, category, payment, 'pending'], function(err) {
      if (err) {
        console.error('Error creating appointment:', err);
        return res.status(500).json({ error: 'Failed to create appointment' });
      }
      
      res.status(201).json({
        id: this.lastID,
        date, time, client, category, payment, status: 'pending'
      });
    });
  });
});

// Update appointment
router.put('/:id', [
  body('category').optional().isIn(['Facial', 'Massage', 'Facial + Massage']),
  body('payment').optional().isFloat({ min: 0 }),
  body('tip').optional().isFloat({ min: 0 })
], (req, res) => {
  const { id } = req.params;
  const { category, payment, tip } = req.body;
  
  const db = getDatabase();
  
  // Get current appointment
  db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching appointment:', err);
      return res.status(500).json({ error: 'Failed to fetch appointment' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Update fields
    const updates = [];
    const values = [];
    
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
      
      // Update payment if category changed
      const categoryPrices = {
        'Facial': 100.00,
        'Massage': 120.00,
        'Facial + Massage': 200.00
      };
      updates.push('payment = ?');
      values.push(categoryPrices[category]);
    }
    
    if (payment !== undefined) {
      updates.push('payment = ?');
      values.push(payment);
    }
    
    if (tip !== undefined) {
      updates.push('tip = ?');
      values.push(tip);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const sql = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Error updating appointment:', err);
        return res.status(500).json({ error: 'Failed to update appointment' });
      }
      
      res.json({ message: 'Appointment updated successfully' });
    });
  });
});

// Mark appointment as completed
router.patch('/:id/complete', (req, res) => {
  const { id } = req.params;
  const { tip } = req.body;
  const db = getDatabase();
  
  db.run('UPDATE appointments SET status = "completed", tip = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [tip, id], function(err) {
    if (err) {
      console.error('Error completing appointment:', err);
      return res.status(500).json({ error: 'Failed to complete appointment' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment marked as completed' });
  });
});

// Cancel appointment (soft delete)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { update_reason } = req.body; // Optional cancellation reason
  const db = getDatabase();
  
  // First check if appointment exists and is not completed
  db.get('SELECT id, status FROM appointments WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error checking appointment:', err);
      return res.status(500).json({ error: 'Failed to check appointment' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (row.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed appointments' });
    }
    
    if (row.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }
    
    // Soft delete: update status and timestamp
    db.run(`
      UPDATE appointments 
      SET status = 'cancelled', 
          updated_at = CURRENT_TIMESTAMP,
          update_reason = ?
      WHERE id = ?
    `, [update_reason || 'Cancelled by user', id], function(updateErr) {
      if (updateErr) {
        console.error('Error cancelling appointment:', updateErr);
        return res.status(500).json({ error: 'Failed to cancel appointment' });
      }
      
      res.json({ message: 'Appointment cancelled successfully' });
    });
  });
});

// Search appointments by client details
router.get('/search', (req, res) => {
  console.log('🔍 Search endpoint called');
  
  try {
    const { clientName, time, date } = req.query;
    console.log('🔍 Query params:', { clientName, time, date });
    
    if (!clientName || !time || !date) {
      console.log('🔍 Missing required params');
      return res.status(400).json({ error: 'clientName, time, and date are required' });
    }
    
    const db = getDatabase();
    if (!db) {
      console.log('🔍 Database connection failed');
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    console.log('🔍 Database connection successful');
    
    // Parse the date from "august 19th" format to a proper date
    let searchDate;
    let dateString;
    try {
      // Use the shared date parsing utility
      const parsedDateInfo = parseNaturalLanguageDate(date, req.query.year);
      searchDate = parsedDateInfo.parsedDate;
      dateString = parsedDateInfo.formattedDate;
      
      console.log('🔍 Parsed date object:', searchDate);
      console.log('🔍 Formatted date string:', dateString);
    } catch (error) {
      console.error('🔍 Date parsing error:', error);
      console.log('🔍 Failed to parse date:', date);
      return res.status(400).json({ 
        error: 'date_parsing_failed',
        message: 'There is something wrong with your request. Can you double-check and make the request again?',
        originalDate: date
      });
    }
    
    // Simple search query
    const searchQuery = `
      SELECT * FROM appointments 
      WHERE client LIKE ? 
      AND time = ? 
      AND date = ?
      AND status = 'pending'
    `;
    
    const searchParams = [`%${clientName}%`, time, dateString];
    
    console.log('🔍 SQL Query:', searchQuery);
    console.log('🔍 Search Parameters:', searchParams);
    
    db.all(searchQuery, searchParams, (err, rows) => {
      if (err) {
        console.error('🔍 Database search error:', err);
        return res.status(500).json({ error: 'Failed to search appointments' });
      }
      
      console.log('🔍 Search results:', rows.length, 'appointments found');
      if (rows.length > 0) {
        console.log('🔍 First result:', rows[0]);
      }
      res.json(rows);
    });
    
  } catch (error) {
    console.error('🔍 Unexpected error in search endpoint:', error);
    res.status(500).json({ error: 'Unexpected error in search endpoint' });
  }
});

module.exports = router;
