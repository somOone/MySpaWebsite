const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Get all expense categories
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    
    db.all('SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY name', (err, categories) => {
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

// Get expense category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    db.get('SELECT * FROM expense_categories WHERE id = ? AND is_active = 1', [id], (err, category) => {
      if (err) {
        console.error('Error fetching expense category:', err);
        return res.status(500).json({ error: 'Failed to fetch expense category' });
      }
      
      if (!category) {
        return res.status(404).json({ error: 'Expense category not found' });
      }
      
      res.json(category);
    });
  } catch (error) {
    console.error('Error fetching expense category:', error);
    res.status(500).json({ error: 'Failed to fetch expense category' });
  }
});

// Create new expense category
router.post('/', [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional(),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, color = '#6B7280' } = req.body;
    const db = getDatabase();
    
    db.run(`
      INSERT INTO expense_categories (name, description, color, is_active, created_at)
      VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
    `, [name, description, color], function(err) {
      if (err) {
        console.error('Error creating expense category:', err);
        return res.status(500).json({ error: 'Failed to create expense category' });
      }
      
      res.status(201).json({
        id: this.lastID,
        name,
        description,
        color,
        is_active: true,
        message: 'Expense category created successfully'
      });
    });
  } catch (error) {
    console.error('Error creating expense category:', error);
    res.status(500).json({ error: 'Failed to create expense category' });
  }
});

// Update expense category
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional(),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;
    const db = getDatabase();
    
    // Get current category
    db.get('SELECT * FROM expense_categories WHERE id = ?', [id], (err, category) => {
      if (err) {
        console.error('Error fetching expense category:', err);
        return res.status(500).json({ error: 'Failed to fetch expense category' });
      }
      
      if (!category) {
        return res.status(404).json({ error: 'Expense category not found' });
      }
      
      // Build update query
      const updates = [];
      const values = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      
      if (color !== undefined) {
        updates.push('color = ?');
        values.push(color);
      }
      
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const sql = `UPDATE expense_categories SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) {
          console.error('Error updating expense category:', err);
          return res.status(500).json({ error: 'Failed to update expense category' });
        }
        
        res.json({ message: 'Expense category updated successfully' });
      });
    });
  } catch (error) {
    console.error('Error updating expense category:', error);
    res.status(500).json({ error: 'Failed to update expense category' });
  }
});

// Delete expense category (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Check if category is in use
    db.get('SELECT COUNT(*) as count FROM expenses WHERE category_id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error checking category usage:', err);
        return res.status(500).json({ error: 'Failed to check category usage' });
      }
      
      if (result.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category that has associated expenses. Use deactivation instead.' 
        });
      }
      
      // Soft delete by setting is_active to false
      db.run('UPDATE expense_categories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting expense category:', err);
          return res.status(500).json({ error: 'Failed to delete expense category' });
        }
        
        res.json({ message: 'Expense category deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    res.status(500).json({ error: 'Failed to delete expense category' });
  }
});

module.exports = router;
