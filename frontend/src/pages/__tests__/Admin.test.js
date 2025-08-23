import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Admin from '../Admin';

// Mock axios
jest.mock('axios');

// Mock AdminLogin component
jest.mock('../../components/AdminLogin', () => {
  return function MockAdminLogin({ onLoginSuccess }) {
    return (
      <div data-testid="admin-login">
        <button onClick={() => onLoginSuccess('testuser')}>Login</button>
      </div>
    );
  };
});

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date) => 'Jan 15, 2025'),
  parseISO: jest.fn((date) => new Date('2025-01-15'))
}));

const mockAppointments = [
  {
    id: 1,
    client: 'John Doe',
    date: '2025-01-15',
    time: '2:30 PM',
    category: 'Facial',
    payment: 75.00,
    tip: 15.00,
    status: 'completed',
    update_reason: 'Initial booking'
  },
  {
    id: 2,
    client: 'Jane Smith',
    date: '2025-01-16',
    time: '3:00 PM',
    category: 'Massage',
    payment: 90.00,
    tip: 18.00,
    status: 'pending',
    update_reason: 'Initial booking'
  }
];

const mockExpenses = [
  {
    id: 1,
    description: 'Supplies',
    amount: 25.50,
    date: '2025-01-15',
    category_id: 1,
    category_name: 'Supplies'
  },
  {
    id: 2,
    description: 'Equipment',
    amount: 150.00,
    date: '2025-01-16',
    category_id: 2,
    category_name: 'Equipment'
  }
];

const mockCategories = [
  { id: 1, name: 'Supplies' },
  { id: 2, name: 'Equipment' }
];

const mockStats = {
  appointments: { total: 10, completed: 7, pending: 2, cancelled: 1 },
  expenses: { total: 15, total_amount: 1250.75 },
  recentActivity: [
    { type: 'appointment', name: 'John Doe', date: '2025-01-15' },
    { type: 'expense', name: 'Supplies', date: '2025-01-15' }
  ]
};

const renderAdmin = () => {
  return render(
    <BrowserRouter>
      <Admin />
    </BrowserRouter>
  );
};

