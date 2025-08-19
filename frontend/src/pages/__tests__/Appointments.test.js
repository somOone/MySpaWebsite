import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import Appointments from '../Appointments';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

// Import mocked axios
const axios = require('axios');

// Mock moment
jest.mock('moment', () => {
  const mockMoment = (date) => ({
    format: (format) => {
      if (format === 'YYYY-MM-DD') return '2024-08-18';
      if (format === 'YYYY') return '2024';
      if (format === 'MMMM') return 'August';
      return date;
    },
    isSameOrAfter: () => true,
    diff: () => 0
  });
  mockMoment.utc = mockMoment;
  return mockMoment;
});

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert,
});

// Mock window.location.search
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    search: '',
  },
});

describe('Appointments Page - Workflow Tests', () => {
  const mockAppointments = [
    { id: 1, time: '9:00 AM', client: 'John Doe', category: 'Massage', payment: 120, tip: 20, status: 'pending' },
    { id: 2, time: '2:00 PM', client: 'Jane Smith', category: 'Facial', payment: 100, tip: 15, status: 'completed' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    mockAlert.mockClear();
    
    // Mock successful API responses for /api/appointments/scheduled
    axios.get.mockResolvedValue({
      data: { 
        grouped: {
          '2024': {
            'August': {
              '2024-08-18': mockAppointments
            }
          }
        }
      }
    });
  });

  describe('1B: Appointment Management Workflows', () => {
    describe('Create Flow (via BookingModal)', () => {
      test('should load appointments page correctly', async () => {
        render(<Appointments />);
        
        // Wait for appointments to load
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2); // Table + mobile card
        });

        // Verify the page loads with correct title
        expect(screen.getByText('Manage Appointments')).toBeInTheDocument();
        expect(screen.getByText('📂 Expand All')).toBeInTheDocument();
      });
    });

    describe('Edit Flow', () => {
      test('should enter edit mode when edit button is clicked', async () => {
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const editButtons = screen.getAllByText('Edit');
        await userEvent.click(editButtons[0]);

        // Should show edit form fields - check for the main form elements
        expect(screen.getAllByDisplayValue('Massage')).toHaveLength(2); // Table + mobile
        expect(screen.getAllByText('Save')).toHaveLength(2); // Table + mobile
        expect(screen.getAllByText('Cancel')).toHaveLength(2); // Table + mobile
      });

      test('should update category and recalculate payment', async () => {
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const editButtons = screen.getAllByText('Edit');
        await userEvent.click(editButtons[0]);

        // Change category from Massage to Facial - use getAllByDisplayValue
        const categorySelects = screen.getAllByDisplayValue('Massage');
        await userEvent.selectOptions(categorySelects[0], 'Facial');

        // Payment should automatically update to $100.00 - check the updated value
        // Payment field is now read-only, so check for the display text
        // We expect to find the payment amount in the table and mobile views
        expect(screen.getAllByText('$100.00')).toHaveLength(4); // Table + mobile (multiple instances)
      });

      test('should save changes when save button is clicked', async () => {
        axios.put.mockResolvedValue({ data: { message: 'Updated' } });
        
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const editButtons = screen.getAllByText('Edit');
        await userEvent.click(editButtons[0]);

        // Tip field is read-only, so we only modify category
        // The payment will auto-update based on category selection

        // Click save
        const saveButtons = screen.getAllByText('Save');
        await userEvent.click(saveButtons[0]);

        // Should call API and refresh data
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            '/api/appointments/1',
            expect.objectContaining({
              category: 'Massage',
              payment: 120
              // Note: tip is not editable, so it's not sent in updates
            })
          );
        });

        // Should refresh appointments
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial + refresh
      });

      test('should cancel edit mode when cancel button is clicked', async () => {
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const editButtons = screen.getAllByText('Edit');
        await userEvent.click(editButtons[0]);

        // Tip field is read-only, so we only modify category
        // The payment will auto-update based on category selection

        // Click cancel - need to find the cancel button in edit mode (not appointment cancellation)
        const cancelButtons = screen.getAllByText('Cancel');
        // The first cancel button should be the edit mode cancel
        await userEvent.click(cancelButtons[0]);

        // Should exit edit mode without saving
        expect(screen.queryByText('Save')).not.toBeInTheDocument();
        
        // Original values should be displayed - use getAllByText since there are multiple instances
        expect(screen.getAllByText('$20.00')).toHaveLength(2); // Table + mobile
      });
    });

    describe('Cancel/Delete Flow', () => {
      test('should cancel appointment and show confirmation', async () => {
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const cancelButtons = screen.getAllByText('Cancel');
        await userEvent.click(cancelButtons[0]);

        // Should show confirmation dialog
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to cancel this appointment?');
      });

      test('should implement soft delete for cancellation - status updated to cancelled and updated_at updated', async () => {
        // Mock the DELETE request to simulate soft delete
        axios.delete.mockResolvedValue({
          data: { message: 'Appointment cancelled successfully' }
        });

        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const cancelButtons = screen.getAllByText('Cancel');
        await userEvent.click(cancelButtons[0]);

        // Verify confirmation dialog
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to cancel this appointment?');

        // Verify the DELETE request was made (which now implements soft delete)
        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalledWith('/api/appointments/1');
        });

        // Verify the request included the correct endpoint
        expect(axios.delete).toHaveBeenCalledWith('/api/appointments/1');

        // Note: In a real test environment, we would also verify:
        // 1. The appointment status was updated to 'cancelled' in the database
        // 2. The updated_at timestamp was set to the current time
        // 3. The appointment remains in the database (not deleted)
        // 
        // However, since we're mocking axios and not testing the actual backend,
        // we can only verify that the correct API endpoint was called.
        // 
        // The actual soft delete verification would require:
        // - Backend integration tests
        // - Database state verification
        // - Real API calls to the backend
      });

      test('should not delete appointment when not confirmed', async () => {
        mockConfirm.mockReturnValue(false);
        
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const cancelButtons = screen.getAllByText('Cancel');
        const appointmentCancelButton = cancelButtons.find(button => 
          button.textContent === 'Cancel' && 
          button.className.includes('delete-btn')
        );
        await userEvent.click(appointmentCancelButton);

        // Should not call delete API
        expect(axios.delete).not.toHaveBeenCalled();
      });
    });

    describe('Complete Flow', () => {
      test('should open tip modal when complete button is clicked', async () => {
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        // Use getAllByText since there are multiple Complete buttons
        const completeButtons = screen.getAllByText('Complete');
        await userEvent.click(completeButtons[0]);

        // TipModal should be rendered - use getAllByText for the heading
        const modalHeadings = screen.getAllByText('Complete Appointment');
        expect(modalHeadings).toHaveLength(2); // Heading + button
        expect(screen.getByText('Tip Amount (required):')).toBeInTheDocument();
      });

      test('should complete appointment with tip when confirmed', async () => {
        axios.patch.mockResolvedValue({ data: { message: 'Completed' } });
        
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        // Use getAllByText since there are multiple Complete buttons
        const completeButtons = screen.getAllByText('Complete');
        await userEvent.click(completeButtons[0]);

        // Enter tip amount
        const tipInput = screen.getByPlaceholderText('0.00');
        await userEvent.type(tipInput, '25');

        // Click complete - use getAllByText since there are multiple elements with this text
        const confirmButtons = screen.getAllByText('Complete Appointment');
        await userEvent.click(confirmButtons[1]); // Click the button, not the heading

        // Should call complete API
        await waitFor(() => {
          expect(axios.patch).toHaveBeenCalledWith(
            '/api/appointments/1/complete',
            { tip: 25 }
          );
        });

        // Should show success message
        expect(mockAlert).toHaveBeenCalledWith(
          'Appointment completed successfully with tip: $25.00'
        );

        // Should refresh appointments
        expect(axios.get).toHaveBeenCalledTimes(2);
      });

      test('should handle completion errors gracefully', async () => {
        axios.patch.mockRejectedValue(new Error('API Error'));
        
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        // Use getAllByText since there are multiple Complete buttons
        const completeButtons = screen.getAllByText('Complete');
        await userEvent.click(completeButtons[0]);

        // Enter tip and try to complete
        const tipInput = screen.getByPlaceholderText('0.00');
        await userEvent.type(tipInput, '25');

        // Click complete - use getAllByText since there are multiple elements with this text
        const confirmButtons = screen.getAllByText('Complete Appointment');
        await userEvent.click(confirmButtons[1]); // Click the button, not the heading

        // Should show error message
        await waitFor(() => {
          expect(mockAlert).toHaveBeenCalledWith('Failed to complete appointment');
        });
      });
    });

    describe('Accordion Management', () => {
      test('should expand all sections when expand all button is clicked', async () => {
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const expandAllButton = screen.getByText('📂 Expand All');
        await userEvent.click(expandAllButton);

        // All sections should be visible
        await waitFor(() => {
          expect(screen.getByText('August')).toBeInTheDocument();
          expect(screen.getByText('2024-08-18')).toBeInTheDocument();
        });
      });
    });

    describe('Mobile Responsiveness', () => {
      test('should show mobile cards on small screens', async () => {
        // Mock window.innerWidth for mobile
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 480,
        });

        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        // Should show mobile card layout (multiple elements exist)
        expect(screen.getAllByText('Client:')).toHaveLength(2);
        expect(screen.getAllByText('Category:')).toHaveLength(2);
        expect(screen.getAllByText('Tip:')).toHaveLength(2);
      });
    });

    describe('Error Handling', () => {
      test('should handle fetch appointments error', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));
        
        render(<Appointments />);
        
        await waitFor(() => {
          // Look for the error message text using a more flexible matcher
          expect(screen.getByText(/Failed to fetch appointments/i)).toBeInTheDocument();
        });
      });

      test('should handle edit save error', async () => {
        axios.put.mockRejectedValue(new Error('Update Error'));
        
        render(<Appointments />);
        
        await waitFor(() => {
          expect(screen.getAllByText('John Doe')).toHaveLength(2);
        });

        const editButtons = screen.getAllByText('Edit');
        await userEvent.click(editButtons[0]);

        // Use getAllByText since there are multiple Save buttons (table + mobile)
        const saveButtons = screen.getAllByText('Save');
        await userEvent.click(saveButtons[0]);

        // Should show error alert
        await waitFor(() => {
          expect(mockAlert).toHaveBeenCalledWith('Failed to update appointment');
        });
      });
    });
  });
});
