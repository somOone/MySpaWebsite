const moment = require('moment');

/**
 * Get all appointments
 */
const getAllAppointments = (db) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM appointments 
      ORDER BY date DESC, time ASC
    `, (err, rows) => {
      if (err) {
        console.error('Error fetching appointments:', err);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

/**
 * Get appointments grouped by date for scheduled view
 */
const getAppointmentsByDate = (db) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM appointments 
      ORDER BY date DESC, time ASC
    `, (err, rows) => {
      if (err) {
        console.error('Error fetching appointments:', err);
        reject(err);
        return;
      }
      
      // Group appointments by year -> month -> date
      const grouped = {};
      
      rows.forEach(appt => {
        const date = moment(appt.date);
        const year = date.format('YYYY');
        const month = date.format('MMMM');
        const dateStr = date.format('YYYY-MM-DD');
        
        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) grouped[year][month] = {};
        if (!grouped[year][month][dateStr]) grouped[year][month][dateStr] = [];
        
        grouped[year][month][dateStr].push(appt);
      });
      
      resolve({ grouped, appointments: rows });
    });
  });
};

/**
 * Get available time slots for a specific date
 */
const getAvailableTimesForDate = (db, date) => {
  return new Promise((resolve, reject) => {
    // Get all available time slots between 2 PM and 8 PM with 30-minute intervals
    const allTimeSlots = [
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', 
      '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
    ];
    
    // Get booked times for this date (include both pending and completed appointments)
    console.log(`Fetching appointments for date: ${date}`);
    db.all('SELECT time, completed FROM appointments WHERE date = ?', [date], (err, rows) => {
      if (err) {
        console.error('Error fetching booked times:', err);
        reject(err);
        return;
      }
      
      console.log(`Raw appointment data for ${date}:`, rows);
      const bookedTimes = rows.map(row => row.time);
      console.log(`Booked times for ${date}:`, bookedTimes);
      
      // Filter out booked times and ensure proper spacing between appointments
      const availableTimes = allTimeSlots.filter(time => {
        // Check if this exact time is booked
        if (bookedTimes.includes(time)) {
          return false;
        }
        
        // Check if this time would conflict with existing appointments
        // Appointments are 1 hour long, need 30-minute gap between them
        const timeMoment = moment(`${date} ${time}`, 'YYYY-MM-DD h:mm A');
        const timeEnd = moment(timeMoment).add(1, 'hour'); // Appointment ends 1 hour later
        
        const hasConflict = bookedTimes.some(bookedTime => {
          const bookedMoment = moment(`${date} ${bookedTime}`, 'YYYY-MM-DD h:mm A');
          const bookedEnd = moment(bookedMoment).add(1, 'hour'); // Existing appointment ends 1 hour later
          
          // Check if appointments overlap OR are too close together
          // Need at least 30 minutes between appointments
          const gap1 = Math.abs(timeMoment.diff(bookedEnd, 'minutes')); // Gap between new start and existing end
          const gap2 = Math.abs(bookedMoment.diff(timeEnd, 'minutes')); // Gap between existing start and new end
          
          // Check for direct overlap first
          const hasOverlap = timeMoment.isBefore(bookedEnd) && timeEnd.isAfter(bookedMoment);
          if (hasOverlap) return true;
          
          // If no overlap, check for insufficient gap
          const hasInsufficientGap = gap1 < 30 || gap2 < 30;
          return hasInsufficientGap;
        });
        
        return !hasConflict;
      });
      
      // Debug logging
      console.log(`Date: ${date}, Booked times:`, bookedTimes, 'Available times:', availableTimes.length);
      
      resolve(availableTimes);
    });
  });
};

/**
 * Get booked times for a specific date
 */
