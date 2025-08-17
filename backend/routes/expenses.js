const express = require('express');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Get all expenses
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT * FROM expenses 
    ORDER BY date DESC
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    
    res.json(rows);
  });
});

// Get expenses grouped by month
router.get('/grouped', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT * FROM expenses 
    ORDER BY date DESC
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    
    // Group expenses by month
    const grouped = {};
    
    rows.forEach(expense => {
      const date = moment(expense.date);
      const monthKey = date.format('YYYY-MM');
      const monthName = date.format('MMMM YYYY');
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthName,
          expenses: [],
          total: 0
        };
      }
      
      grouped[monthKey].expenses.push(expense);
      grouped[monthKey].total += expense.amount;
    });
    
    // Convert to array and sort by month
    const groupedArray = Object.values(grouped).sort((a, b) => {
      const aDate = moment(a.expenses[0].date);
      const bDate = moment(b.expenses[0].date);
      return bDate.diff(aDate);
    });
    
    res.json(groupedArray);
  });
});

// Create new expense
router.post('/', [
  body('date').isISO8601().withMessage('Valid date required'),
  body('description').notEmpty().withMessage('Description required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
  body('category').notEmpty().withMessage('Category required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { date, description, amount, category } = req.body;
  
  // Validate date is not in the future
  const dateObj = moment(date);
  const today = moment().startOf('day');
  
  if (dateObj.isAfter(today)) {
    return res.status(400).json({ error: 'Cannot add expenses for future dates' });
  }
  
  const db = getDatabase();
  
  db.run(`
    INSERT INTO expenses (date, description, amount, category)
    VALUES (?, ?, ?, ?)
  `, [date, description, amount, category], function(err) {
    if (err) {
      console.error('Error creating expense:', err);
      return res.status(500).json({ error: 'Failed to create expense' });
    }
    
    res.status(201).json({
      id: this.lastID,
      date, description, amount, category
    });
  });
});

// Update expense
router.put('/:id', [
  body('date').optional().isISO8601(),
  body('description').optional().notEmpty(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().notEmpty()
], (req, res) => {
  const { id } = req.params;
  const { date, description, amount, category } = req.body;
  
  const db = getDatabase();
  
  // Get current expense
  db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching expense:', err);
      return res.status(500).json({ error: 'Failed to fetch expense' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    // Update fields
    const updates = [];
    const values = [];
    
    if (date !== undefined) {
      updates.push('date = ?');
      values.push(date);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (amount !== undefined) {
      updates.push('amount = ?');
      values.push(amount);
    }
    
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const sql = `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Error updating expense:', err);
        return res.status(500).json({ error: 'Failed to update expense' });
      }
      
      res.json({ message: 'Expense updated successfully' });
    });
  });
});

// Delete expense
router.delete('/:id', (req, res) => {
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
    
    res.json({ message: 'Expense deleted successfully' });
  });
});

module.exports = router;
