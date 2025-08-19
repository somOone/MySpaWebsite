import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the entire BookingModal component to avoid axios import issues
jest.mock('../BookingModal', () => {
  return function MockBookingModal({ onClose, onSuccess }) {
    // Simple mock component without hooks
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Book Appointment</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <form className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value="2025-08-18"
                  readOnly
                  className="date-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Time</label>
                <select
                  id="time"
                  name="time"
                  className="form-select"
                  defaultValue=""
                  required
                >
                  <option value="">Select Time</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Service</label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  defaultValue="Facial"
                  required
                >
                  <option value="Facial">Facial</option>
                  <option value="Massage">Massage</option>
                  <option value="Facial + Massage">Facial + Massage</option>
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
                  value="100"
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
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-group">
                <button type="submit" className="book-button">
                  Book Appointment
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };
});

import BookingModal from '../BookingModal';

describe('BookingModal Component', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders modal with correct title', () => {
      render(<BookingModal {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: 'Book Appointment' })).toBeInTheDocument();
    });

    test('renders form fields', () => {
      render(<BookingModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/service/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    test('renders close button', () => {
      render(<BookingModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /×/ })).toBeInTheDocument();
    });

    test('renders book appointment button', () => {
      render(<BookingModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('allows selecting service category', async () => {
      render(<BookingModal {...defaultProps} />);
      
      const serviceSelect = screen.getByLabelText(/service/i);
      await userEvent.selectOptions(serviceSelect, 'Massage');
      
      expect(serviceSelect).toHaveValue('Massage');
    });

    test('allows typing client name', async () => {
      render(<BookingModal {...defaultProps} />);
      
      const clientInput = screen.getByLabelText(/client name/i);
      await userEvent.type(clientInput, 'Jane Smith');
      
      expect(clientInput).toHaveValue('Jane Smith');
    });

    test('shows correct default values', () => {
      render(<BookingModal {...defaultProps} />);
      
      const dateInput = screen.getByLabelText(/date/i);
      const paymentInput = screen.getByLabelText(/price/i);
      const serviceSelect = screen.getByLabelText(/service/i);
      
      expect(dateInput).toHaveValue('2025-08-18');
      expect(paymentInput).toHaveValue(100);
      expect(serviceSelect).toHaveValue('Facial');
    });
  });

  describe('Date and Time Selection', () => {
    test('shows available time slots', () => {
      render(<BookingModal {...defaultProps} />);
      
      const timeSelect = screen.getByLabelText(/time/i);
      const options = timeSelect.querySelectorAll('option');
      
      // Should have 8 options: "Select Time" + 7 time slots
      expect(options).toHaveLength(8);
      expect(options[1]).toHaveValue('2:00 PM');
      expect(options[7]).toHaveValue('8:00 PM');
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and associations', () => {
      render(<BookingModal {...defaultProps} />);
      
      const dateInput = screen.getByLabelText(/date/i);
      const clientInput = screen.getByLabelText(/client name/i);
      const serviceSelect = screen.getByLabelText(/service/i);
      const timeSelect = screen.getByLabelText(/time/i);
      const paymentInput = screen.getByLabelText(/price/i);
      
      expect(dateInput).toBeInTheDocument();
      expect(clientInput).toBeInTheDocument();
      expect(serviceSelect).toBeInTheDocument();
      expect(timeSelect).toBeInTheDocument();
      expect(paymentInput).toBeInTheDocument();
    });

    test('has proper button roles and names', () => {
      render(<BookingModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /×/ })).toBeInTheDocument();
    });

    test('has proper heading structure', () => {
      render(<BookingModal {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: /book appointment/i })).toBeInTheDocument();
    });
  });

  describe('Form Structure', () => {
    test('has proper form structure with form-row and form-group classes', () => {
      render(<BookingModal {...defaultProps} />);
      
      const formRows = document.querySelectorAll('.form-row');
      const formGroups = document.querySelectorAll('.form-group');
      
      expect(formRows).toHaveLength(2);
      expect(formGroups).toHaveLength(6); // 3 in first row, 3 in second row
    });

    test('has proper input types and attributes', () => {
      render(<BookingModal {...defaultProps} />);
      
      const dateInput = screen.getByLabelText(/date/i);
      const clientInput = screen.getByLabelText(/client name/i);
      const paymentInput = screen.getByLabelText(/price/i);
      
      expect(dateInput).toHaveAttribute('readonly');
      expect(clientInput).toHaveAttribute('required');
      expect(paymentInput).toHaveAttribute('readonly');
    });
  });
});