const getBookedTimesForDate = (db, date) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM appointments WHERE date = ?', [date], (err, rows) => {
      if (err) {
        console.error('Error fetching booked times:', err);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

/**
 * Create a new appointment
 */
const createAppointment = (db, appointmentData) => {
  return new Promise((resolve, reject) => {
    const { date, time, client, category, payment, tip } = appointmentData;
    
    db.run(`
      INSERT INTO appointments (date, time, client, category, payment, tip, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [date, time, client, category, payment, tip || 0], function(err) {
      if (err) {
        console.error('Error creating appointment:', err);
        reject(err);
        return;
      }
      resolve({ id: this.lastID, message: 'Appointment created successfully' });
    });
  });
};

/**
 * Update an existing appointment
 */
const updateAppointment = (db, id, updates) => {
  return new Promise((resolve, reject) => {
    const { date, time, client, category, payment, tip } = updates;
    
    let sql = 'UPDATE appointments SET';
    const values = [];
    
    if (date !== undefined) {
      sql += ' date = ?';
      values.push(date);
    }
    
    if (time !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' time = ?';
      values.push(time);
    }
    
    if (client !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' client = ?';
      values.push(client);
    }
    
    if (category !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' category = ?';
      values.push(category);
    }
    
    if (payment !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' payment = ?';
      values.push(payment);
    }
    
    if (tip !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' tip = ?';
      values.push(tip);
    }
    
    if (values.length === 0) {
      reject(new Error('No fields to update'));
      return;
    }
    
    sql += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    values.push(id);
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Error updating appointment:', err);
        reject(err);
        return;
      }
      
      if (this.changes === 0) {
        reject(new Error('Appointment not found'));
        return;
      }
      
      resolve({ message: 'Appointment updated successfully' });
    });
  });
};

/**
 * Mark appointment as completed
 */
const completeAppointment = (db, id, tip) => {
  return new Promise((resolve, reject) => {
    const updateData = tip !== undefined ? 
      [tip, id] : 
      [id];
    
    const sql = tip !== undefined ?
      'UPDATE appointments SET completed = 1, tip = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?' :
      'UPDATE appointments SET completed = 1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(sql, updateData, function(err) {
      if (err) {
        console.error('Error completing appointment:', err);
        reject(err);
        return;
      }
      
      if (this.changes === 0) {
        reject(new Error('Appointment not found'));
        return;
      }
      
      resolve({ message: 'Appointment marked as completed' });
    });
  });
};

/**
 * Delete an appointment
 */
const deleteAppointment = (db, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting appointment:', err);
        reject(err);
        return;
      }
      
      if (this.changes === 0) {
        reject(new Error('Appointment not found'));
        return;
      }
      
      resolve({ message: 'Appointment cancelled successfully' });
    });
  });
};

/**
 * Search appointments by client details
 */
const searchAppointments = (db, clientName, time, dateString, completed = 'false') => {
  return new Promise((resolve, reject) => {
    // Simple search query
    const searchQuery = `
      SELECT * FROM appointments 
      WHERE client LIKE ? 
      AND time = ? 
      AND date = ?
      AND completed = ?
    `;
    
    const searchParams = [`%${clientName}%`, time, dateString, completed === 'true' ? 1 : 0];
    
    console.log('🔍 SQL Query:', searchQuery);
    console.log('🔍 Search Parameters:', searchParams);
    
    db.all(searchQuery, searchParams, (err, rows) => {
      if (err) {
        console.error('🔍 Database search error:', err);
        reject(err);
        return;
      }
      
      console.log('🔍 Search results:', rows.length, 'appointments found');
      if (rows.length > 0) {
        console.log('🔍 First result:', rows[0]);
      }
      resolve(rows);
    });
  });
};

/**
 * Get appointment by ID
 */
const getAppointmentById = (db, id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching appointment:', err);
        reject(err);
        return;
      }
      
      if (!row) {
        reject(new Error('Appointment not found'));
        return;
      }
      
      resolve(row);
    });
  });
};

/**
 * Get all expenses
 */
const getAllExpenses = (db) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM expenses ORDER BY date DESC', (err, rows) => {
      if (err) {
        console.error('Error fetching expenses:', err);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

/**
 * Get expenses by date range
 */
const getExpensesByDateRange = (db, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC', [startDate, endDate], (err, rows) => {
      if (err) {
        console.error('Error fetching expenses by date range:', err);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

/**
 * Get expense by ID
 */
const getExpenseById = (db, id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching expense:', err);
        reject(err);
        return;
      }
      
      if (!row) {
        reject(new Error('Expense not found'));
        return;
      }
      
      resolve(row);
    });
  });
};

/**
 * Create a new expense
 */
const createExpense = (db, expenseData) => {
  return new Promise((resolve, reject) => {
    const { date, description, amount, category } = expenseData;
    
    db.run(`
      INSERT INTO expenses (date, description, amount, category)
      VALUES (?, ?, ?, ?)
    `, [date, description, amount, category], function(err) {
      if (err) {
        console.error('Error creating expense:', err);
        reject(err);
        return;
      }
      resolve({ id: this.lastID, message: 'Expense created successfully' });
    });
  });
};

/**
 * Update an existing expense
 */
const updateExpense = (db, id, updates) => {
  return new Promise((resolve, reject) => {
    const { date, description, amount, category } = updates;
    
    let sql = 'UPDATE expenses SET';
    const values = [];
    
    if (date !== undefined) {
      sql += ' date = ?';
      values.push(date);
    }
    
    if (description !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' description = ?';
      values.push(description);
    }
    
    if (amount !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' amount = ?';
      values.push(amount);
    }
    
    if (category !== undefined) {
      if (values.length > 0) sql += ',';
      sql += ' category = ?';
      values.push(category);
    }
    
    if (values.length === 0) {
      reject(new Error('No fields to update'));
      return;
    }
    
    sql += ' WHERE id = ?';
    values.push(id);
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Error updating expense:', err);
        reject(err);
        return;
      }
      
      if (this.changes === 0) {
        reject(new Error('Expense not found'));
        return;
      }
      
      resolve({ message: 'Expense updated successfully' });
    });
  });
};

/**
 * Delete an expense
 */
const deleteExpense = (db, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting expense:', err);
        reject(err);
        return;
      }
      
      if (this.changes === 0) {
        reject(new Error('Expense not found'));
        return;
      }
      
      resolve({ message: 'Expense deleted successfully' });
    });
  });
};

/**
 * Get appointments in date range for reports
 */
const getAppointmentsInDateRange = (db, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM appointments WHERE date BETWEEN ? AND ? ORDER BY date ASC', [startDate, endDate], (err, rows) => {
      if (err) {
        console.error('Error fetching appointments in date range:', err);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

/**
 * Get today's appointments
 */
const getTodaysAppointments = (db) => {
  return new Promise((resolve, reject) => {
    const today = moment().format('YYYY-MM-DD');
    db.all('SELECT * FROM appointments WHERE date = ? ORDER BY time ASC', [today], (err, rows) => {
      if (err) {
        console.error('Error fetching today\'s appointments:', err);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

/**
 * Get total appointments count
 */
const getTotalAppointmentsCount = (db) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM appointments', (err, row) => {
      if (err) {
        console.error('Error getting total appointments count:', err);
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
};

/**
 * Get total revenue
 */
const getTotalRevenue = (db) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT SUM(payment) as total FROM appointments WHERE completed = 1', (err, row) => {
      if (err) {
        console.error('Error getting total revenue:', err);
        reject(err);
        return;
      }
      resolve(row.total || 0);
    });
  });
};

/**
 * Get total clients count
 */
const getTotalClientsCount = (db) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(DISTINCT client) as count FROM appointments', (err, row) => {
      if (err) {
        console.error('Error getting total clients count:', err);
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
};

module.exports = {
  getAllAppointments,
  getAppointmentsByDate,
  getAvailableTimesForDate,
  getBookedTimesForDate,
  createAppointment,
  updateAppointment,
  completeAppointment,
  deleteAppointment,
  searchAppointments,
  getAppointmentById,
  getAllExpenses,
  getExpensesByDateRange,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getAppointmentsInDateRange,
  getTodaysAppointments,
  getTotalAppointmentsCount,
  getTotalRevenue,
  getTotalClientsCount
};