describe('Admin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful authentication check
    axios.get.mockResolvedValue({ data: { authenticated: true, username: 'testuser' } });
  });

  describe('Authentication', () => {
    it('should show login form when not authenticated', async () => {
      axios.get.mockResolvedValue({ data: { authenticated: false } });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByTestId('admin-login')).toBeInTheDocument();
      });
    });

    it('should show admin interface when authenticated', async () => {
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });
    });

    it('should handle login success', async () => {
      axios.get.mockResolvedValue({ data: { authenticated: false } });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByTestId('admin-login')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle logout', async () => {
      axios.post.mockResolvedValue({ data: { success: true } });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('admin-login')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Statistics', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { authenticated: true, username: 'testuser' } })
        .mockResolvedValueOnce({ data: mockStats });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should display appointment statistics', async () => {
      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // Total appointments
        expect(screen.getByText('7')).toBeInTheDocument(); // Completed
        expect(screen.getByText('2')).toBeInTheDocument(); // Pending
        expect(screen.getByText('1')).toBeInTheDocument(); // Cancelled
      });
    });

    it('should display expense statistics', async () => {
      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument(); // Total expenses
        expect(screen.getByText('$1,250.75')).toBeInTheDocument(); // Total amount
      });
    });

    it('should display recent activity', async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Supplies')).toBeInTheDocument();
      });
    });
  });

  describe('Appointments Management', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { authenticated: true, username: 'testuser' } })
        .mockResolvedValueOnce({ data: mockStats })
        .mockResolvedValueOnce({ data: mockAppointments });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      // Navigate to appointments tab
      fireEvent.click(screen.getByText('Appointments'));
    });

    it('should load and display appointments', async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Facial')).toBeInTheDocument();
        expect(screen.getByText('Massage')).toBeInTheDocument();
      });
    });

    it('should filter appointments by date', async () => {
      const dateInput = screen.getByDisplayValue('2025-08-22');
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } });
      
      fireEvent.click(screen.getByText('Search'));
      
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/appointments?date=2025-01-15',
        { withCredentials: true }
      );
    });

    it('should filter appointments by client name', async () => {
      const clientInput = screen.getByPlaceholderText('Search by client name...');
      fireEvent.change(clientInput, { target: { value: 'John' } });
      
      fireEvent.click(screen.getByText('Search'));
      
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/appointments?client=John',
        { withCredentials: true }
      );
    });

    it('should start editing appointment', async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Should show edit form
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });

    it('should save appointment edits', async () => {
      axios.put.mockResolvedValue({ data: { success: true } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Update fields
      const clientInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(clientInput, { target: { value: 'John Updated' } });

      const updateReasonInput = screen.getByPlaceholderText('Reason for update...');
      fireEvent.change(updateReasonInput, { target: { value: 'Name correction' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          'http://localhost:5001/api/admin/appointments/1',
          expect.objectContaining({
            client: 'John Updated',
            update_reason: 'Name correction'
          }),
          { withCredentials: true }
        );
      });
    });

    it('should validate required fields during editing', async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Clear required field
      const updateReasonInput = screen.getByPlaceholderText('Reason for update...');
      fireEvent.change(updateReasonInput, { target: { value: '' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Update reason is required for admin modifications')).toBeInTheDocument();
      });
    });

    it('should delete appointment with reason', async () => {
      axios.delete.mockResolvedValue({ data: { success: true } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Should prompt for reason
      const reasonInput = screen.getByPlaceholderText('Reason for deletion...');
      fireEvent.change(reasonInput, { target: { value: 'Client cancelled' } });

      fireEvent.click(screen.getByText('Confirm Delete'));

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
          'http://localhost:5001/api/admin/appointments/1',
          { 
            data: { update_reason: 'Client cancelled' },
            withCredentials: true 
          }
        );
      });
    });

    it('should handle category change and update payment', async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Change category
      const categorySelect = screen.getByDisplayValue('Facial');
      fireEvent.change(categorySelect, { target: { value: 'Massage' } });

      // Payment should update automatically
      const paymentInput = screen.getByDisplayValue('90');
      expect(paymentInput).toBeInTheDocument();
    });
  });

  describe('Expenses Management', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { authenticated: true, username: 'testuser' } })
        .mockResolvedValueOnce({ data: mockStats })
        .mockResolvedValueOnce({ data: mockExpenses })
        .mockResolvedValueOnce({ data: mockCategories });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      // Navigate to expenses tab
      fireEvent.click(screen.getByText('Expenses'));
    });

    it('should load and display expenses', async () => {
      await waitFor(() => {
        expect(screen.getByText('Supplies')).toBeInTheDocument();
        expect(screen.getByText('Equipment')).toBeInTheDocument();
        expect(screen.getByText('$25.50')).toBeInTheDocument();
        expect(screen.getByText('$150.00')).toBeInTheDocument();
      });
    });

    it('should filter expenses by date', async () => {
      const dateInput = screen.getByDisplayValue('2025-08-22');
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } });
      
      fireEvent.click(screen.getByText('Search'));
      
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/expenses?date=2025-01-15',
        { withCredentials: true }
      );
    });

    it('should filter expenses by description', async () => {
      const descriptionInput = screen.getByPlaceholderText('Search by description...');
      fireEvent.change(descriptionInput, { target: { value: 'Supplies' } });
      
      fireEvent.click(screen.getByText('Search'));
      
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/expenses?description=Supplies',
        { withCredentials: true }
      );
    });

    it('should start editing expense', async () => {
      await waitFor(() => {
        expect(screen.getByText('Supplies')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Should show edit form
      expect(screen.getByDisplayValue('Supplies')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25.5')).toBeInTheDocument();
    });

    it('should save expense edits', async () => {
      axios.put.mockResolvedValue({ data: { success: true } });
      
      await waitFor(() => {
        expect(screen.getByText('Supplies')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Update fields
      const descriptionInput = screen.getByDisplayValue('Supplies');
      fireEvent.change(descriptionInput, { target: { value: 'Updated Supplies' } });

      const amountInput = screen.getByDisplayValue('25.5');
      fireEvent.change(amountInput, { target: { value: '30.00' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          'http://localhost:5001/api/admin/expenses/1',
          expect.objectContaining({
            description: 'Updated Supplies',
            amount: 30.00
          }),
          { withCredentials: true }
        );
      });
    });

    it('should delete expense', async () => {
      axios.delete.mockResolvedValue({ data: { success: true } });
      
      await waitFor(() => {
        expect(screen.getByText('Supplies')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Should show confirmation dialog
      expect(screen.getByText('Are you sure you want to delete this expense?')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Confirm Delete'));

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
          'http://localhost:5001/api/admin/expenses/1',
          { withCredentials: true }
        );
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { authenticated: true, username: 'testuser' } })
        .mockResolvedValueOnce({ data: mockStats })
        .mockResolvedValueOnce({ data: mockAppointments });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should show mobile cards on small screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Navigate to appointments to see mobile view
      fireEvent.click(screen.getByText('Appointments'));

      // Should show mobile cards
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should show table view on larger screens', () => {
      // Mock window.innerWidth for desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Navigate to appointments to see table view
      fireEvent.click(screen.getByText('Appointments'));

      // Should show table headers
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { authenticated: true, username: 'testuser' } })
        .mockResolvedValueOnce({ data: mockStats });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should display error messages', async () => {
      axios.get.mockRejectedValue({ 
        response: { data: { error: 'Failed to fetch appointments' } } 
      });

      fireEvent.click(screen.getByText('Appointments'));

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch appointments')).toBeInTheDocument();
      });
    });

    it('should display success messages', async () => {
      axios.put.mockResolvedValue({ data: { success: true } });
      
      fireEvent.click(screen.getByText('Appointments'));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const updateReasonInput = screen.getByPlaceholderText('Reason for update...');
      fireEvent.change(updateReasonInput, { target: { value: 'Test update' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Appointment updated successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Date and Time Handling', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { authenticated: true, username: 'testuser' } })
        .mockResolvedValueOnce({ data: mockStats })
        .mockResolvedValueOnce({ data: mockAppointments });
      
      renderAdmin();
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should format dates correctly for display', async () => {
      fireEvent.click(screen.getByText('Appointments'));

      await waitFor(() => {
        expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument();
        expect(screen.getByText('Jan 16, 2025')).toBeInTheDocument();
      });
    });

    it('should handle time format conversion for editing', async () => {
      fireEvent.click(screen.getByText('Appointments'));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Time should be converted to 24-hour format for HTML input
      const timeInput = screen.getByDisplayValue('14:30');
      expect(timeInput).toBeInTheDocument();
    });
  });
});
