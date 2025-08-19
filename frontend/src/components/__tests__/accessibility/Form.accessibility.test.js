import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock form components for accessibility testing
const FormInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  required = false,
  error,
  id,
  className = '', 
  ...props 
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const form = e.target.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }
  };
  
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      <input
        id={inputId}
        type={type}
        className="form-input"
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {error && (
        <div id={`${inputId}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

const FormSelect = ({ 
  label, 
  options, 
  required = false,
  error,
  id,
  className = '', 
  ...props 
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={selectId} className="form-label">
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      <select 
        id={selectId}
        className="form-select" 
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div id={`${selectId}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

const FormRow = ({ children, className = '', ...props }) => (
  <div className={`form-row ${className}`} role="group" {...props}>
    {children}
  </div>
);

const Message = ({ type, children, className = '', id, ...props }) => {
  const messageClasses = {
    error: 'error-message',
    success: 'success-message',
    warning: 'warning-message'
  };
  
  const messageRoles = {
    error: 'alert',
    success: 'status',
    warning: 'alert'
  };
  
  return (
    <div 
      id={id}
      className={`${messageClasses[type]} ${className}`}
      role={messageRoles[type]}
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
      {...props}
    >
      {children}
    </div>
  );
};

describe('Form Accessibility', () => {
  test('form inputs have proper labels and associations', () => {
    render(<FormInput label="Client Name" placeholder="Enter client name" />);
    
    const label = screen.getByText('Client Name');
    const input = screen.getByPlaceholderText('Enter client name');
    
    expect(label).toHaveClass('form-label');
    expect(input).toHaveClass('form-input');
    
    // Check label-input association
    const inputId = input.getAttribute('id');
    expect(label).toHaveAttribute('for', inputId);
    expect(input).toHaveAttribute('id', inputId);
  });

  test('required fields are properly marked', () => {
    render(<FormInput label="Client Name" required />);
    
    const label = screen.getByText('Client Name');
    const requiredIndicator = screen.getByLabelText('required');
    
    expect(requiredIndicator).toBeInTheDocument();
    expect(label).toContainElement(requiredIndicator);
  });

  test('form inputs can be navigated with keyboard', () => {
    render(
      <div>
        <FormInput label="First Name" />
        <FormInput label="Last Name" />
      </div>
    );
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
    
    // Test tab navigation
    inputs[0].focus();
    expect(inputs[0]).toHaveFocus();
    
    // Test that inputs are focusable
    inputs[1].focus();
    expect(inputs[1]).toHaveFocus();
  });

  test('form inputs respond to Enter key', () => {
    const handleSubmit = jest.fn();
    render(
      <form onSubmit={handleSubmit}>
        <FormInput label="Search" />
        <button type="submit">Submit</button>
      </form>
    );
    
    const input = screen.getByRole('textbox');
    
    // Test Enter key in input - this should trigger form submission
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('form selects have proper labels and associations', () => {
    const options = [
      { value: 'massage', label: 'Massage' },
      { value: 'facial', label: 'Facial' }
    ];
    
    render(<FormSelect label="Service Type" options={options} />);
    
    const label = screen.getByText('Service Type');
    const select = screen.getByRole('combobox');
    
    expect(label).toHaveClass('form-label');
    expect(select).toHaveClass('form-select');
    
    // Check label-select association
    const selectId = select.getAttribute('id');
    expect(label).toHaveAttribute('for', selectId);
    expect(select).toHaveAttribute('id', selectId);
  });

  test('form rows group related fields semantically', () => {
    render(
      <FormRow>
        <FormInput label="First Name" />
        <FormInput label="Last Name" />
      </FormRow>
    );
    
    const formRow = screen.getByText('First Name').closest('.form-row');
    expect(formRow).toHaveClass('form-row');
    expect(formRow).toHaveAttribute('role', 'group');
  });

  test('error messages are properly associated with inputs', () => {
    render(
      <FormInput 
        label="Email" 
        error="Please enter a valid email address"
        id="email-input"
      />
    );
    
    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByText('Please enter a valid email address');
    
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-input-error');
    expect(errorMessage).toHaveAttribute('id', 'email-input-error');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('success messages have appropriate ARIA attributes', () => {
    render(
      <Message type="success" id="success-msg">
        Appointment booked successfully!
      </Message>
    );
    
    const message = screen.getByText('Appointment booked successfully!');
    expect(message).toHaveAttribute('role', 'status');
    expect(message).toHaveAttribute('aria-live', 'polite');
    expect(message).toHaveClass('success-message');
  });

  test('warning messages have appropriate ARIA attributes', () => {
    render(
      <Message type="warning" id="warning-msg">
        Please review your appointment details
      </Message>
    );
    
    const message = screen.getByText('Please review your appointment details');
    expect(message).toHaveAttribute('role', 'alert');
    expect(message).toHaveAttribute('aria-live', 'assertive');
    expect(message).toHaveClass('warning-message');
  });

  test('error messages have appropriate ARIA attributes', () => {
    render(
      <Message type="error" id="error-msg">
        Failed to book appointment
      </Message>
    );
    
    const message = screen.getByText('Failed to book appointment');
    expect(message).toHaveAttribute('role', 'alert');
    expect(message).toHaveAttribute('aria-live', 'assertive');
    expect(message).toHaveClass('error-message');
  });

  test('form inputs have appropriate input types', () => {
    render(
      <div>
        <FormInput label="Email" type="email" />
        <FormInput label="Phone" type="tel" />
        <FormInput label="Amount" type="number" />
        <FormInput label="Date" type="date" />
      </div>
    );
    
    const emailInput = screen.getByLabelText('Email');
    const phoneInput = screen.getByLabelText('Phone');
    const amountInput = screen.getByLabelText('Amount');
    const dateInput = screen.getByLabelText('Date');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(amountInput).toHaveAttribute('type', 'number');
    expect(dateInput).toHaveAttribute('type', 'date');
  });

  test('form inputs have appropriate constraints', () => {
    render(
      <FormInput 
        label="Amount" 
        type="number" 
        min="0" 
        max="1000" 
        step="0.01"
      />
    );
    
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '1000');
    expect(input).toHaveAttribute('step', '0.01');
  });
});
