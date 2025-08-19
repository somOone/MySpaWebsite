import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TipModal from '../TipModal';

describe('TipModal Component', () => {
  const mockAppointment = {
    id: 1,
    client: 'John Doe',
    time: '2:00 PM',
    date: '2024-08-18',
    category: 'Massage'
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    appointment: mockAppointment
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders modal when open', () => {
      render(<TipModal {...defaultProps} />);
      
      // More specific checks to avoid duplicate text clashes (heading vs button)
      expect(screen.getByRole('heading', { name: /complete appointment/i })).toBeInTheDocument();
      expect(screen.getByText('Tip Amount (required):')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /complete appointment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      render(<TipModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('heading', { name: /complete appointment/i })).not.toBeInTheDocument();
    });

    test('displays appointment information correctly', () => {
      render(<TipModal {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM')).toBeInTheDocument();
      expect(screen.getByText('2024-08-18')).toBeInTheDocument();
      expect(screen.getByText('Massage')).toBeInTheDocument();
    });

    test('renders quick tip buttons', () => {
      render(<TipModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /no tip/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\$10/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\$15/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\$20/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\$25/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('allows typing tip amount', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      await userEvent.type(tipInput, '15.50');
      
      expect(tipInput).toHaveValue(15.5);
    });

    test('quick tip buttons set tip amount', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const tenDollarButton = screen.getByRole('button', { name: /\$10/i });
      
      await userEvent.click(tenDollarButton);
      
      expect(tipInput).toHaveValue(10);
    });

    test('no tip button sets amount to 0', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const noTipButton = screen.getByRole('button', { name: /no tip/i });
      
      // First set a tip amount
      await userEvent.type(tipInput, '20');
      expect(tipInput).toHaveValue(20);
      
      // Then click no tip
      await userEvent.click(noTipButton);
      expect(tipInput).toHaveValue(0);
    });

    test('calls onClose when cancel button is clicked', async () => {
      const mockOnClose = jest.fn();
      render(<TipModal {...defaultProps} onClose={mockOnClose} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when clicking outside modal', async () => {
      const mockOnClose = jest.fn();
      render(<TipModal {...defaultProps} onClose={mockOnClose} />);
      
      const overlay = document.querySelector('.tip-modal-overlay');
      await userEvent.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    test('shows error for negative tip amount', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      
      // Use fireEvent to force-set a negative number regardless of min constraint
      fireEvent.change(tipInput, { target: { value: '-5' } });
      await userEvent.click(completeButton);
      
      expect(screen.getByText('Tip amount cannot be negative')).toBeInTheDocument();
    });

    test('shows error for tip amount over $1000', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      
      await userEvent.type(tipInput, '1500');
      await userEvent.click(completeButton);
      
      expect(screen.getByText('Tip amount cannot exceed $1000')).toBeInTheDocument();
    });

    test('allows zero tip amount', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      
      // Tip is already 0 by default
      await userEvent.click(completeButton);
      
      // Should not show error
      expect(screen.queryByText('Tip amount cannot be negative')).not.toBeInTheDocument();
      expect(screen.queryByText('Tip amount cannot exceed $1000')).not.toBeInTheDocument();
    });

    test('clears error when valid amount is entered', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      
      // First enter invalid amount
      fireEvent.change(tipInput, { target: { value: '-5' } });
      await userEvent.click(completeButton);
      
      expect(screen.getByText('Tip amount cannot be negative')).toBeInTheDocument();
      
      // Then enter valid amount and submit again to clear
      await userEvent.clear(tipInput);
      await userEvent.type(tipInput, '20');
      await userEvent.click(completeButton);
      
      // Error should be cleared after valid submission
      expect(screen.queryByText('Tip amount cannot be negative')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('calls onConfirm with tip amount when form is submitted', async () => {
      const mockOnConfirm = jest.fn();
      render(<TipModal {...defaultProps} onConfirm={mockOnConfirm} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      
      await userEvent.type(tipInput, '25.75');
      await userEvent.click(completeButton);
      
      expect(mockOnConfirm).toHaveBeenCalledWith(25.75);
    });

    test('calls onConfirm with zero when no tip is selected', async () => {
      const mockOnConfirm = jest.fn();
      render(<TipModal {...defaultProps} onConfirm={mockOnConfirm} />);
      
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      await userEvent.click(completeButton);
      
      expect(mockOnConfirm).toHaveBeenCalledWith(0);
    });

    test('calls onConfirm with decimal tip amount', async () => {
      const mockOnConfirm = jest.fn();
      render(<TipModal {...defaultProps} onConfirm={mockOnConfirm} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      
      await userEvent.type(tipInput, '12.50');
      await userEvent.click(completeButton);
      
      expect(mockOnConfirm).toHaveBeenCalledWith(12.5);
    });
  });

  describe('State Management', () => {
    test('resets tip amount when modal is closed via Cancel and reopened', async () => {
      const { rerender } = render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      await userEvent.type(tipInput, '30');
      expect(tipInput).toHaveValue(30);
      
      // Close via Cancel which also clears state
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      
      // Reopen modal
      rerender(<TipModal {...defaultProps} isOpen={true} />);
      
      const newTipInput = screen.getByPlaceholderText('0.00');
      expect(newTipInput).toHaveValue(0);
    });

    test('resets error state when modal is closed via Cancel and reopened', async () => {
      const { rerender } = render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      
      // Create error
      fireEvent.change(tipInput, { target: { value: '-10' } });
      await userEvent.click(completeButton);
      
      expect(screen.getByText('Tip amount cannot be negative')).toBeInTheDocument();
      
      // Close via Cancel and reopen modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      rerender(<TipModal {...defaultProps} isOpen={true} />);
      
      // Error should be gone
      expect(screen.queryByText('Tip amount cannot be negative')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      const label = screen.getByText('Tip Amount (required):');
      
      expect(label).toBeInTheDocument();
      expect(tipInput).toHaveAttribute('id', 'tipAmount');
      // In the DOM attribute is "for"; in React it's htmlFor
      expect(label).toHaveAttribute('for', 'tipAmount');
    });

    test('has proper button roles and names', () => {
      render(<TipModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /complete appointment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('has proper heading structure', () => {
      render(<TipModal {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: /complete appointment/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles appointment with missing properties gracefully', () => {
      const incompleteAppointment = {
        id: 1,
        client: 'John Doe'
        // Missing time, date, category
      };
      
      expect(() => {
        render(<TipModal {...defaultProps} appointment={incompleteAppointment} />);
      }).not.toThrow();
    });

    test('handles very large tip amounts', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      await userEvent.type(tipInput, '999.99');
      
      expect(tipInput).toHaveValue(999.99);
    });

    test('handles decimal precision correctly', async () => {
      render(<TipModal {...defaultProps} />);
      
      const tipInput = screen.getByPlaceholderText('0.00');
      await userEvent.type(tipInput, '0.01');
      
      expect(tipInput).toHaveValue(0.01);
    });
  });
});

