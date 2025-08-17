import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const Expenses = () => {
  const [groupedExpenses, setGroupedExpenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    category: ''
  });

  // Accordion state management
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedDates, setExpandedDates] = useState(new Set());

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Auto-expand current date on first load
  useEffect(() => {
    if (Object.keys(groupedExpenses).length > 0 && expandedDates.size === 0) {
      const today = moment().format('YYYY-MM-DD');
      const todayKey = `${today}`;
      setExpandedDates(new Set([todayKey]));
      
      // Also expand the current month and year
      const currentMonth = moment().format('MMMM');
      const currentYear = moment().format('YYYY');
      setExpandedMonths(new Set([currentMonth]));
      setExpandedYears(new Set([currentYear]));
    }
  }, [groupedExpenses, expandedDates.size]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/expenses/grouped');
      
      // Transform the data to match the year → month → date hierarchy
      const transformed = {};
      
      response.data.forEach(group => {
        const monthDate = moment(group.expenses[0].date);
        const year = monthDate.format('YYYY');
        const month = monthDate.format('MMMM');
        
        if (!transformed[year]) {
          transformed[year] = {};
        }
        if (!transformed[year][month]) {
          transformed[year][month] = {};
        }
        
        // Group expenses by date within the month
        group.expenses.forEach(expense => {
          const date = moment(expense.date).format('YYYY-MM-DD');
          if (!transformed[year][month][date]) {
            transformed[year][month][date] = [];
          }
          transformed[year][month][date].push(expense);
        });
      });
      
      setGroupedExpenses(transformed);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await axios.put(`/api/expenses/${editingId}`, formData);
      } else {
        await axios.post('/api/expenses', formData);
      }
      
      setShowAddForm(false);
      setEditingId(null);
      setFormData({ date: '', description: '', amount: '', category: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      date: expense.date,
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category
    });
    setShowAddForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${expenseId}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ date: '', description: '', amount: '', category: '' });
  };

  // Accordion toggle functions
  const toggleYear = (year) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  const toggleDate = (dateKey) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allYears = Object.keys(groupedExpenses);
    const allMonths = new Set();
    const allDates = new Set();
    
    Object.entries(groupedExpenses).forEach(([year, yearData]) => {
      Object.entries(yearData).forEach(([month, monthData]) => {
        allMonths.add(month);
        Object.keys(monthData).forEach(date => {
          allDates.add(date);
        });
      });
    });
    
    setExpandedYears(new Set(allYears));
    setExpandedMonths(allMonths);
    setExpandedDates(allDates);
  };

  const collapseAll = () => {
    setExpandedYears(new Set());
    setExpandedMonths(new Set());
    setExpandedDates(new Set());
  };

  const renderExpenseRow = (expense) => {
    return (
      <tr key={expense.id}>
        <td>{moment(expense.date).format('h:mm A')}</td>
        <td>{expense.description}</td>
        <td>${expense.amount.toFixed(2)}</td>
        <td>{expense.category}</td>
        <td>
          <div className="action-buttons">
            <button
              className="action-btn edit-btn"
              onClick={() => handleEdit(expense)}
            >
              Edit
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => handleDelete(expense.id)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderDateGroup = (date, expenses) => {
    const dateKey = `${date}`;
    const isExpanded = expandedDates.has(dateKey);
    const dateObj = moment(date);
    const dayName = dateObj.format('dddd');
    const formattedDate = dateObj.format('MMMM D, YYYY');
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return (
      <div key={date} className="date-group">
        <div 
          className={`date-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleDate(dateKey)}
        >
          <span>{dayName}, {formattedDate}</span>
          <span className="date-total">Total: ${totalAmount.toFixed(2)}</span>
          <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="date-content">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => renderExpenseRow(expense))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderMonthGroup = (month, monthData) => {
    const monthKey = `${month}`;
    const isExpanded = expandedMonths.has(monthKey);
    const monthTotal = Object.values(monthData).reduce((sum, dateExpenses) => 
      sum + dateExpenses.reduce((dateSum, expense) => dateSum + expense.amount, 0), 0
    );
    
    return (
      <div key={month} className="month-group">
        <div 
          className={`month-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleMonth(monthKey)}
        >
          <span>{month}</span>
          <span className="month-total">Total: ${monthTotal.toFixed(2)}</span>
          <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="month-content">
            {Object.entries(monthData)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .map(([date, expenses]) => 
                renderDateGroup(date, expenses)
              )}
          </div>
        )}
      </div>
    );
  };

  const renderYearGroup = (year, yearData) => {
    const yearKey = `${year}`;
    const isExpanded = expandedYears.has(yearKey);
    const yearTotal = Object.values(yearData).reduce((sum, monthData) => 
      sum + Object.values(monthData).reduce((monthSum, dateExpenses) => 
        monthSum + dateExpenses.reduce((dateSum, expense) => dateSum + expense.amount, 0), 0
      ), 0
    );
    
    return (
      <div key={year} className="year-group">
        <div 
          className={`year-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleYear(yearKey)}
        >
          <span>{year}</span>
          <span className="year-total">Total: ${yearTotal.toFixed(2)}</span>
          <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="year-content">
            {Object.entries(yearData)
              .sort(([a], [b]) => {
                const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                return monthOrder.indexOf(a) - monthOrder.indexOf(b);
              })
              .map(([month, monthData]) => 
                renderMonthGroup(month, monthData)
              )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>Loading expenses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="expenses-page">
      <h1>Track Expenses</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div></div>
        <button
          className="form-button"
          onClick={() => setShowAddForm(true)}
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
        >
          + Add Expense
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="table-container">
          <div style={{ padding: '0.75rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>
              {editingId ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-input"
                    max={moment().format('YYYY-MM-DD')}
                    required
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  >
                    <option value="">Select category</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Products">Products</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter expense description"
                    required
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="form-input"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    required
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <button type="submit" className="form-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    {editingId ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    className="form-button secondary"
                    onClick={handleCancel}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses Display */}
      {Object.keys(groupedExpenses).length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <>
          <div className="accordion-controls">
            <button 
              className="accordion-btn expand-all-btn"
              onClick={expandAll}
            >
              📂 Expand All
            </button>
            <button 
              className="accordion-btn collapse-all-btn"
              onClick={collapseAll}
            >
              📁 Collapse All
            </button>
          </div>
          
          <div className="table-container">
            {Object.entries(groupedExpenses)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([year, yearData]) => 
                renderYearGroup(year, yearData)
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default Expenses;
