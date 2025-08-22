const express = require('express');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const { getDatabase } = require('../database/init');
const dbUtils = require('../utils/dbUtils');

const router = express.Router();

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const expenses = await dbUtils.getAllExpenses(db);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expenses grouped by month
router.get('/grouped', async (req, res) => {
  try {
    const db = getDatabase();
    const expenses = await dbUtils.getAllExpenses(db);
    
    // Group expenses by month
    const grouped = {};
    
    expenses.forEach(expense => {
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
  } catch (error) {
    console.error('Error fetching grouped expenses:', error);
    res.status(500).json({ error: 'Failed to fetch grouped expenses' });
  }
});

// Get expenses by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const db = getDatabase();
    const expenses = await dbUtils.getExpensesByDateRange(db, startDate, endDate);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses by date range:', error);
    res.status(500).json({ error: 'Failed to fetch expenses by date range' });
  }
});

// Search expenses by description, amount, category, or date - following appointment search pattern
router.get('/search', (req, res) => {
  try {
    const { description, amount, category, date, year } = req.query;
    console.log('🔍 [BACKEND] Expense search request:', { description, amount, category, date, year });
    const db = getDatabase();
    
    let query = `
      SELECT e.*, ec.name as category_name 
      FROM expenses e 
      LEFT JOIN expense_categories ec ON e.category_id = ec.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (description) {
      query += ` AND LOWER(e.description) LIKE LOWER(?)`;
      params.push(`%${description}%`);
    }
    
    if (amount) {
      query += ` AND e.amount = ?`;
      params.push(parseFloat(amount));
    }
    
    if (category) {
      query += ` AND LOWER(ec.name) LIKE LOWER(?)`;
      params.push(`%${category}%`);
    }
    
    if (date) {
      // Handle date search like appointments - search for specific date
      query += ` AND e.date = ?`;
      params.push(date);
    }
    
    if (year) {
      // Handle year search like appointments
      query += ` AND strftime('%Y', e.date) = ?`;
      params.push(year);
    }
    
    query += ` ORDER BY e.date DESC, e.id DESC`;
    
    console.log('🔍 [BACKEND] Final query:', query);
    console.log('🔍 [BACKEND] Query params:', params);
    
    db.all(query, params, (err, expenses) => {
      if (err) {
        console.error('Error searching expenses:', err);
        return res.status(500).json({ error: 'Failed to search expenses' });
      }
      
      console.log('🔍 [BACKEND] Search results:', expenses.length, 'expenses found');
      console.log('🔍 [BACKEND] Results:', expenses);
      res.json(expenses);
    });
  } catch (error) {
    console.error('Error searching expenses:', error);
    res.status(500).json({ error: 'Failed to search expenses' });
  }
});

// Create new expense
router.post('/', [
  body('date').notEmpty().withMessage('Date is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category_id').isInt({ min: 1 }).withMessage('Category ID is required and must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({ error: firstError.msg });
    }
    
    const { date, description, amount, category_id } = req.body;
    const db = getDatabase();
    
    // Validate category_id exists and is active
    db.get('SELECT id FROM expense_categories WHERE id = ? AND is_active = 1', [category_id], (err, categoryRecord) => {
      if (err) {
        console.error('Error validating category_id:', err);
        return res.status(500).json({ error: 'Failed to validate category' });
      }
      
      if (!categoryRecord) {
        return res.status(400).json({ error: 'Invalid category_id provided' });
      }
      
      // Create expense with validated category_id
      const expenseData = { date, description, amount, category_id };
      
      dbUtils.createExpense(db, expenseData)
        .then(result => {
          res.status(201).json(result);
        })
        .catch(error => {
          console.error('Error creating expense:', error);
          res.status(500).json({ error: 'Failed to create expense' });
        });
    });
    
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', [
  body('date').optional().notEmpty().withMessage('Date cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({ error: firstError.msg });
    }
    
    const { id } = req.params;
    const { date, description, amount, category_id } = req.body;
    const db = getDatabase();
    
    // If category_id is provided, validate it exists
    if (category_id) {
      db.get('SELECT id FROM expense_categories WHERE id = ? AND is_active = 1', [category_id], (err, categoryRecord) => {
        if (err) {
          console.error('Error validating category_id:', err);
          return res.status(500).json({ error: 'Failed to validate category' });
        }
        
        if (!categoryRecord) {
          return res.status(400).json({ error: 'Invalid category_id provided' });
        }
        
        // Update expense with validated category_id
        updateExpenseWithCategory();
      });
    } else {
      // Update expense without category validation
      updateExpenseWithCategory();
    }
    
    function updateExpenseWithCategory() {
      const updates = {};
      if (date !== undefined) updates.date = date;
      if (description !== undefined) updates.description = description;
      if (amount !== undefined) updates.amount = amount;
      if (category_id !== undefined) updates.category_id = category_id;
      
      dbUtils.updateExpense(db, id, updates)
        .then(result => {
          res.json(result);
        })
        .catch(error => {
          console.error('Error updating expense:', error);
          if (error.message === 'Expense not found') {
            res.status(404).json({ error: 'Expense not found' });
          } else {
            res.status(500).json({ error: 'Failed to update expense' });
          }
        });
    }
    
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await dbUtils.deleteExpense(db, id);
    res.json(result);
    
  } catch (error) {
    console.error('Error deleting expense:', error);
    if (error.message === 'Expense not found') {
      res.status(404).json({ error: 'Expense not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  }
});

module.exports = router;
