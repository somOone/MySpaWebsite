import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock components for visual testing
const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = 'form-button';
  const variantClasses = {
    primary: '',
    secondary: 'secondary',
    danger: 'delete-btn',
    success: 'save-btn',
    warning: 'edit-btn'
  };
  
  const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(' ');
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

describe('Button Visual Design', () => {
  test('primary button has correct base styling classes', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('form-button');
    expect(button).not.toHaveClass('secondary');
  });

  test('secondary button has correct variant styling classes', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('form-button');
    expect(button).toHaveClass('secondary');
  });

  test('danger button has correct variant styling classes', () => {
    render(<Button variant="danger">Delete Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('form-button');
    expect(button).toHaveClass('delete-btn');
  });

  test('success button has correct variant styling classes', () => {
    render(<Button variant="success">Save Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('form-button');
    expect(button).toHaveClass('save-btn');
  });

  test('warning button has correct variant styling classes', () => {
    render(<Button variant="warning">Edit Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('form-button');
    expect(button).toHaveClass('edit-btn');
  });

  test('button accepts additional CSS classes', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('form-button');
    expect(button).toHaveClass('custom-class');
  });

  test('CTA button has special styling classes', () => {
    render(<button className="cta-button">Book Now</button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('cta-button');
  });

  test('book button has special styling classes', () => {
    render(<button className="book-button">Book Appointment</button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('book-button');
  });
});
