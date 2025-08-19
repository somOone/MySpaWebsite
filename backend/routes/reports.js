const express = require('express');
const moment = require('moment');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Get financial report for a date range
router.get('/', (req, res) => {
  const { start_date, end_date } = req.query;
  
  // Default to current month if no dates provided
  let start, end;
  if (start_date && end_date) {
    start = moment(start_date);
    end = moment(end_date);
  } else {
    start = moment().startOf('month');
    end = moment().endOf('month');
  }
  
  const db = getDatabase();
  
  // Get appointments in date range
  db.all(`
    SELECT * FROM appointments 
    WHERE date BETWEEN ? AND ? AND status = 'completed'
    ORDER BY date ASC
  `, [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')], (err, appointments) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    
    // Get expenses in date range
    db.all(`
      SELECT * FROM expenses 
      WHERE date BETWEEN ? AND ?
      ORDER BY date ASC
    `, [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')], (err, expenses) => {
      if (err) {
        console.error('Error fetching expenses:', err);
        return res.status(500).json({ error: 'Failed to fetch expenses' });
      }
      
      // Calculate totals
      const totalRevenue = appointments.reduce((sum, appt) => sum + appt.payment, 0);
      const totalTips = appointments.reduce((sum, appt) => sum + (appt.tip || 0), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const netProfit = totalRevenue + totalTips - totalExpenses;
      
      // Group by month for charts
      const monthlyData = {};
      
      appointments.forEach(appt => {
        const monthKey = moment(appt.date).format('YYYY-MM');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: moment(appt.date).format('MMMM YYYY'),
            revenue: 0,
            tips: 0,
            appointments: 0
          };
        }
        monthlyData[monthKey].revenue += appt.payment;
        monthlyData[monthKey].tips += (appt.tip || 0);
        monthlyData[monthKey].appointments += 1;
      });
      
      expenses.forEach(exp => {
        const monthKey = moment(exp.date).format('YYYY-MM');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: moment(exp.date).format('MMMM YYYY'),
            revenue: 0,
            tips: 0,
            appointments: 0,
            expenses: 0
          };
        }
        if (!monthlyData[monthKey].expenses) {
          monthlyData[monthKey].expenses = 0;
        }
        monthlyData[monthKey].expenses += exp.amount;
      });
      
      // Convert to arrays for charts
      const chartLabels = Object.values(monthlyData).map(d => d.month);
      const chartRevenue = Object.values(monthlyData).map(d => d.revenue);
      const chartTips = Object.values(monthlyData).map(d => d.tips);
      const chartExpenses = Object.values(monthlyData).map(d => d.expenses || 0);
      
      res.json({
        period: {
          start: start.format('MMMM D, YYYY'),
          end: end.format('MMMM D, YYYY'),
          isCurrentMonth: start.isSame(moment(), 'month')
        },
        summary: {
          totalRevenue,
          totalTips,
          totalExpenses,
          netProfit,
          totalAppointments: appointments.length,
          totalExpenseItems: expenses.length
        },
        appointments,
        expenses,
        charts: {
          labels: chartLabels,
          revenue: chartRevenue,
          tips: chartTips,
          expenses: chartExpenses
        }
      });
    });
  });
});

// Get current month report
router.get('/current-month', (req, res) => {
  const start = moment().startOf('month');
  const end = moment().endOf('month');
  
  // Redirect to main reports endpoint with current month dates
  res.redirect(`/api/reports?start_date=${start.format('YYYY-MM-DD')}&end_date=${end.format('YYYY-MM-DD')}`);
});

// Get current year report
router.get('/current-year', (req, res) => {
  const start = moment().startOf('year');
  const end = moment().endOf('year');
  
  // Redirect to main reports endpoint with current year dates
  res.redirect(`/api/reports?start_date=${start.format('YYYY-MM-DD')}&end_date=${end.format('YYYY-MM-DD')}`);
});

// Get dashboard statistics
router.get('/dashboard', (req, res) => {
  const db = getDatabase();
  
  // Get today's date
  const today = moment().format('YYYY-MM-DD');
  
  // Get today's appointments (excluding cancelled)
  db.all('SELECT * FROM appointments WHERE date = ? AND status != "cancelled"', [today], (err, todayAppointments) => {
    if (err) {
      console.error('Error fetching today\'s appointments:', err);
      return res.status(500).json({ error: 'Failed to fetch today\'s appointments' });
    }
    
    // Get total appointments count
    db.get('SELECT COUNT(*) as count FROM appointments', (err, totalAppointments) => {
      if (err) {
        console.error('Error fetching total appointments:', err);
        return res.status(500).json({ error: 'Failed to fetch total appointments' });
      }
        
      // Get total revenue
      db.get('SELECT SUM(payment) as total FROM appointments WHERE status = \'completed\'', (err, totalRevenue) => {
        if (err) {
          console.error('Error fetching total revenue:', err);
          return res.status(500).json({ error: 'Failed to fetch total revenue' });
        }
          
        // Get unique clients count
        db.get('SELECT COUNT(DISTINCT client) as count FROM appointments', (err, totalClients) => {
          if (err) {
            console.error('Error fetching total clients:', err);
            return res.status(500).json({ error: 'Failed to fetch total clients' });
          }
            
          // Get spa service statistics - all time
          db.all('SELECT category, COUNT(*) as count FROM appointments WHERE status = \'completed\' GROUP BY category', (err, serviceStats) => {
            if (err) {
              console.error('Error fetching service statistics:', err);
              return res.status(500).json({ error: 'Failed to fetch service statistics' });
            }
            
            // Get spa service statistics - current year
            const currentYear = moment().format('YYYY');
            db.all('SELECT category, COUNT(*) as count FROM appointments WHERE status = \'completed\' AND strftime("%Y", date) = ? GROUP BY category', [currentYear], (err, currentYearServiceStats) => {
              if (err) {
                console.error('Error fetching current year service statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch current year service statistics' });
              }
              
              // Process service statistics
              const processServiceStats = (stats) => {
                const result = {
                  massages: 0,
                  facials: 0,
                  combos: 0
                };
                
                stats.forEach(stat => {
                  if (stat.category === 'Massage') {
                    result.massages = stat.count;
                  } else if (stat.category === 'Facial') {
                    result.facials = stat.count;
                  } else if (stat.category === 'Facial + Massage') {
                    result.combos = stat.count;
                  }
                });
                
                return result;
              };
              
              const allTimeServices = processServiceStats(serviceStats);
              const currentYearServices = processServiceStats(currentYearServiceStats);
              
              res.json({
                today: {
                  date: today,
                  appointments: todayAppointments.length,
                  revenue: todayAppointments.reduce((sum, appt) => sum + appt.payment, 0)
                },
                totals: {
                  appointments: totalAppointments.count || 0,
                  revenue: totalRevenue.total || 0,
                  clients: totalClients.count || 0
                },
                spaServices: {
                  allTime: allTimeServices,
                  currentYear: currentYearServices
                }
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
