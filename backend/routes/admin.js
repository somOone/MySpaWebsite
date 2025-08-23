const express = require('express');
const moment = require('moment');
const { getDatabase } = require('../database/init');
const { body, validationResult } = require('express-validator');
const dbUtils = require('../utils/dbUtils');
const { sanitizeAppointmentData } = require('../utils/adminUtils');

const router = express.Router();

// Admin authentication temporarily disabled - will be re-enabled later

// ===== APPOINTMENTS ADMIN =====

// Get all appointments with search and filtering
router.get('/appointments', async (req, res) => {
  try {
    const { date, month, year, client, status, category } = req.query;
    const db = getDatabase();
    
    let query = `
      SELECT * FROM appointments 
      WHERE 1=1
    `;
    const params = [];
    
    if (date) {
      query += ` AND date = ?`;
      params.push(date);
    }
    
    if (month) {
      query += ` AND strftime('%m', date) = ?`;
      params.push(month.padStart(2, '0'));
    }
    
    if (year) {
      query += ` AND strftime('%Y', date) = ?`;
      params.push(year);
    }
    
    if (client) {
      query += ` AND LOWER(client) LIKE LOWER(?)`;
      params.push(`%${client}%`);
    }
    
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY date DESC, time ASC`;
    
    db.all(query, params, (err, appointments) => {
      if (err) {
        console.error('Error fetching appointments:', err);
        return res.status(500).json({ error: 'Failed to fetch appointments' });
      }
      res.json(appointments);
    });
  } catch (error) {
    console.error('Error in admin appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment (inline editing)
router.put('/appointments/:id', [
  body('date').notEmpty().isISO8601().withMessage('Valid date required'),
  body('time').notEmpty().withMessage('Time required'),
  body('client').notEmpty().withMessage('Client name required'),
  body('category').notEmpty().isIn(['Facial', 'Massage', 'Facial + Massage']).withMessage('Valid category required'),
  body('payment').notEmpty().isFloat({ min: 0 }).withMessage('Valid payment amount required'),
  body('tip').notEmpty().isFloat({ min: 0 }).withMessage('Valid tip amount required'),
  body('status').notEmpty().isIn(['pending', 'completed', 'cancelled']).withMessage('Valid status required'),
  body('update_reason').notEmpty().withMessage('Update reason is required for admin modifications')
], async (req, res) => {
  // Sanitize appointment data before validation
  req.body = sanitizeAppointmentData(req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date().toISOString();
    
    const db = getDatabase();
    
    // Build dynamic update query
    const fields = Object.keys(updateData).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);
    values.push(id);
    
    const query = `UPDATE appointments SET ${setClause} WHERE id = ?`;
    
    db.run(query, values, function(err) {
      if (err) {
        console.error('Error updating appointment:', err);
        return res.status(500).json({ error: 'Failed to update appointment' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Appointment updated successfully',
        changes: this.changes
      });
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/appointments/:id', [
  body('update_reason').notEmpty().withMessage('Update reason is required for admin deletions')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { update_reason } = req.body;
    const db = getDatabase();
    
    // Soft delete by updating status to 'cancelled' and adding reason
    const updateData = { status: 'cancelled', update_reason };
    const sanitizedData = sanitizeAppointmentData(updateData);
    
    db.run('UPDATE appointments SET status = ?, update_reason = ?, updated_at = ? WHERE id = ?', 
      [sanitizedData.status, sanitizedData.update_reason, sanitizedData.updated_at, id], 
      function(err) {
        if (err) {
          console.error('Error deleting appointment:', err);
          return res.status(500).json({ error: 'Failed to delete appointment' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Appointment not found' });
        }
        
        res.json({ 
          success: true, 
          message: 'Appointment cancelled successfully',
          changes: this.changes
        });
      });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// ===== EXPENSES ADMIN =====

// Get all expenses with search and filtering
router.get('/expenses', async (req, res) => {
  try {
    const { date, month, year, description, category_id, min_amount, max_amount } = req.query;
    const db = getDatabase();
    
    let query = `
      SELECT e.*, ec.name as category_name 
      FROM expenses e 
      LEFT JOIN expense_categories ec ON e.category_id = ec.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (date) {
      query += ` AND e.date = ?`;
      params.push(date);
    }
    
    if (month) {
      query += ` AND strftime('%m', e.date) = ?`;
      params.push(month.padStart(2, '0'));
    }
    
    if (year) {
      query += ` AND strftime('%Y', e.date) = ?`;
      params.push(year);
    }
    
    if (description) {
      query += ` AND LOWER(e.description) LIKE LOWER(?)`;
      params.push(`%${description}%`);
    }
    
    if (category_id) {
      query += ` AND e.category_id = ?`;
      params.push(category_id);
    }
    
    if (min_amount) {
      query += ` AND e.amount >= ?`;
      params.push(min_amount);
    }
    
    if (max_amount) {
      query += ` AND e.amount <= ?`;
      params.push(max_amount);
    }
    
    query += ` ORDER BY e.date DESC, e.created_at DESC`;
    
    db.all(query, params, (err, expenses) => {
      if (err) {
        console.error('Error fetching expenses:', err);
        return res.status(500).json({ error: 'Failed to fetch expenses' });
      }
      res.json(expenses);
    });
  } catch (error) {
    console.error('Error in admin expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Update expense (inline editing)
router.put('/expenses/:id', [
  body('date').optional().isISO8601().withMessage('Valid date required'),
  body('description').optional().notEmpty().withMessage('Description required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Valid amount required'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Valid category ID required')
], async (req, res) => {
  console.log('Expense update request:', { id: req.params.id, body: req.body });
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('Original updateData:', updateData);
    
    // Always set a fresh updated_at timestamp for admin modifications
    updateData.updated_at = new Date().toISOString();
    
    const db = getDatabase();
    
    // Build dynamic update query
    const fields = Object.keys(updateData).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);
    values.push(id);
    
    const query = `UPDATE expenses SET ${setClause} WHERE id = ?`;
    console.log('Update query:', query, 'Values:', values);
    
    db.run(query, values, function(err) {
      if (err) {
        console.error('Error updating expense:', err);
        return res.status(500).json({ error: 'Failed to update expense' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Expense updated successfully',
        changes: this.changes
      });
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting expense:', err);
        return res.status(500).json({ error: 'Failed to delete expense' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Expense deleted successfully',
        changes: this.changes
      });
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get expense categories for admin
router.get('/expense-categories', async (req, res) => {
  try {
    const db = getDatabase();
    db.all('SELECT * FROM expense_categories ORDER BY name', (err, categories) => {
      if (err) {
        console.error('Error fetching expense categories:', err);
        return res.status(500).json({ error: 'Failed to fetch expense categories' });
      }
      res.json(categories);
    });
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  }
});

// ===== ADMIN DASHBOARD STATS =====

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get appointment stats
    db.get('SELECT COUNT(*) as total, COUNT(CASE WHEN status = "completed" THEN 1 END) as completed, COUNT(CASE WHEN status = "pending" THEN 1 END) as pending, COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled FROM appointments', (err, appointmentStats) => {
      if (err) {
        console.error('Error fetching appointment stats:', err);
        return res.status(500).json({ error: 'Failed to fetch appointment stats' });
      }
      
      // Get expense stats
      db.get('SELECT COUNT(*) as total, SUM(amount) as total_amount FROM expenses', (err, expenseStats) => {
        if (err) {
          console.error('Error fetching expense stats:', err);
          return res.status(500).json({ error: 'Failed to fetch expense stats' });
        }
        
        // Get recent activity - simplified query
        db.all(`
          SELECT 'appointment' as type, id, client as name, date, created_at 
          FROM appointments 
          ORDER BY created_at DESC 
          LIMIT 5
        `, (err, appointmentActivity) => {
          if (err) {
            console.error('Error fetching appointment activity:', err);
            return res.status(500).json({ error: 'Failed to fetch appointment activity' });
          }
          
          db.all(`
            SELECT 'expense' as type, id, description as name, date, created_at 
            FROM expenses 
            ORDER BY created_at DESC 
            LIMIT 5
          `, (err, expenseActivity) => {
            if (err) {
              console.error('Error fetching expense activity:', err);
              return res.status(500).json({ error: 'Failed to fetch expense activity' });
            }
            
            const recentActivity = [...appointmentActivity, ...expenseActivity]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 10);
            
            res.json({
              appointments: appointmentStats,
              expenses: expenseStats,
              recentActivity
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

module.exports = router;
