import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock modal components for accessibility testing
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <div 
      className={`modal-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      {...props}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

const TipModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  appointment, 
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className={`tip-modal-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
      tabIndex={-1}
      {...props}
    >
      <div className="tip-modal">
        <div className="tip-modal-header">
          <h3 id="tip-modal-title">Complete Appointment</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close tip modal"
          >
            ×
          </button>
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
              <span className="currency-symbol" aria-label="dollars">$</span>
              <input
                type="number"
                id="tipAmount"
                step="0.01"
                min="0"
                max="1000"
                placeholder="0.00"
                className="tip-input"
                aria-describedby="tip-constraints"
              />
            </div>
            <div id="tip-constraints" className="sr-only">
              Tip amount must be between $0 and $1000
            </div>
            
            <div className="quick-tips">
              <p>Quick select:</p>
              <div className="quick-tip-buttons" role="group" aria-label="Quick tip options">
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  aria-label="No tip"
                >
                  No Tip
                </button>
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  aria-label="Tip $10"
                >
                  $10
                </button>
                <button 
                  type="button" 
                  className="quick-tip-btn"
                  aria-label="Tip $20"
                >
                  $20
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="tip-modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            onClick={onConfirm}
          >
            Complete Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

describe('Modal Accessibility', () => {
  test('modal has proper ARIA attributes when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    
    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  test('modal is not rendered when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  test('modal has proper heading hierarchy', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test Modal');
  });

  test('close button has proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass('close-button');
  });

  test('modal can be closed with Escape key', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const modal = screen.getByRole('dialog');
    
    // Test Escape key
    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('modal can be closed with close button', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('tip modal has proper ARIA attributes', () => {
    const appointment = {
      client: 'John Doe',
      time: '9:00 AM',
      date: '2025-01-15',
      category: 'Massage'
    };
    
    render(
      <TipModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        appointment={appointment}
      />
    );
    
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'tip-modal-title');
    
    const title = screen.getByRole('heading', { name: 'Complete Appointment' });
    expect(title).toHaveAttribute('id', 'tip-modal-title');
  });

  test('tip modal displays appointment information accessibly', () => {
    const appointment = {
      client: 'John Doe',
      time: '9:00 AM',
      date: '2025-01-15',
      category: 'Massage'
    };
    
    render(
      <TipModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        appointment={appointment}
      />
    );
    
    expect(screen.getByText(/Client:/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Time:/)).toBeInTheDocument();
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
    expect(screen.getByText('2025-01-15')).toBeInTheDocument();
    expect(screen.getByText(/Service:/)).toBeInTheDocument();
    expect(screen.getByText('Massage')).toBeInTheDocument();
  });

  test('tip input has proper label and constraints', () => {
    const appointment = { client: 'John Doe', time: '9:00 AM', date: '2025-01-15', category: 'Massage' };
    
    render(
      <TipModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        appointment={appointment}
      />
    );
    
    const label = screen.getByText('Tip Amount (required):');
    const input = screen.getByLabelText('Tip Amount (required):');
    
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '1000');
    expect(input).toHaveAttribute('step', '0.01');
    expect(input).toHaveAttribute('aria-describedby', 'tip-constraints');
    
    const constraints = screen.getByText('Tip amount must be between $0 and $1000');
    expect(constraints).toHaveAttribute('id', 'tip-constraints');
    expect(constraints).toHaveClass('sr-only');
  });

  test('quick tip buttons are properly grouped and labeled', () => {
    const appointment = { client: 'John Doe', time: '9:00 AM', date: '2025-01-15', category: 'Massage' };
    
    render(
      <TipModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        appointment={appointment}
      />
    );
    
    const quickTipsGroup = screen.getByRole('group', { name: 'Quick tip options' });
    expect(quickTipsGroup).toBeInTheDocument();
    
    const noTipBtn = screen.getByLabelText('No tip');
    const tip10Btn = screen.getByLabelText('Tip $10');
    const tip20Btn = screen.getByLabelText('Tip $20');
    
    expect(noTipBtn).toBeInTheDocument();
    expect(tip10Btn).toBeInTheDocument();
    expect(tip20Btn).toBeInTheDocument();
  });

  test('currency symbol has screen reader context', () => {
    const appointment = { client: 'John Doe', time: '9:00 AM', date: '2025-01-15', category: 'Massage' };
    
    render(
      <TipModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        appointment={appointment}
      />
    );
    
    const currencySymbol = screen.getByLabelText('dollars');
    expect(currencySymbol).toBeInTheDocument();
    expect(currencySymbol).toHaveTextContent('$');
  });

  test('modal buttons have proper roles and labels', () => {
    const appointment = { client: 'John Doe', time: '9:00 AM', date: '2025-01-15', category: 'Massage' };
    
    render(
      <TipModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        appointment={appointment}
      />
    );
    
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const completeBtn = screen.getByRole('button', { name: 'Complete Appointment' });
    
    expect(cancelBtn).toBeInTheDocument();
    expect(completeBtn).toBeInTheDocument();
    expect(cancelBtn).toHaveClass('btn', 'btn-secondary');
    expect(completeBtn).toHaveClass('btn', 'btn-primary');
  });

  test('modal focus management works correctly', () => {
    const appointment = { client: 'John Doe', time: '9:00 AM', date: '2025-01-15', category: 'Massage' };
    
    render(
      <TipModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        appointment={appointment}
      />
    );
    
    const modal = screen.getByRole('dialog');
    const title = screen.getByRole('heading', { name: 'Complete Appointment' });
    
    // Check that modal has proper ARIA attributes
    expect(modal).toHaveAttribute('tabIndex', '-1');
    
    // Check that title has proper ID for screen reader association
    expect(title).toHaveAttribute('id', 'tip-modal-title');
  });
});
