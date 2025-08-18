import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Add print-specific CSS
const printStyles = `
  @media print {
    /* Hide the charts section completely */
    .charts-grid {
      display: none !important;
    }
    
    /* Make everything black and white */
    * {
      color: black !important;
      background: white !important;
      border-color: black !important;
    }
    
    /* Ensure tables have borders for readability */
    .table th,
    .table td {
      border: 1px solid black !important;
    }
    
    /* Remove shadows and backgrounds */
    .table-container,
    .feature-card {
      box-shadow: none !important;
      border: 1px solid black !important;
    }
    
    /* Ensure buttons are hidden in print */
    button {
      display: none !important;
    }
    
    /* Hide the generate reports section */
    .generate-reports-section {
      display: none !important;
    }
    
    /* Optimize page breaks */
    .table-container {
      page-break-inside: avoid;
    }
    
    /* Ensure proper spacing */
    h1, h3 {
      margin: 0.5rem 0 !important;
    }
  }
`;

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: moment().startOf('month').format('YYYY-MM-DD'),
    end_date: moment().endOf('month').format('YYYY-MM-DD')
  });
  const [tempDateRange, setTempDateRange] = useState({
    start_month: moment().format('MM'),
    start_year: moment().format('YYYY'),
    end_month: moment().format('MM'),
    end_year: moment().format('YYYY')
  });

  

  // Add print styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports', {
        params: dateRange
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch report whenever the memoized fetchReport changes
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleMonthYearChange = (type, field, value) => {
    setTempDateRange(prev => ({ 
      ...prev, 
      [`${type}_${field}`]: value 
    }));
  };

  const setCurrentMonth = () => {
    setDateRange({
      start_date: moment().startOf('month').format('YYYY-MM-DD'),
      end_date: moment().endOf('month').format('YYYY-MM-DD')
    });
  };

  const setCurrentYear = () => {
    setDateRange({
      start_date: moment().startOf('year').format('YYYY-MM-DD'),
      end_date: moment().endOf('year').format('YYYY-MM-DD')
    });
  };

  const openCustomModal = () => {
    setTempDateRange({
      start_month: moment(dateRange.start_date).format('MM'),
      start_year: moment(dateRange.start_date).format('YYYY'),
      end_month: moment(dateRange.end_date).format('MM'),
      end_year: moment(dateRange.end_date).format('YYYY')
    });
    setShowCustomModal(true);
  };

  const closeCustomModal = () => {
    setShowCustomModal(false);
  };

  const handleCustomReport = () => {
    // Convert month/year to start and end dates
    const startDate = moment(`${tempDateRange.start_year}-${tempDateRange.start_month}-01`).startOf('month');
    const endDate = moment(`${tempDateRange.end_year}-${tempDateRange.end_month}-01`).endOf('month');
    
    setDateRange({
      start_date: startDate.format('YYYY-MM-DD'),
      end_date: endDate.format('YYYY-MM-DD')
    });
    setShowCustomModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div>Loading report...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!reportData) {
    return <div>No report data available</div>;
  }

  const { summary, appointments, expenses } = reportData;

  return (
    <div className="reports-page">
      {/* Generate Reports Section */}
      <div className="table-container generate-reports-section">
        <div style={{ padding: '0.75rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>
            Generate Reports
          </h3>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <button 
                className="form-button" 
                onClick={setCurrentMonth}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '100%' }}
              >
                Current Month
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <button 
                className="form-button secondary" 
                onClick={setCurrentYear}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '100%' }}
              >
                Current Year
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <button 
                className="form-button" 
                onClick={openCustomModal}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '100%' }}
              >
                Custom Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
          {(() => {
            const startDate = moment(dateRange.start_date);
            const endDate = moment(dateRange.end_date);
            
            // Check if it's current month
            if (startDate.isSame(moment().startOf('month'), 'day') && 
                endDate.isSame(moment().endOf('month'), 'day')) {
              return `Monthly Report - ${startDate.format('MMMM YYYY')}`;
            }
            
            // Check if it's current year
            if (startDate.isSame(moment().startOf('year'), 'day') && 
                endDate.isSame(moment().endOf('year'), 'day')) {
              return `Yearly Report - ${startDate.format('YYYY')}`;
            }
            
            // Custom date range
            return `Financial Report - ${startDate.format('MMMM D, YYYY')} to ${endDate.format('MMMM D, YYYY')}`;
          })()}
        </h1>
        <button 
          onClick={handlePrint} 
          style={{ 
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#667eea',
            padding: '0.3rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            minHeight: '32px'
          }}
          title="Print Report"
        >
          🖨️
        </button>
      </div>



      {/* Summary Cards */}
      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>
            Financial Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <div className="feature-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>${summary.totalRevenue.toLocaleString()}</div>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: '#666' }}>Total Revenue</div>
            </div>
            
            <div className="feature-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>${summary.totalTips.toLocaleString()}</div>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: '#666' }}>Total Tips</div>
            </div>
            
            <div className="feature-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>${summary.totalExpenses.toLocaleString()}</div>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: '#666' }}>Total Expenses</div>
            </div>
            
            <div className="feature-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: summary.netProfit >= 0 ? '#28a745' : '#dc3545' }}>${summary.netProfit.toLocaleString()}</div>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: '#666' }}>Net Profit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {(() => {
        const startDate = moment(dateRange.start_date);
        const endDate = moment(dateRange.end_date);
        
        // Show chart for monthly reports, yearly reports, and custom reports
        // Only hide for very short date ranges (less than a month)
        const daysDiff = endDate.diff(startDate, 'days');
        return daysDiff >= 28; // Show chart if range is at least ~1 month
      })() && (
        <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
          {/* Bar Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Financial Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              {(() => {
                const startDate = moment(dateRange.start_date);
                const endDate = moment(dateRange.end_date);
                
                // Check if it's a monthly report (same month)
                if (startDate.isSame(endDate, 'month')) {
                  // For monthly reports, show daily data with stacked bars
                  const dailyData = [];
                  const current = startDate.clone();
                  
                  while (current.isSameOrBefore(endDate)) {
                    const dayAppointments = appointments.filter(apt => 
                      moment(apt.date).isSame(current, 'day')
                    );
                    const dayExpenses = expenses.filter(exp => 
                      moment(exp.date).isSame(current, 'day')
                    );
                    
                    const payments = dayAppointments.reduce((sum, apt) => sum + (apt.payment || 0), 0);
                    const tips = dayAppointments.reduce((sum, apt) => sum + (apt.tip || 0), 0);
                    const dayExpensesTotal = dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                    
                    dailyData.push({
                      date: current.format('MMM D'),
                      payments: payments,
                      tips: tips,
                      income: payments + tips,
                      expenses: dayExpensesTotal
                    });
                    
                    current.add(1, 'day');
                  }
                  
                  return (
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="payments" stackId="income" fill="#667eea" name="Payments" />
                      <Bar dataKey="tips" stackId="income" fill="#28a745" name="Tips" />
                      <Bar dataKey="expenses" fill="#dc3545" name="Expenses" />
                    </BarChart>
                  );
                } else if (startDate.isSame(endDate, 'year') && startDate.isSame(endDate, 'month')) {
                  // For single month reports, show daily data with stacked bars
                  const dailyData = [];
                  const current = startDate.clone();
                  
                  while (current.isSameOrBefore(endDate)) {
                    const dayAppointments = appointments.filter(apt => 
                      moment(apt.date).isSame(current, 'day')
                    );
                    const dayExpenses = expenses.filter(exp => 
                      moment(exp.date).isSame(current, 'day')
                    );
                    
                    const payments = dayAppointments.reduce((sum, apt) => sum + (apt.payment || 0), 0);
                    const tips = dayAppointments.reduce((sum, apt) => sum + (apt.tip || 0), 0);
                    const dayExpensesTotal = dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                    
                    dailyData.push({
                      date: current.format('MMM D'),
                      payments: payments,
                      tips: tips,
                      income: payments + tips,
                      expenses: dayExpensesTotal
                    });
                    
                    current.add(1, 'day');
                  }
                  
                  return (
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="payments" stackId="income" fill="#667eea" name="Payments" />
                      <Bar dataKey="tips" stackId="income" fill="#28a745" name="Tips" />
                      <Bar dataKey="expenses" fill="#dc3545" name="Expenses" />
                    </BarChart>
                  );
                } else if (startDate.isSame(moment(startDate.format('YYYY'), 'YYYY').startOf('year'), 'day') && 
                           endDate.isSame(moment(endDate.format('YYYY'), 'YYYY').endOf('year'), 'day')) {
                  // For full year reports (Jan 1 to Dec 31), show monthly data with stacked bars
                  const monthlyData = [];
                  
                  for (let month = 0; month < 12; month++) {
                    const monthStart = startDate.clone().month(month).startOf('month');
                    const monthEnd = monthStart.clone().endOf('month');
                    
                    const monthAppointments = appointments.filter(apt => 
                      moment(apt.date).isBetween(monthStart, monthEnd, 'day', '[]')
                    );
                    const monthExpenses = expenses.filter(exp => 
                      moment(exp.date).isBetween(monthStart, monthEnd, 'day', '[]')
                    );
                    
                    const payments = monthAppointments.reduce((sum, apt) => sum + (apt.payment || 0), 0);
                    const tips = monthAppointments.reduce((sum, apt) => sum + (apt.tip || 0), 0);
                    const monthExpensesTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                    
                    monthlyData.push({
                      month: monthStart.format('MMM'),
                      payments: payments,
                      tips: tips,
                      income: payments + tips,
                      expenses: monthExpensesTotal
                    });
                  }
                  
                  return (
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="payments" stackId="income" fill="#667eea" name="Payments" />
                      <Bar dataKey="tips" stackId="income" fill="#28a745" name="Tips" />
                      <Bar dataKey="expenses" fill="#dc3545" name="Expenses" />
                    </BarChart>
                  );
                } else {
                  // For custom date ranges, show monthly data with stacked bars
                  const monthlyData = [];
                  const startDate = moment(dateRange.start_date);
                  const endDate = moment(dateRange.end_date);
                  const current = startDate.clone();
                  
                  // Iterate month by month from start to end
                  while (current.isSameOrBefore(endDate, 'month')) {
                    const monthStart = current.clone().startOf('month');
                    const monthEnd = current.clone().endOf('month');
                    
                    // Filter appointments and expenses for this specific month
                    const monthAppointments = appointments.filter(apt => 
                      moment(apt.date).isBetween(monthStart, monthEnd, 'day', '[]')
                    );
                    const monthExpenses = expenses.filter(exp => 
                      moment(exp.date).isBetween(monthStart, monthEnd, 'day', '[]')
                    );
                    
                    const payments = monthAppointments.reduce((sum, apt) => sum + (apt.payment || 0), 0);
                    const tips = monthAppointments.reduce((sum, apt) => sum + (apt.tip || 0), 0);
                    const monthExpensesTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                    
                    monthlyData.push({
                      month: current.format('MMM YYYY'),
                      payments: payments,
                      tips: tips,
                      income: payments + tips,
                      expenses: monthExpensesTotal
                    });
                    
                    // Move to next month
                    current.add(1, 'month');
                  }
                  
                  return (
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="payments" stackId="income" fill="#667eea" name="Payments" />
                      <Bar dataKey="tips" stackId="income" fill="#28a745" name="Tips" />
                      <Bar dataKey="expenses" fill="#dc3545" name="Expenses" />
                    </BarChart>
                  );
                }
              })()}
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Payments', value: summary.totalRevenue, fill: '#667eea' },
                    { name: 'Tips', value: summary.totalTips, fill: '#28a745' },
                    { name: 'Expenses', value: summary.totalExpenses, fill: '#dc3545' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                  labelLine={false}
                >
                  {[
                    { name: 'Payments', value: summary.totalRevenue, fill: '#667eea' },
                    { name: 'Tips', value: summary.totalTips, fill: '#28a745' },
                    { name: 'Expenses', value: summary.totalExpenses, fill: '#dc3545' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>
            Appointments ({summary.totalAppointments})
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Client</th>
                <th>Service</th>
                <th>Payment</th>
                <th>Tip</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{moment(appt.date).format('MMM D, YYYY')}</td>
                  <td>{appt.time}</td>
                  <td>{appt.client}</td>
                  <td>{appt.category}</td>
                  <td>${appt.payment.toFixed(2)}</td>
                  <td>${(appt.tip || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile card layout for appointments */}
          <div className="mobile-cards">
            {appointments.map((appt) => (
              <div key={appt.id} className="appointment-card">
                <div className="card-header">
                  <span className="time">{moment(appt.date).format('MMM D, YYYY')}</span>
                  <span className="status">{appt.time}</span>
                </div>
                
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">Client:</span>
                    <span className="value">{appt.client}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Service:</span>
                    <span className="value">{appt.category}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Payment:</span>
                    <span className="value">${appt.payment.toFixed(2)}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Tip:</span>
                    <span className="value">${(appt.tip || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <div style={{ padding: '0.75rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>
            Expenses ({summary.totalExpenseItems})
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{moment(exp.date).format('MMM D, YYYY')}</td>
                  <td>{exp.description}</td>
                  <td>{exp.category}</td>
                  <td>${exp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile card layout for expenses */}
          <div className="mobile-cards">
            {expenses.map((exp) => (
              <div key={exp.id} className="appointment-card">
                <div className="card-header">
                  <span className="time">{moment(exp.date).format('MMM D, YYYY')}</span>
                  <span className="status">{exp.category}</span>
                </div>
                
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">Description:</span>
                    <span className="value">{exp.description}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Category:</span>
                    <span className="value">{exp.category}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Amount:</span>
                    <span className="value">${exp.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Report Modal */}
      {showCustomModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>Custom Report</h3>
              <button 
                onClick={closeCustomModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Start Month</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select
                    value={tempDateRange.start_month || ''}
                    onChange={(e) => handleMonthYearChange('start', 'month', e.target.value)}
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  >
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  <select
                    value={tempDateRange.start_year || ''}
                    onChange={(e) => handleMonthYearChange('start', 'year', e.target.value)}
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  >
                    <option value="">Select Year</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>End Month</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select
                    value={tempDateRange.end_month || ''}
                    onChange={(e) => handleMonthYearChange('end', 'month', e.target.value)}
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  >
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  <select
                    value={tempDateRange.end_year || ''}
                    onChange={(e) => handleMonthYearChange('end', 'year', e.target.value)}
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  >
                    <option value="">Select Year</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                className="form-button secondary" 
                onClick={closeCustomModal}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                className="form-button" 
                onClick={handleCustomReport}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
