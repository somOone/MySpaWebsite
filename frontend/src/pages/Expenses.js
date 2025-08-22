import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import ExpenseModal from '../components/ExpenseModal';

const Expenses = () => {
  const location = useLocation();
  const [groupedExpenses, setGroupedExpenses] = useState({});
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    category_id: ''
  });
  
  // Click outside detection for inline editing
  const editingRowRef = useRef(null);


  
  // Handle click outside to close inline edit
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingId && editingRowRef.current && !editingRowRef.current.contains(event.target)) {
        handleCancel();
      }
    };

    if (editingId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingId]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Modal state for adding new expenses
  const [showModal, setShowModal] = useState(false);

  // Accordion state management
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedDates, setExpandedDates] = useState(new Set());

  // Handle form submission for editing existing expenses
  const handleSubmit = async (e) => {
    // Handle both form submission and direct button clicks
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    try {
      const response = await axios.put(`/api/expenses/${editingId}`, formData);
      
      if (response.status === 200) {
        setFormData({ date: '', description: '', amount: '', category_id: '' });
        setEditingId(null);
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense');
    }
  };

  // Handle edit button click
  const handleEdit = (expense) => {
    setFormData({
      date: expense.date,
      description: expense.description,
      amount: expense.amount.toString(),
      category_id: expense.category_id ? expense.category_id.toString() : ''
    });
    setEditingId(expense.id);
    
    // Scroll the edited row into view after a short delay to ensure DOM is updated
    setTimeout(() => {
      const expenseRow = document.querySelector(`tr[data-expense-id="${expense.id}"]`);
      if (expenseRow) {
        expenseRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      date: '',
      description: '',
      amount: '',
      category_id: ''
    });
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
    }
  };



  useEffect(() => {
    fetchExpenseCategories();
    fetchExpenses();
  }, []);

  // Handle URL parameters for expansion, scrolling, editing, and adding
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const addExpense = urlParams.get('addExpense');
    const expandExpenseId = urlParams.get('expandExpense');
    const editExpenseId = urlParams.get('editExpense');
    const expandYear = urlParams.get('expandYear');
    const expandMonth = urlParams.get('expandMonth');
    
    // Handle add expense parameter - open the modal instead of inline form
    if (addExpense === 'true') {
      setShowModal(true);
      return; // Don't process other parameters if adding
    }
    
    if (Object.keys(groupedExpenses).length > 0) {
      
      if (editExpenseId) {
        // Find the expense and put it in edit mode
        let foundExpense = null;
        let expenseYear = null;
        let expenseMonth = null;
        let expenseDate = null;
        
        Object.entries(groupedExpenses).forEach(([year, yearData]) => {
          Object.entries(yearData).forEach(([month, monthData]) => {
            Object.entries(monthData).forEach(([date, expenses]) => {
              const expense = expenses.find(exp => exp.id === parseInt(editExpenseId));
              if (expense) {
                foundExpense = expense;
                expenseYear = year;
                expenseMonth = month;
                expenseDate = date;
              }
            });
          });
        });
        
        if (foundExpense) {
          // Expand the hierarchy and put expense in edit mode
          setExpandedYears(new Set([expenseYear]));
          setExpandedMonths(new Set([expenseMonth]));
          setExpandedDates(new Set([expenseDate]));
          
          // Set the expense in edit mode
          setFormData({
            date: foundExpense.date,
            description: foundExpense.description,
            amount: foundExpense.amount.toString(),
            category_id: foundExpense.category_id ? foundExpense.category_id.toString() : ''
          });
          setEditingId(foundExpense.id);
          
          // Scroll to the expense after a delay
          setTimeout(() => {
            const expenseRow = document.querySelector(`tr[data-expense-id="${editExpenseId}"]`);
            if (expenseRow) {
              expenseRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      } else if (expandExpenseId) {
        // Find the expense and expand its hierarchy
        let foundExpense = null;
        let expenseYear = null;
        let expenseMonth = null;
        let expenseDate = null;
        
        Object.entries(groupedExpenses).forEach(([year, yearData]) => {
          Object.entries(yearData).forEach(([month, monthData]) => {
            Object.entries(monthData).forEach(([date, expenses]) => {
              const expense = expenses.find(exp => exp.id === parseInt(expandExpenseId));
              if (expense) {
                foundExpense = expense;
                expenseYear = year;
                expenseMonth = month;
                expenseDate = date;
              }
            });
          });
        });
        
        if (foundExpense) {
          setExpandedYears(new Set([expenseYear]));
          setExpandedMonths(new Set([expenseMonth]));
          setExpandedDates(new Set([expenseDate]));
          
          // Scroll to the expense after a delay
          setTimeout(() => {
            const expenseRow = document.querySelector(`tr[data-expense-id="${expandExpenseId}"]`);
            if (expenseRow) {
              expenseRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the expense briefly
              expenseRow.style.backgroundColor = '#10B981';
              expenseRow.style.transition = 'background-color 0.3s ease';
              setTimeout(() => {
                expenseRow.style.backgroundColor = '';
              }, 2000);
            }
          }, 500);
        }
      } else if (expandYear && expandMonth) {
        // Expand specific year and month
        const monthName = moment().month(parseInt(expandMonth) - 1).format('MMMM');
        if (groupedExpenses[expandYear]?.[monthName]) {
          setExpandedYears(new Set([expandYear]));
          setExpandedMonths(new Set([monthName]));
        }
      } else if (expandedYears.size === 0 && expandedMonths.size === 0) {
        // Auto-expand current month and year on first load (default behavior)
        const today = moment();
        const currentYear = today.format('YYYY');
        const currentMonth = today.format('MMMM');
        
        // Check if current month has expenses
        if (groupedExpenses[currentYear]?.[currentMonth]) {
          setExpandedYears(new Set([currentYear]));
          setExpandedMonths(new Set([currentMonth]));
        }
      }
    }
  }, [groupedExpenses, location.search, expandedYears.size, expandedMonths.size]);

  // Track screen size for responsive rendering
  useEffect(() => {
    const checkScreenSize = () => {
      // Match the CSS breakpoint exactly - show mobile cards when tables are hidden
      const mobile = window.innerWidth <= 768;
      console.log('Screen size check:', { width: window.innerWidth, isMobile: mobile });
      setIsMobile(mobile);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchExpenseCategories = async () => {
    try {
      const response = await axios.get('/api/expense-categories');
      setExpenseCategories(response.data);
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      // Don't fail the whole page if categories fail to load
    }
  };

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

  // Helper function to get category display info
  const getCategoryDisplayInfo = (expense) => {
    if (expense.category_id && expense.category_name) {
      // New system with category metadata
      return {
        name: expense.category_name,
        color: expense.category_color,
        description: expense.category_description
      };
    }
    return {
      name: 'Unknown',
      color: '#6B7280',
      description: 'Category not specified'
    };
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

  const renderExpenseRow = (expense) => {
    const categoryInfo = getCategoryDisplayInfo(expense);
    const isEditing = editingId === expense.id;
    
                   return (
                 <tr 
                   key={expense.id} 
                   className="expense-row" 
                   data-expense-id={expense.id}
                   ref={isEditing ? editingRowRef : null}
                 >
        <td>
          {isEditing ? (
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="form-input"
              style={{ width: '120px', fontSize: '0.85rem', padding: '0.25rem' }}
            />
          ) : (
            moment(expense.date).format('MMM D, YYYY')
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="form-input"
              style={{ width: '140px', fontSize: '0.85rem', padding: '0.25rem' }}
              maxLength="255"
            />
          ) : (
            expense.description
          )}
        </td>
        <td>
          {isEditing ? (
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              className="form-select"
              style={{ width: '120px', fontSize: '0.85rem', padding: '0.25rem' }}
            >
              <option value="">Select category</option>
              {expenseCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            <span 
              className="category-badge"
              style={{
                backgroundColor: categoryInfo.color,
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
              title={categoryInfo.description}
            >
              {categoryInfo.name}
            </span>
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="form-input"
              step="0.01"
              min="0.01"
              style={{ width: '80px', fontSize: '0.85rem', padding: '0.25rem' }}
            />
          ) : (
            `$${expense.amount.toFixed(2)}`
          )}
        </td>
        <td>
          {isEditing ? (
            <div className="action-buttons">
              <button
                className="action-btn save-btn"
                onClick={() => handleSubmit()}
              >
                Save
              </button>
              <button
                className="action-btn cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                className="edit-btn"
                onClick={() => handleEdit(expense)}
                style={{ marginRight: '0.5rem' }}
                title="Edit expense"
              >
                ✏️
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(expense.id)}
                title="Delete expense"
              >
                🗑️
              </button>
            </>
          )}
        </td>
      </tr>
    );
  };

  const renderMonthGroup = (month, monthData) => {
    const monthTotal = Object.values(monthData).reduce((sum, dateExpenses) => 
      sum + dateExpenses.reduce((dateSum, expense) => dateSum + expense.amount, 0), 0
    );
    
    const monthKey = `${month}`;
    const isExpanded = expandedMonths.has(monthKey);
    
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
    
    return (
      <div key={year} className="year-group">
        <div 
          className={`year-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleYear(yearKey)}
        >
          {year} 
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

  const renderMobileExpenseCard = (expense) => {
    const categoryInfo = getCategoryDisplayInfo(expense);
    const isEditing = editingId === expense.id;
    
    return (
      <div 
        key={expense.id} 
        className="appointment-card expense-card"
        ref={isEditing ? editingRowRef : null}
      >
        <div className="card-header">
          <span className="time">
            {isEditing ? (
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="form-input"
                style={{ width: '100px', fontSize: '0.85rem', padding: '0.25rem' }}
              />
            ) : (
              moment(expense.date).format('MMM D, YYYY')
            )}
          </span>
          <span 
            className="status"
            style={{
              backgroundColor: categoryInfo.color,
              color: 'white',
              border: 'none'
            }}
          >
            {isEditing ? (
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="form-select"
                style={{ width: '120px', fontSize: '0.85rem', padding: '0.25rem' }}
              >
                <option value="">Select category</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              categoryInfo.name
            )}
          </span>
        </div>
        <div className="card-body">
          <div className="info-row">
            <span className="label">Description:</span>
            <span className="value">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.25rem' }}
                  maxLength="255"
                />
              ) : (
                expense.description
              )}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Amount:</span>
            <span className="value">
              {isEditing ? (
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="form-input"
                  step="0.01"
                  min="0.01"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.25rem' }}
                />
              ) : (
                `$${expense.amount.toFixed(2)}`
              )}
            </span>
          </div>
        </div>
        <div className="actions">
          {isEditing ? (
            <>
              <button
                className="action-btn save-btn"
                onClick={() => handleSubmit()}
              >
                Save
              </button>
              <button
                className="action-btn cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="action-btn edit-btn"
                onClick={() => handleEdit(expense)}
              >
                ✏️ Edit
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDelete(expense.id)}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDateGroup = (date, expenses) => {
    const dateKey = `${date}`;
    const isExpanded = expandedDates.has(dateKey);
    const dateTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return (
      <div key={date} className="date-group">
        <div 
          className={`date-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleDate(dateKey)}
        >
          <span>{moment(date).format('dddd, MMMM Do')}</span>
          <span className="date-total">Total: ${dateTotal.toFixed(2)}</span>
          <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="date-content">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .sort((a, b) => moment(a.date).diff(moment(b.date)))
                  .map(expense => renderExpenseRow(expense))
                }
              </tbody>
            </table>
            
            {/* Mobile card layout - only render on small screens */}
            {isMobile && (
              <div className="mobile-cards">
                {expenses.map(expense => renderMobileExpenseCard(expense))}
              </div>
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
      <h1>Manage Expenses</h1>





      {/* Expenses Display */}
      {Object.keys(groupedExpenses).length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <>
          <div className="accordion-controls">
            <button 
              className="accordion-btn expand-all-btn"
              onClick={() => {
                const allYears = new Set();
                const allMonths = new Set();
                const allDates = new Set();
                Object.entries(groupedExpenses).forEach(([year, yearData]) => {
                  allYears.add(year);
                  Object.entries(yearData).forEach(([month, monthData]) => {
                    allMonths.add(month);
                    Object.keys(monthData).forEach(date => {
                      allDates.add(date);
                    });
                  });
                });
                setExpandedYears(allYears);
                setExpandedMonths(allMonths);
                setExpandedDates(allDates);
              }}
            >
              📂 Expand All
            </button>
            <button 
              className="accordion-btn collapse-all-btn"
              onClick={() => {
                setExpandedYears(new Set());
                setExpandedMonths(new Set());
                setExpandedDates(new Set());
              }}
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
      
      {/* Expense Modal for adding new expenses */}
      {showModal && (
        <ExpenseModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchExpenses(); // Refresh the expenses list
          }}
        />
      )}
    </div>
  );
};

export default Expenses;
