// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

// Import routes
const appointmentsRoutes = require('./routes/appointments');
const expensesRoutes = require('./routes/expenses');
const expenseCategoriesRoutes = require('./routes/expenseCategories');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const { router: adminAuthRoutes, requireAuth } = require('./routes/adminAuth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database initialization
const { initializeDatabase } = require('./database/init');
initializeDatabase();

// Initialize morning digest service
const MorningDigestService = require('./services/morningDigestService');

// Start morning digest service
let morningDigestService;
try {
  morningDigestService = new MorningDigestService();
  morningDigestService.start();
} catch (error) {
  console.error('❌ Failed to start morning digest service:', error);
  morningDigestService = null;
}

// Routes
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/expense-categories', expenseCategoriesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MySpaWebsite API is running' });
});

// Test endpoint for morning digest (remove in production)
app.get('/api/test/morning-digest', async (req, res) => {
  if (!morningDigestService) {
    return res.status(503).json({ 
      error: 'Morning digest service not available',
      message: 'Service failed to initialize or is not running'
    });
  }
  
  try {
    await morningDigestService.triggerNow();
    res.json({ 
      status: 'success', 
      message: 'Morning digest triggered successfully',
      serviceStatus: morningDigestService.getStatus()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to trigger morning digest',
      message: error.message 
    });
  }
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
