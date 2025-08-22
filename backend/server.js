const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const appointmentsRoutes = require('./routes/appointments');
const expensesRoutes = require('./routes/expenses');
const expenseCategoriesRoutes = require('./routes/expenseCategories');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const { initializeDatabase } = require('./database/init');
initializeDatabase();

// Routes
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/expense-categories', expenseCategoriesRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MySpaWebsite API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 MySpaWebsite Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
