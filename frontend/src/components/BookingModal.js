import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';

const BookingModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    client: '',
    category: 'Facial',
    payment: 100
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [dailyAvailability, setDailyAvailability] = useState({});
  const [calendarPosition, setCalendarPosition] = useState('below');

  const categories = {
    'Facial': 100,
    'Massage': 120,
    'Facial + Massage': 200
  };

  // Find first available date in the next 45 days
  const findFirstAvailableDate = async () => {
    const today = moment().startOf('day');
    const maxDate = moment().add(45, 'days').startOf('day');
    
    let currentDate = today.clone();
    
    while (currentDate.isSameOrBefore(maxDate)) {
      // Skip Sundays
      if (currentDate.day() === 0) {
        currentDate.add(1, 'day');
        continue;
      }
      
      const dateString = currentDate.format('YYYY-MM-DD');
      try {
        const response = await axios.get(`/api/appointments/available-times/${dateString}`);
        if (response.data.available && response.data.availableTimes && response.data.availableTimes.length > 0) {
          return dateString;
        }
      } catch (error) {
        console.error(`Error checking availability for ${dateString}:`, error);
      }
      
      currentDate.add(1, 'day');
    }
    
    return null; // No available dates found
  };

  // Single, reusable function for calendar initialization
  const initializeCalendarWithFirstAvailableDate = useCallback(async () => {
    try {
      const firstAvailable = await findFirstAvailableDate();
      if (firstAvailable) {
        setFormData(prev => ({ 
          ...prev, 
          date: firstAvailable, 
          time: '', 
          client: '',
          category: 'Facial',
          payment: 100
        }));
        fetchAvailableTimes(firstAvailable);
        
        // Update current month to show the month with first available date
        const firstAvailableDate = moment(firstAvailable);
        setCurrentMonth(firstAvailableDate);
      } else {
        // Fallback to today if no available dates found
        const today = moment().format('YYYY-MM-DD');
        setFormData(prev => ({ 
          ...prev, 
          date: today, 
          time: '', 
          client: '',
          category: 'Facial',
          payment: 100
        }));
        fetchAvailableTimes(today);
      }
    } catch (error) {
      console.error('Error initializing calendar:', error);
      // Fallback to today on error
      const today = moment().format('YYYY-MM-DD');
      setFormData(prev => ({ 
        ...prev, 
        date: today, 
        time: '', 
        client: '',
        category: 'Facial',
        payment: 100
      }));
      fetchAvailableTimes(today);
    }
  }, []);

  useEffect(() => {
    // Set default date to first available date if not already set
    if (!formData.date) {
      initializeCalendarWithFirstAvailableDate();
    } else {
      fetchAvailableTimes(formData.date);
    }
  }, [formData.date, initializeCalendarWithFirstAvailableDate]);

  // Close calendar when clicking outside
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

  const fetchMonthlyAvailability = useCallback(async () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    
    const dates = [];
    let currentDate = startOfMonth.clone();
    
    while (currentDate.isSameOrBefore(endOfMonth)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }

    try {
      const availabilityPromises = dates.map(date => 
        axios.get(`/api/appointments/available-times/${date}`)
      );
      
      const responses = await Promise.all(availabilityPromises);
      
      const availability = {};
      dates.forEach((date, index) => {
        const response = responses[index];
        availability[date] = response.data.available;
      });
      
      setDailyAvailability(availability);
    } catch (error) {
      console.error('Error fetching monthly availability:', error);
    }
  }, [currentMonth]);

  // Fetch availability for all dates in the current month
  useEffect(() => {
    if (showDatePicker) {
      fetchMonthlyAvailability();
    }
  }, [currentMonth, showDatePicker, fetchMonthlyAvailability]);

  // Calculate optimal calendar position when date picker opens
  useEffect(() => {
    if (showDatePicker) {
      const dateInput = document.querySelector('.date-input');
      if (dateInput) {
        const rect = dateInput.getBoundingClientRect();
        const modalRect = document.querySelector('.modal-content')?.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (modalRect) {
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;
          const calendarHeight = 400; // Wider calendar height
          
          // If there's not enough space below and more space above, position above
          if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
            setCalendarPosition('above');
          } else {
            setCalendarPosition('below');
          }
        }
      }
    }
  }, [showDatePicker]);

  const fetchAvailableTimes = async (date) => {
    try {
      const response = await axios.get(`/api/appointments/available-times/${date}`);
      if (response.data.available) {
        setAvailableTimes(response.data.availableTimes);
        setError('');
      } else {
        setAvailableTimes([]);
        setError(response.data.reason || 'No available time slots for this date');
      }
    } catch (error) {
      console.error('Error fetching available times:', error);
      setError('Failed to fetch available times');
      setAvailableTimes([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        payment: categories[value]
      }));
    }
  };

  const isDateAvailable = (date) => {
    const today = moment().startOf('day');
    const maxDate = moment().add(45, 'days').startOf('day');
    
    // Check if date is in the past (before today)
    if (date.isBefore(today)) {
      return false;
    }
    
    // Check if date is more than 45 days in the future
    if (date.isAfter(maxDate)) {
      return false;
    }
    
    // Check if it's Sunday (day 0)
    if (date.day() === 0) {
      return false;
    }
    
    // Check if date has available time slots
    const dateString = date.format('YYYY-MM-DD');
    if (dailyAvailability[dateString] === false) {
      return false;
    }
    
    return true;
  };

  const handleDateSelect = (date) => {
    if (!isDateAvailable(date)) {
      return;
    }
    
    const dateString = date.format('YYYY-MM-DD');
    setFormData(prev => ({ ...prev, date: dateString, time: '' }));
    setShowDatePicker(false);
    setError('');
    fetchAvailableTimes(dateString);
    
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
            onClick={() => setCurrentMonth(prev => prev.clone().subtract(1, 'month'))}
            className="calendar-nav-btn"
          >
            ‹
          </button>
          <span className="calendar-month-year">
            {currentMonth.format('MMMM YYYY')}
          </span>
          <button 
            onClick={() => setCurrentMonth(prev => prev.clone().add(1, 'month'))}
            className="calendar-nav-btn"
          >
            ›
          </button>
        </div>
        
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/appointments', formData);
      setBookedAppointment(response.data);
      setIsSuccess(true);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || 'Failed to book appointment');
      setLoading(false);
    }
  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Appointment</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {!isSuccess && (
            <>
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
                    {showDatePicker && !isSuccess && (
                      <div className={`date-picker-dropdown ${calendarPosition === 'above' ? 'above' : ''}`}>
                        {renderCalendar()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <select
                    id="time"
                    name="time"
                    className="form-select"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    disabled={availableTimes.length === 0}
                  >
                    <option value="">Select Time</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Service</label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.keys(categories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="payment">Price</label>
                  <input
                    type="number"
                    id="payment"
                    name="payment"
                    className="form-input"
                    value={formData.payment}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="client">Client Name</label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    className="form-input"
                    value={formData.client}
                    onChange={handleInputChange}
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="book-button" disabled={loading || availableTimes.length === 0}>
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
            </>
          )}
        
        {isSuccess && (
          <div className="success-message">
            <h3>✅ Appointment Booked Successfully!</h3>
            <div className="appointment-details">
              <p><strong>📅 Date:</strong> {moment(bookedAppointment.date).format('MMMM DD, YYYY')}</p>
              <p><strong>🕐 Time:</strong> {bookedAppointment.time}</p>
              <p><strong>👤 Client:</strong> {bookedAppointment.client}</p>
              <p><strong>🧖‍♀️ Service:</strong> {bookedAppointment.category}</p>
              <p><strong>💰 Price:</strong> ${bookedAppointment.payment.toFixed(2)}</p>
            </div>
            <div className="success-actions">
              <button 
                type="button" 
                className="form-button secondary"
                onClick={async () => {
                  setIsSuccess(false);
                  setBookedAppointment(null);
                  setError('');
                  // Use the same calendar initialization function
                  await initializeCalendarWithFirstAvailableDate();
                }}
              >
                Book Another Appointment
              </button>
              <button 
                type="button" 
                className="form-button"
                onClick={() => {
                  onSuccess();
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
