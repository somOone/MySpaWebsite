import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const ExpenseModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: moment().format('YYYY-MM-DD'),
    description: '',
    amount: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [isSuccess, setIsSuccess] = useState(false);
  const [addedExpense, setAddedExpense] = useState(null);

  // Fetch expense categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/expense-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Close calendar when clicking outside (copied from BookingModal)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const isDateAvailable = (date) => {
    const today = moment().startOf('day');
    
    // Check if date is in the future (after today)
    if (date.isAfter(today)) {
      return false;
    }
    
    return true;
  };

  const handleDateSelect = (date) => {
    if (!isDateAvailable(date)) {
      return;
    }
    
    const dateString = date.format('YYYY-MM-DD');
    setFormData(prev => ({ ...prev, date: dateString }));
    setShowDatePicker(false);
    
    // Update current month if the selected date is in a different month
    if (!date.isSame(currentMonth, 'month')) {
      setCurrentMonth(date.clone());
    }
  };

  const renderCalendar = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');
    
    const days = [];
    let day = startDate.clone();
    
    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    
    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          <button 
            type="button"
            className="calendar-nav-btn"
            onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}
          >
            ←
          </button>
          <span className="calendar-month-year">
            {currentMonth.format('MMMM YYYY')}
          </span>
          <button 
            type="button"
            className="calendar-nav-btn"
            onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
          >
            →
          </button>
        </div>
        
        <div className="calendar-weekdays">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="calendar-weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {days.map((day, index) => {
            const isCurrentMonth = day.isSame(currentMonth, 'month');
            const isAvailable = isDateAvailable(day);
            const isSelected = day.format('YYYY-MM-DD') === formData.date;
            
            return (
              <button
                key={index}
                type="button"
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${!isAvailable ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateSelect(day)}
                disabled={!isAvailable}
              >
                {day.format('D')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category_id) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const expenseData = {
        date: formData.date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id)
      };

      await axios.post('/api/expenses', expenseData);
      
      // Store the added expense for success display
      setAddedExpense({
        ...expenseData,
        category_name: categories.find(cat => cat.id === parseInt(formData.category_id))?.name || 'Unknown'
      });
      
      // Show success state
      setIsSuccess(true);
      
      // Note: onSuccess will be called when user closes the modal
      // This allows the success screen to be visible
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isSuccess ? undefined : onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Expense</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <div className="date-picker-container">
                  <input
                    type="text"
                    id="date"
                    name="date"
                    value={formData.date ? moment(formData.date).format('MMM DD, YYYY') : ''}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    readOnly
                    placeholder="Select Date"
                    className="date-input"
                  />
                  <button 
                    type="button" 
                    className="calendar-toggle-btn"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    📅
                  </button>
                  {showDatePicker && (
                    <div className="date-picker-dropdown">
                      {renderCalendar()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category_id"
                  className="form-select"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{flex: '2'}}>
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Cleaning supplies, Utilities, Marketing"
                  maxLength="255"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-input"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <button type="submit" className="book-button" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
          </form>
        )}
        
        {isSuccess && (
          <div className="success-message">
            <h3>✅ Expense Added Successfully!</h3>
            <div className="expense-details">
              <p><strong>📅 Date:</strong> {moment(addedExpense.date).format('MMMM DD, YYYY')}</p>
              <p><strong>📝 Description:</strong> {addedExpense.description}</p>
              <p><strong>🏷️ Category:</strong> {addedExpense.category_name}</p>
              <p><strong>💰 Amount:</strong> ${addedExpense.amount.toFixed(2)}</p>
            </div>
            <div className="success-actions">
              <button 
                type="button" 
                className="form-button secondary"
                onClick={() => {
                  setIsSuccess(false);
                  setAddedExpense(null);
                  setError('');
                  // Reset form for another expense
                  setFormData({
                    date: moment().format('YYYY-MM-DD'),
                    description: '',
                    amount: '',
                    category_id: ''
                  });
                }}
              >
                Add Another Expense
              </button>
              <button 
                type="button" 
                className="form-button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseModal;
