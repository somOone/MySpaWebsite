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

// Create new expense
router.post('/', [
  body('date').notEmpty().withMessage('Date is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { date, description, amount, category } = req.body;
    const db = getDatabase();
    
    const result = await dbUtils.createExpense(db, { date, description, amount, category });
    res.status(201).json(result);
    
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
  body('category').optional().notEmpty().withMessage('Category cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();
    
    const result = await dbUtils.updateExpense(db, id, updates);
    res.json(result);
    
  } catch (error) {
    console.error('Error updating expense:', error);
    if (error.message === 'Expense not found') {
      res.status(404).json({ error: 'Expense not found' });
    } else {
      res.status(500).json({ error: 'Failed to update expense' });
    }
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
