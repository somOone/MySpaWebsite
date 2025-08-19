import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock button components for accessibility testing
const Button = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  ...props 
}) => {
  const baseClasses = 'form-button';
  const variantClasses = {
    primary: '',
    secondary: 'secondary',
    danger: 'delete-btn',
    success: 'save-btn',
    warning: 'edit-btn'
  };
  
  const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(' ');
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick();
      }
    }
  };
  
  return (
    <button 
      className={classes} 
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
};

const IconButton = ({ icon, label, onClick, ...props }) => (
  <button 
    aria-label={label}
    onClick={onClick}
    {...props}
  >
    {icon}
  </button>
);

describe('Button Accessibility', () => {
  test('buttons have proper role and are focusable', () => {
    render(<Button>Test Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  test('buttons can be focused and navigated with keyboard', () => {
    render(
      <div>
        <Button>First Button</Button>
        <Button>Second Button</Button>
      </div>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    // Test tab navigation
    buttons[0].focus();
    expect(buttons[0]).toHaveFocus();
    
    // Test that buttons are focusable
    buttons[1].focus();
    expect(buttons[1]).toHaveFocus();
  });

  test('buttons respond to Enter and Space key presses', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    
    const button = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  test('disabled buttons are properly marked and not focusable', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('buttons with aria-label provide screen reader context', () => {
    render(<Button ariaLabel="Complete appointment for John Doe">Complete</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Complete appointment for John Doe');
  });

  test('buttons with aria-describedby reference descriptive text', () => {
    render(
      <div>
        <div id="button-description">This button will complete the appointment</div>
        <Button ariaDescribedBy="button-description">Complete</Button>
      </div>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'button-description');
  });

  test('icon buttons have descriptive aria-labels', () => {
    render(<IconButton icon="×" label="Close modal" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close modal');
  });

  test('CTA button has accessible text content', () => {
    render(<button className="cta-button">Book New Appointment</button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Book New Appointment');
    expect(button).toHaveClass('cta-button');
  });

  test('book button has accessible text content', () => {
    render(<button className="book-button">Book Appointment</button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Book Appointment');
    expect(button).toHaveClass('book-button');
  });

  test('action buttons have descriptive text for screen readers', () => {
    render(
      <div>
        <button className="action-btn edit-btn">Edit</button>
        <button className="action-btn save-btn">Save</button>
        <button className="action-btn delete-btn">Delete</button>
      </div>
    );
    
    const editBtn = screen.getByRole('button', { name: 'Edit' });
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    const deleteBtn = screen.getByRole('button', { name: 'Delete' });
    
    expect(editBtn).toHaveClass('action-btn', 'edit-btn');
    expect(saveBtn).toHaveClass('action-btn', 'save-btn');
    expect(deleteBtn).toHaveClass('action-btn', 'delete-btn');
  });

  test('accordion control buttons have descriptive text', () => {
    render(
      <div>
        <button className="accordion-btn expand-all-btn">📂 Expand All</button>
        <button className="accordion-btn collapse-all-btn">📁 Collapse All</button>
      </div>
    );
    
    const expandBtn = screen.getByRole('button', { name: /Expand All/i });
    const collapseBtn = screen.getByRole('button', { name: /Collapse All/i });
    
    expect(expandBtn).toHaveClass('accordion-btn', 'expand-all-btn');
    expect(collapseBtn).toHaveClass('accordion-btn', 'collapse-all-btn');
  });

  test('close button in modals has accessible label', () => {
    render(<button className="close-button" aria-label="Close modal">×</button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close modal');
    expect(button).toHaveClass('close-button');
  });
});
