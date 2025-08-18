import React, { useState } from 'react';
import './TipModal.css';

const TipModal = ({ isOpen, onClose, onConfirm, appointment }) => {
  const [tipAmount, setTipAmount] = useState(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (tipAmount < 0) {
      setError('Tip amount cannot be negative');
      return;
    }
    
    if (tipAmount > 1000) {
      setError('Tip amount cannot exceed $1000');
      return;
    }
    
    setError('');
    onConfirm(tipAmount);
  };

  const handleClose = () => {
    setTipAmount(0);
    setError('');
    onClose();
  };

  const handleQuickTip = (amount) => {
    setTipAmount(amount);
    setError('');
  };

  return (
    <div className="tip-modal-overlay" onClick={handleClose}>
      <div className="tip-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tip-modal-header">
          <h3>Complete Appointment</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="tip-modal-body">
          <div className="appointment-info">
            <p><strong>Client:</strong> {appointment?.client}</p>
            <p><strong>Time:</strong> {appointment?.time}</p>
            <p><strong>Date:</strong> {appointment?.date}</p>
            <p><strong>Service:</strong> {appointment?.category}</p>
          </div>
          
          <div className="tip-section">
            <label htmlFor="tipAmount">Tip Amount (required):</label>
            <div className="tip-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="tipAmount"
                value={tipAmount}
                onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                max="1000"
                placeholder="0.00"
                className="tip-input"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="quick-tips">
              <p>Quick select:</p>
              <div className="quick-tip-buttons">
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  onClick={() => handleQuickTip(0)}
                >
                  No Tip
                </button>
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  onClick={() => handleQuickTip(10)}
                >
                  $10
                </button>
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  onClick={() => handleQuickTip(15)}
                >
                  $15
                </button>
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  onClick={() => handleQuickTip(20)}
                >
                  $20
                </button>
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  onClick={() => handleQuickTip(25)}
                >
                  $25
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="tip-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
            Complete Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipModal;
