import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import TipModal from '../components/TipModal';

const Appointments = () => {
  const [groupedAppointments, setGroupedAppointments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
    // Tip modal state
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Accordion state management
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedDates, setExpandedDates] = useState(new Set());
  
  // Ref for auto-focusing on expanded date section
  const expandedDateRef = useRef(null);
  
  // Track which date should get the ref for auto-focusing
  const [autoFocusDate, setAutoFocusDate] = useState(null);
  
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Auto-expand current date on first load
  useEffect(() => {
    if (Object.keys(groupedAppointments).length > 0 && expandedDates.size === 0) {
      // Check if there's a date parameter from URL (chatbot redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const dateParam = urlParams.get('date');
      
      if (dateParam) {
        // If there's a date parameter, let the other useEffect handle it
        // console.log('🔄 Date parameter detected, skipping default expansion');
        return;
      }
      
      // Default behavior: find current day or next day with appointments
      // console.log('🔄 No date parameter, applying default expansion logic');
      
      const today = moment();
      const todayKey = today.format('YYYY-MM-DD');
      const currentYear = today.format('YYYY');
      const currentMonth = today.format('MMMM');
      
      // console.log('🔄 [DEFAULT EXPANSION] Today:', todayKey, 'Current year:', currentYear, 'Current month:', currentMonth);
      
      // Check if today has appointments
      if (groupedAppointments[currentYear]?.[currentMonth]?.[todayKey]?.length > 0) {
        // console.log('🔄 [DEFAULT EXPANSION] Today has appointments, expanding today');
        setExpandedYears(new Set([currentYear]));
        setExpandedMonths(new Set([currentMonth]));
        setExpandedDates(new Set([todayKey]));
        setAutoFocusDate(todayKey);
        
        // Log what we're expanding
        // console.log('🔄 [DEFAULT EXPANSION] Expanding sections (today):', {
        //   year: currentYear,
        //   month: currentMonth,
        //   date: todayKey
        // });
      } else {
        // Find the next day with appointments
        // console.log('🔄 [DEFAULT EXPANSION] Today has no appointments, searching for next day with appointments');
        
        let foundDate = null;
        let foundYear = null;
        let foundMonth = null;
        
        // Search through all dates to find the next one with appointments
        const allDates = [];
        Object.keys(groupedAppointments).forEach(year => {
          Object.keys(groupedAppointments[year]).forEach(month => {
            Object.keys(groupedAppointments[year][month]).forEach(dateKey => {
              if (groupedAppointments[year][month][dateKey].length > 0) {
                allDates.push({
                  year,
                  month,
                  dateKey,
                  moment: moment(dateKey)
                });
              }
            });
          });
        });
        
        // console.log('🔄 [DEFAULT EXPANSION] All dates with appointments:', allDates.map(d => d.dateKey));
        
        // Sort dates chronologically
        allDates.sort((a, b) => a.moment.diff(b.moment));
        
        // Find the first date that's today or in the future
        for (const dateInfo of allDates) {
          if (dateInfo.moment.isSameOrAfter(today, 'day')) {
            foundDate = dateInfo.dateKey;
            foundYear = dateInfo.year;
            foundMonth = dateInfo.month;
            break;
          }
        }
        
        if (foundDate) {
          // console.log('🔄 [DEFAULT EXPANSION] Found next day with appointments:', foundDate);
          setExpandedYears(new Set([foundYear]));
          setExpandedMonths(new Set([foundMonth]));
          setExpandedDates(new Set([foundDate]));
          setAutoFocusDate(foundDate);
          
          // Log what we're expanding
          // console.log('🔄 [DEFAULT EXPANSION] Expanding sections:', {
          //   year: foundYear,
          //   month: foundMonth,
          //   date: foundDate
          // });
        } else {
          // Fallback: expand today even if no appointments
          // console.log('🔄 [DEFAULT EXPANSION] No future appointments found, expanding today as fallback');
          setExpandedYears(new Set([currentYear]));
          setExpandedMonths(new Set([currentMonth]));
          setExpandedDates(new Set([todayKey]));
          setAutoFocusDate(todayKey);
          
          // Log what we're expanding
          // console.log('🔄 [DEFAULT EXPANSION] Expanding sections (fallback):', {
          //   year: currentYear,
          //   month: currentMonth,
          //   date: todayKey
          // });
        }
        
        // Log what was expanded
        // console.log('🔄 [DEFAULT EXPANSION] Final expansion state:', {
        //   years: Array.from(expandedYears),
        //   months: Array.from(expandedMonths),
        //   dates: Array.from(expandedDates)
        // });
        
        // Auto-focus on the expanded date section after a short delay
        setTimeout(() => {
          if (expandedDateRef.current) {
            // console.log('🔄 [DEFAULT EXPANSION] Auto-focusing on expanded date section');
            expandedDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Clear the auto-focus date after scrolling to avoid re-render issues
            setTimeout(() => {
              setAutoFocusDate(null);
            }, 500);
          }
        }, 200);
      }
    }
  }, [groupedAppointments, expandedDates.size]);

  // Handle date parameter from URL (for auto-expanding after deletion)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    
    if (dateParam && Object.keys(groupedAppointments).length > 0) {
      // console.log('🔄 [CHATBOT REDIRECT] Auto-expanding section for date:', dateParam);
      
      // Parse the date parameter and find the relevant sections
      const targetDate = moment(dateParam);
      const targetYear = targetDate.format('YYYY');
      const targetMonth = targetDate.format('MMMM');
      const targetDateKey = targetDate.format('YYYY-MM-DD');
      
      // Auto-expand the relevant sections
      setExpandedYears(new Set([targetYear]));
      setExpandedMonths(new Set([targetMonth]));
      setExpandedDates(new Set([targetDateKey]));
      
      // console.log('🔄 [CHATBOT REDIRECT] Expanded sections:', {
      //   year: targetYear,
      //   month: targetMonth,
      //   date: targetDateKey
      // });
      
      // Scroll to the relevant section after a short delay
      setTimeout(() => {
        const dateElement = document.querySelector(`[data-date="${targetDateKey}"]`);
        if (dateElement) {
          // console.log('🔄 [CHATBOT REDIRECT] Scrolling to date element');
          dateElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // console.log('🔄 [CHATBOT REDIRECT] Date element not found for scrolling');
        }
      }, 100);
    }
  }, [groupedAppointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments/scheduled');
      setGroupedAppointments(response.data.grouped);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setEditForm({
      category: appointment.category,
      payment: appointment.payment
    });
  };

  const handleSave = async (appointmentId) => {
    try {
      // Only send category and payment for updates
      const updateData = {
        category: editForm.category,
        payment: editForm.payment
      };
      await axios.put(`/api/appointments/${appointmentId}`, updateData);
      setEditingId(null);
      setEditForm({});
      fetchAppointments(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleComplete = (appointment) => {
    setSelectedAppointment(appointment);
    setTipModalOpen(true);
  };

  const handleCompleteWithTip = async (tipAmount) => {
    try {
      await axios.patch(`/api/appointments/${selectedAppointment.id}/complete`, {
        tip: tipAmount
      });
      
      // Close modal and refresh data
      setTipModalOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
      
      // Show success message
      alert(`Appointment completed successfully with tip: $${tipAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${appointmentId}`);
        fetchAppointments(); // Refresh data
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment');
      }
    }
  };

  const updatePrice = (category) => {
    const prices = {
      'Facial': 100.00,
      'Massage': 120.00,
      'Facial + Massage': 200.00
    };
    setEditForm(prev => ({ ...prev, category, payment: prices[category] }));
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
    const allYears = Object.keys(groupedAppointments);
    const allMonths = new Set();
    const allDates = new Set();
    
    Object.entries(groupedAppointments).forEach(([year, yearData]) => {
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

  const renderAppointmentRow = (appointment) => {
    const isEditing = editingId === appointment.id;
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';

    return (
      <tr 
        key={appointment.id}
        className={isEditing ? 'editing-mode' : ''}
      >
        <td>{appointment.time}</td>
        <td>{appointment.client}</td>
        <td>
          {isEditing ? (
            <select
              value={editForm.category}
              onChange={(e) => updatePrice(e.target.value)}
              className="form-select"
              style={{ width: '120px' }}
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
          {isEditing ? (
            <span className="payment-display" style={{ 
              color: '#666', 
              backgroundColor: '#f5f5f5',
              padding: '2px 6px',
              borderRadius: '3px'
            }}>
              ${editForm.payment.toFixed(2)}
            </span>
          ) : (
            `$${appointment.payment.toFixed(2)}`
          )}
        </td>
        <td>
          {isEditing ? (
            <span className="tip-display">
              ${(appointment.tip || 0).toFixed(2)}
            </span>
          ) : (
            `$${(appointment.tip || 0).toFixed(2)}`
          )}
        </td>
        <td>
          {isEditing ? (
            <div className="edit-mode-buttons">
              <button
                className="action-btn save-btn"
                onClick={() => handleSave(appointment.id)}
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
                      ) : !isCompleted && !isCancelled ? (
              <div className="normal-mode-buttons">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(appointment)}
                >
                  Edit
                </button>
                <button
                  className="action-btn complete-btn"
                  onClick={() => handleComplete(appointment)}
                >
                  Complete
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(appointment.id)}
                >
                  Cancel
                </button>
              </div>
          ) : (
            <span className="completed-status">
              {isCompleted ? 'Completed' : 'Cancelled'}
            </span>
          )}
        </td>
      </tr>
    );
  };

  const renderMobileAppointmentCard = (appointment) => {
    const isEditing = editingId === appointment.id;
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';

    return (
      <div 
        key={appointment.id} 
        className="appointment-card"
      >
        <div className="card-header">
          <span className="time">{appointment.time}</span>
          <span className="status">
            {isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Active'}
          </span>
        </div>
        
        <div className="card-body">
          <div className="info-row">
            <span className="label">Client:</span>
            <span className="value">{appointment.client}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Category:</span>
            <span className="value">
              {isEditing ? (
                <select
                  value={editForm.category}
                  onChange={(e) => updatePrice(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.9rem', padding: '0.25rem' }}
                >
                  <option value="Facial">Facial</option>
                  <option value="Massage">Massage</option>
                  <option value="Facial + Massage">Facial + Massage</option>
                </select>
              ) : (
                appointment.category
              )}
            </span>
          </div>
          
          <div className="info-row">
            <span className="label">Payment:</span>
            <span className="value">
              {isEditing ? (
                <span className="payment-display" style={{ 
                  color: '#666', 
                  backgroundColor: '#f5f5f5',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  ${editForm.payment.toFixed(2)}
                </span>
              ) : (
                `$${appointment.payment.toFixed(2)}`
              )}
            </span>
          </div>
          
          <div className="info-row">
            <span className="label">Tip:</span>
            <span className="value">
              ${(appointment.tip || 0).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className={isEditing ? 'edit-mode-actions' : 'normal-mode-actions'}>
          {isEditing ? (
            <>
              <button
                className="action-btn save-btn"
                onClick={() => handleSave(appointment.id)}
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
          ) : !isCompleted && !isCancelled ? (
            <>
              <button
                className="action-btn edit-btn"
                onClick={() => handleEdit(appointment)}
              >
                Edit
              </button>
              <button
                className="action-btn complete-btn"
                onClick={() => handleComplete(appointment)}
              >
                Complete
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDelete(appointment.id)}
              >
                Cancel
              </button>
            </>
          ) : (
            <span className="completed-status">
              {isCompleted ? 'Completed' : 'Cancelled'}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderDateGroup = (date, appointments) => {
    const dateKey = `${date}`;
    const isExpanded = expandedDates.has(dateKey);
    const shouldAutoFocus = autoFocusDate === dateKey;
    
    return (
      <div 
        key={date} 
        className="date-group" 
        data-date={dateKey}
        ref={shouldAutoFocus ? expandedDateRef : null}
      >
        <div 
          className={`date-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleDate(dateKey)}
        >
          {moment(date).format('dddd, MMMM D, YYYY')} 
          <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="date-content">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Client</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Tip</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(renderAppointmentRow)}
              </tbody>
            </table>
            
            {/* Mobile card layout - hidden by default, shown on small screens */}
            <div className="mobile-cards">
              {appointments.map(renderMobileAppointmentCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMonthGroup = (month, monthData) => {
    const monthKey = `${month}`;
    const isExpanded = expandedMonths.has(monthKey);
    
    return (
      <div key={month} className="month-group">
        <div 
          className={`month-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleMonth(monthKey)}
        >
          {month} 
          <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
        {isExpanded && (
          <div className="month-content">
            {Object.entries(monthData)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .map(([date, appointments]) => 
                renderDateGroup(date, appointments)
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

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="appointments-page">
      <h1>Manage Appointments</h1>
      
      {Object.keys(groupedAppointments).length === 0 ? (
        <p>No appointments found.</p>
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
            {Object.entries(groupedAppointments)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([year, yearData]) => 
                renderYearGroup(year, yearData)
              )}
          </div>
        </>
      )}

      <TipModal
        isOpen={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        onConfirm={handleCompleteWithTip}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
