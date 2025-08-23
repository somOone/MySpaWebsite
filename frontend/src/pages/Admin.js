import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import AdminLogin from '../components/AdminLogin';
import './Admin.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Helper function to format dates without timezone issues
  const formatDateSafe = (dateString) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, parse it safely
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return format(date, 'MMM dd, yyyy');
    }
    
    // For other formats, use the original approach
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return format(date, 'MMM dd, yyyy');
    }
    
    return dateString;
  };

  // Authentication functions
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/auth/status', { withCredentials: true });
      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setAdminUsername(response.data.username);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }
  };

  const handleLoginSuccess = (username) => {
    setIsAuthenticated(true);
    setAdminUsername(username);
    setError('');
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5001/api/admin/auth/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setAdminUsername('');
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Data states
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  
  // Search and filter states
  const [appointmentFilters, setAppointmentFilters] = useState({
    date: '',
    month: '',
    year: '',
    client: '',
    status: '',
    category: ''
  });
  
  const [expenseFilters, setExpenseFilters] = useState({
    date: '',
    month: '',
    year: '',
    description: '',
    category_id: '',
    min_amount: '',
    max_amount: ''
  });
  
  // Inline editing states
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load dashboard data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsResponse, categoriesResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/stats', { withCredentials: true }),
        axios.get('http://localhost:5001/api/admin/expense-categories', { withCredentials: true })
      ]);
      
      setStats(statsResponse.data);
      setExpenseCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(appointmentFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`http://localhost:5001/api/admin/appointments?${queryParams}`, { withCredentials: true });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }, [appointmentFilters]);

  const loadExpenses = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(expenseFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`http://localhost:5001/api/admin/expenses?${queryParams}`, { withCredentials: true });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  }, [expenseFilters]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardData();
    } else if (activeTab === 'appointments') {
      loadAppointments();
    } else if (activeTab === 'expenses') {
      loadExpenses();
    }
  }, [activeTab, loadDashboardData, loadAppointments, loadExpenses]);

  // Pricing constants
  const categoryPrices = {
    'Facial': 100.00,
    'Massage': 120.00,
    'Facial + Massage': 200.00
  };

  // Inline editing functions
  const startEditingAppointment = (appointment) => {
    // Debug: Log the original time value
    console.log('Original appointment time:', appointment.time, 'Type:', typeof appointment.time);
    
    // Ensure time is in the correct format for HTML time input (HH:MM)
    let formattedTime = appointment.time;
    
    // Convert time formats like "2:30 PM" to "14:30" for HTML time input
    if (formattedTime && formattedTime.includes(':')) {
      try {
        // Handle 12-hour format like "2:30 PM"
        if (formattedTime.toLowerCase().includes('pm') || formattedTime.toLowerCase().includes('am')) {
          const timeParts = formattedTime.match(/(\d+):(\d+)\s*(am|pm)/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = timeParts[2];
            const period = timeParts[3].toLowerCase();
            
            if (period === 'pm' && hours !== 12) {
              hours += 12;
            } else if (period === 'pm' && hours === 12) {
              hours = 12;
            } else if (period === 'am' && hours === 12) {
              hours = 0;
            }
            
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
          }
        } else {
          // Handle 24-hour format like "14:30" or "2:30"
          const timeParts = formattedTime.split(':');
          if (timeParts.length === 2) {
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
              formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
          }
        }
      } catch (error) {
        console.warn('Error formatting time:', error);
        formattedTime = '';
      }
    }
    
    console.log('Formatted time for input:', formattedTime);
    
    // If formatting failed, try to extract just the time part
    if (!formattedTime && appointment.time) {
      const timeMatch = appointment.time.match(/(\d+):(\d+)/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
          console.log('Fallback formatted time:', formattedTime);
        }
      }
    }
    
    // Ensure the date is properly formatted for HTML date input (YYYY-MM-DD)
    let formattedDate = appointment.date;
    if (appointment.date) {
      // If it's already a string in YYYY-MM-DD format, use it
      if (typeof appointment.date === 'string' && appointment.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = appointment.date;
      } else {
        // Convert to YYYY-MM-DD format using local timezone to avoid date shifting
        const date = new Date(appointment.date);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }
    }
    
    setEditingAppointment({ 
      ...appointment, 
      time: formattedTime || '',
      date: formattedDate,
      update_reason: '' // Initialize update reason
    });
  };

  const handleCategoryChange = (newCategory) => {
    if (editingAppointment) {
      setEditingAppointment(prev => ({
        ...prev,
        category: newCategory,
        payment: categoryPrices[newCategory] // Automatically update payment
      }));
    }
  };

  const saveAppointmentEdit = async () => {
    try {
      // Validate required fields
      if (!editingAppointment.update_reason || editingAppointment.update_reason.trim() === '') {
        setError('Update reason is required for admin modifications');
        return;
      }
      
      // Convert data formats for backend validation
      const appointmentData = { ...editingAppointment };
      
      // Convert 24-hour time back to 12-hour format for backend
      if (appointmentData.time && appointmentData.time.includes(':')) {
        const [hours, minutes] = appointmentData.time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        appointmentData.time = `${displayHour}:${minutes} ${ampm}`;
      }
      
      // Ensure date is in ISO8601 format (YYYY-MM-DD) - use the string directly to avoid timezone issues
      if (appointmentData.date) {
        // The HTML date input already gives us YYYY-MM-DD format, so use it directly
        // This prevents timezone conversion issues
        if (typeof appointmentData.date === 'string' && appointmentData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Date is already in correct format, no conversion needed
          appointmentData.date = appointmentData.date;
        } else {
          // Fallback for any other format
          const date = new Date(appointmentData.date);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            appointmentData.date = `${year}-${month}-${day}`;
          }
        }
      }
      
      await axios.put(`http://localhost:5001/api/admin/appointments/${editingAppointment.id}`, appointmentData, { withCredentials: true });
      setSuccess('Appointment updated successfully!');
      setEditingAppointment(null);
      loadAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update appointment');
    }
  };

  const cancelAppointmentEdit = () => {
    setEditingAppointment(null);
  };

  const startEditingExpense = (expense) => {
    // Ensure the date is properly formatted for HTML date input (YYYY-MM-DD)
    let formattedDate = expense.date;
    if (expense.date) {
      // If it's already a string in YYYY-MM-DD format, use it
      if (typeof expense.date === 'string' && expense.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = expense.date;
      } else {
        // Convert to YYYY-MM-DD format using local timezone to avoid date shifting
        const date = new Date(expense.date);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }
    }
    
    setEditingExpense({ 
      ...expense, 
      date: formattedDate 
    });
  };

  const saveExpenseEdit = async () => {
    try {
      // Ensure date is in the correct format for backend
      let formattedDate = editingExpense.date;
      if (editingExpense.date) {
        // If it's already in YYYY-MM-DD format, use it
        if (typeof editingExpense.date === 'string' && editingExpense.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          formattedDate = editingExpense.date;
        } else {
          // Convert to YYYY-MM-DD format using local timezone to avoid date shifting
          const date = new Date(editingExpense.date);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
        }
      }
      
      // Only send the fields that should be updated
      const updateData = {
        date: formattedDate,
        description: editingExpense.description,
        amount: editingExpense.amount,
        category_id: editingExpense.category_id
      };
      
      await axios.put(`http://localhost:5001/api/admin/expenses/${editingExpense.id}`, updateData, { withCredentials: true });
      setSuccess('Expense updated successfully!');
      setEditingExpense(null);
      loadExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update expense');
    }
  };

  const cancelExpenseEdit = () => {
    setEditingExpense(null);
  };

  const deleteAppointment = async (id) => {
    const reason = prompt('Please provide a reason for cancelling this appointment (required):');
    if (!reason || reason.trim() === '') {
      setError('Reason is required for cancelling appointments');
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5001/api/admin/appointments/${id}`, {
        data: { update_reason: reason.trim() }
      }, { withCredentials: true });
      setSuccess('Appointment cancelled successfully!');
      loadAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/admin/expenses/${id}`, { withCredentials: true });
      setSuccess('Expense deleted successfully!');
      loadExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete expense');
    }
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Admin interface
  return (
    <div className="admin-interface">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>⚙️ Admin Panel</h1>
            <p>Database management interface</p>
          </div>
          {isAuthenticated && (
            <div className="admin-header-actions">
              <span className="admin-username">👤 {adminUsername}</span>
              <button onClick={handleLogout} className="admin-logout-button">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <nav className="admin-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === 'appointments' ? 'active' : ''}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appointments
        </button>
        <button
          className={activeTab === 'expenses' ? 'active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          💰 Expenses
        </button>
      </nav>

      <main className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>📅 Appointments</h3>
                <div className="stat-numbers">
                  <div className="stat-main">{stats.appointments.total}</div>
                  <div className="stat-breakdown">
                    <span className="stat-item completed">{stats.appointments.completed} completed</span>
                    <span className="stat-item pending">{stats.appointments.pending} pending</span>
                    <span className="stat-item cancelled">{stats.appointments.cancelled} cancelled</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <h3>💰 Expenses</h3>
                <div className="stat-numbers">
                  <div className="stat-main">{stats.expenses.total}</div>
                  <div className="stat-breakdown">
                    <span className="stat-item">${stats.expenses.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>🕒 Recent Activity</h3>
              <div className="activity-list">
                {stats.recentActivity?.map((activity, index) => (
                  <div key={index} className={`activity-item ${activity.type}`}>
                    <span className="activity-icon">
                      {activity.type === 'appointment' ? '📅' : '💰'}
                    </span>
                    <span className="activity-name">{activity.name}</span>
                    <span className="activity-date">{format(new Date(activity.date), 'MMM dd')}</span>
                    <span className="activity-time">{format(new Date(activity.created_at), 'HH:mm')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="appointments-admin">
            <div className="filters-section">
              <h3>🔍 Search & Filter</h3>
              <div className="filters-grid">
                <input
                  type="date"
                  value={appointmentFilters.date}
                  onChange={(e) => setAppointmentFilters(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="Date"
                />
                <input
                  type="number"
                  value={appointmentFilters.month}
                  onChange={(e) => setAppointmentFilters(prev => ({ ...prev, month: e.target.value }))}
                  placeholder="Month (1-12)"
                  min="1"
                  max="12"
                />
                <input
                  type="number"
                  value={appointmentFilters.year}
                  onChange={(e) => setAppointmentFilters(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="Year"
                  min="2020"
                  max="2030"
                />
                <input
                  type="text"
                  value={appointmentFilters.client}
                  onChange={(e) => setAppointmentFilters(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Client name"
                />
                <select
                  value={appointmentFilters.status}
                  onChange={(e) => setAppointmentFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={appointmentFilters.category}
                  onChange={(e) => setAppointmentFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  <option value="Facial">Facial</option>
                  <option value="Massage">Massage</option>
                  <option value="Facial + Massage">Facial + Massage</option>
                </select>
              </div>
              <button onClick={loadAppointments} className="search-button">
                🔍 Search
              </button>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Client</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>Update Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <input
                            type="date"
                            value={editingAppointment.date}
                            onChange={(e) => setEditingAppointment(prev => ({ ...prev, date: e.target.value }))}
                            required
                            className="edit-input"
                          />
                        ) : (
                          formatDateSafe(appointment.date)
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <input
                            type="time"
                            value={editingAppointment.time || ''}
                            onChange={(e) => setEditingAppointment(prev => ({ ...prev, time: e.target.value }))}
                            required
                          />
                        ) : (
                          appointment.time
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <input
                            type="text"
                            value={editingAppointment.client}
                            onChange={(e) => setEditingAppointment(prev => ({ ...prev, client: e.target.value }))}
                            required
                            className="edit-input"
                          />
                        ) : (
                          appointment.client
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <select
                            value={editingAppointment.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            required
                            className="edit-input"
                          >
                            <option value="Facial">Facial</option>
                            <option value="Massage">Massage</option>
                            <option value="Facial + Massage">Facial + Massage</option>
                          </select>
                        ) : (
                          appointment.category
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingAppointment.payment}
                            onChange={(e) => setEditingAppointment(prev => ({ ...prev, payment: parseFloat(e.target.value) }))}
                            required
                            min="0"
                            className="edit-input"
                          />
                        ) : (
                          `$${appointment.payment}`
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingAppointment.tip}
                            onChange={(e) => setEditingAppointment(prev => ({ ...prev, tip: parseFloat(e.target.value) }))}
                            required
                            min="0"
                            className="edit-input"
                          />
                        ) : (
                          `$${appointment.tip || 0}`
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <select
                            value={editingAppointment.status}
                            onChange={(e) => setEditingAppointment(prev => ({ ...prev, status: e.target.value }))}
                            required
                            className="edit-input"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`status-${appointment.status}`}>
                            {appointment.status}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <input
                            type="text"
                            value={editingAppointment.update_reason || ''}
                            onChange={(e) => setEditingAppointment(prev => ({ ...prev, update_reason: e.target.value }))}
                            placeholder="Reason for change (required)"
                            required
                          />
                        ) : (
                          appointment.update_reason || '-'
                        )}
                      </td>
                      <td>
                        {editingAppointment?.id === appointment.id ? (
                          <div className="edit-actions">
                            <button onClick={saveAppointmentEdit} className="save-button">
                              ✅ Save
                            </button>
                            <button onClick={cancelAppointmentEdit} className="cancel-button">
                              ❌ Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="row-actions">
                            <button onClick={() => startEditingAppointment(appointment)} className="edit-button">
                              ✏️ Edit
                            </button>
                            <button onClick={() => deleteAppointment(appointment.id)} className="delete-button">
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="appointments-mobile">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-card-header">
                    <div className="appointment-card-title">{appointment.client}</div>
                    <span className={`appointment-card-status status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="appointment-card-content">
                    <div className="appointment-card-field">
                      <div className="appointment-card-label">Date</div>
                      <div className="appointment-card-value">
                        {formatDateSafe(appointment.date)}
                      </div>
                    </div>
                    <div className="appointment-card-field">
                      <div className="appointment-card-label">Time</div>
                      <div className="appointment-card-value">{appointment.time}</div>
                    </div>
                    <div className="appointment-card-field">
                      <div className="appointment-card-label">Category</div>
                      <div className="appointment-card-value">{appointment.category}</div>
                    </div>
                    <div className="appointment-card-field">
                      <div className="appointment-card-label">Payment</div>
                      <div className="appointment-card-value">${appointment.payment}</div>
                    </div>
                    <div className="appointment-card-field">
                      <div className="appointment-card-label">Tip</div>
                      <div className="appointment-card-value">${appointment.tip || 0}</div>
                    </div>
                    <div className="appointment-card-field">
                      <div className="appointment-card-label">Update Reason</div>
                      <div className="appointment-card-value">{appointment.update_reason || '-'}</div>
                    </div>
                  </div>
                  
                  <div className="appointment-card-actions">
                    <button onClick={() => startEditingAppointment(appointment)} className="edit-button">
                      ✏️ Edit
                    </button>
                    <button onClick={() => deleteAppointment(appointment.id)} className="delete-button">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="expenses-admin">
            <div className="filters-section">
              <h3>🔍 Search & Filter</h3>
              <div className="filters-grid">
                <input
                  type="date"
                  value={expenseFilters.date}
                  onChange={(e) => setExpenseFilters(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="Date"
                />
                <input
                  type="number"
                  value={expenseFilters.month}
                  onChange={(e) => setExpenseFilters(prev => ({ ...prev, month: e.target.value }))}
                  placeholder="Month (1-12)"
                  min="1"
                  max="12"
                />
                <input
                  type="number"
                  value={expenseFilters.year}
                  onChange={(e) => setExpenseFilters(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="Year"
                  min="2020"
                  max="2030"
                />
                <input
                  type="text"
                  value={expenseFilters.description}
                  onChange={(e) => setExpenseFilters(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                />
                <select
                  value={expenseFilters.category_id}
                  onChange={(e) => setExpenseFilters(prev => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {expenseCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={expenseFilters.min_amount}
                  onChange={(e) => setExpenseFilters(prev => ({ ...prev, min_amount: e.target.value }))}
                  placeholder="Min amount"
                />
                <input
                  type="number"
                  step="0.01"
                  value={expenseFilters.max_amount}
                  onChange={(e) => setExpenseFilters(prev => ({ ...prev, max_amount: e.target.value }))}
                  placeholder="Max amount"
                />
              </div>
              <button onClick={loadExpenses} className="search-button">
                🔍 Search
              </button>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id}>
                      <td>{expense.id}</td>
                      <td>
                        {editingExpense?.id === expense.id ? (
                          <input
                            type="date"
                            value={editingExpense.date}
                            onChange={(e) => setEditingExpense(prev => ({ ...prev, date: e.target.value }))}
                          />
                        ) : (
                          formatDateSafe(expense.date)
                        )}
                      </td>
                      <td>
                        {editingExpense?.id === expense.id ? (
                          <input
                            type="text"
                            value={editingExpense.description}
                            onChange={(e) => setEditingExpense(prev => ({ ...prev, description: e.target.value }))}
                          />
                        ) : (
                          expense.description
                        )}
                      </td>
                      <td>
                        {editingExpense?.id === expense.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingExpense.amount}
                            onChange={(e) => setEditingExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                          />
                        ) : (
                          `$${expense.amount}`
                        )}
                      </td>
                      <td>
                        {editingExpense?.id === expense.id ? (
                          <select
                            value={editingExpense.category_id}
                            onChange={(e) => setEditingExpense(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                          >
                            {expenseCategories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          expense.category_name || 'Uncategorized'
                        )}
                      </td>
                      <td>
                        {editingExpense?.id === expense.id ? (
                          <div className="edit-actions">
                            <button onClick={saveExpenseEdit} className="save-button">
                              ✅ Save
                            </button>
                            <button onClick={cancelExpenseEdit} className="cancel-button">
                              ❌ Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="row-actions">
                            <button onClick={() => startEditingExpense(expense)} className="edit-button">
                              ✏️ Edit
                            </button>
                            <button onClick={() => deleteExpense(expense.id)} className="delete-button">
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="expenses-mobile">
              {expenses.map(expense => (
                <div key={expense.id} className="expense-card">
                  <div className="expense-card-header">
                    <div className="expense-card-title">{expense.description}</div>
                    <div className="expense-card-amount">${expense.amount}</div>
                  </div>
                  
                  <div className="expense-card-content">
                    <div className="expense-card-field">
                      <div className="expense-card-label">Date</div>
                      <div className="expense-card-value">
                        {formatDateSafe(expense.date)}
                      </div>
                    </div>
                    <div className="expense-card-field">
                      <div className="expense-card-label">Category</div>
                      <div className="expense-card-value">{expense.category_name || 'Uncategorized'}</div>
                    </div>
                  </div>
                  
                  <div className="expense-card-actions">
                    <button onClick={() => startEditingExpense(expense)} className="edit-button">
                      ✏️ Edit
                    </button>
                    <button onClick={() => deleteExpense(expense.id)} className="delete-button">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
