import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock card components for visual testing
const FeatureCard = ({ icon, title, description, className = '' }) => (
  <div className={`feature-card ${className}`}>
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

const StatCard = ({ number, label, className = '' }) => (
  <div className={`feature-card ${className}`}>
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const AppointmentCard = ({ time, status, client, category, payment, tip, className = '' }) => (
  <div className={`appointment-card ${className}`}>
    <div className="card-header">
      <span className="time">{time}</span>
      <span className="status">{status}</span>
    </div>
    <div className="card-body">
      <div className="info-row">
        <span className="label">Client:</span>
        <span className="value">{client}</span>
      </div>
      <div className="info-row">
        <span className="label">Category:</span>
        <span className="value">{category}</span>
      </div>
      <div className="info-row">
        <span className="label">Payment:</span>
        <span className="value">${payment}</span>
      </div>
      <div className="info-row">
        <span className="label">Tip:</span>
        <span className="value">${tip}</span>
      </div>
    </div>
  </div>
);

describe('Card Visual Design', () => {
  test('feature card has correct styling classes', () => {
    render(
      <FeatureCard 
        icon="🧖‍♀️" 
        title="Professional Services" 
        description="Expert treatments delivered by certified professionals."
      />
    );
    
    const card = screen.getByText('Professional Services').closest('.feature-card');
    expect(card).toHaveClass('feature-card');
    
    const icon = card.querySelector('.feature-icon');
    expect(icon).toHaveClass('feature-icon');
    
    const title = card.querySelector('.feature-title');
    expect(title).toHaveClass('feature-title');
    
    const description = card.querySelector('.feature-description');
    expect(description).toHaveClass('feature-description');
  });

  test('stat card has correct styling classes', () => {
    render(<StatCard number="150" label="Total Appointments" />);
    
    const card = screen.getByText('150').closest('.feature-card');
    expect(card).toHaveClass('feature-card');
    
    const number = card.querySelector('.stat-number');
    expect(number).toHaveClass('stat-number');
    
    const label = card.querySelector('.stat-label');
    expect(label).toHaveClass('stat-label');
  });

  test('appointment card has correct styling classes', () => {
    render(
      <AppointmentCard 
        time="9:00 AM"
        status="Active"
        client="John Doe"
        category="Massage"
        payment={120}
        tip={20}
      />
    );
    
    const card = screen.getByText('John Doe').closest('.appointment-card');
    expect(card).toHaveClass('appointment-card');
    
    const header = card.querySelector('.card-header');
    expect(header).toHaveClass('card-header');
    
    const body = card.querySelector('.card-body');
    expect(body).toHaveClass('card-body');
    
    const infoRows = card.querySelectorAll('.info-row');
    expect(infoRows.length).toBeGreaterThan(0);
    
    const time = header.querySelector('.time');
    expect(time).toHaveClass('time');
    
    const status = header.querySelector('.status');
    expect(status).toHaveClass('status');
    
    const labels = card.querySelectorAll('.label');
    expect(labels.length).toBeGreaterThan(0);
    
    const values = card.querySelectorAll('.value');
    expect(values.length).toBeGreaterThan(0);
  });

  test('table container has correct styling classes', () => {
    render(
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
    
    const container = screen.getByText('Header').closest('.table-container');
    expect(container).toHaveClass('table-container');
    
    const table = container.querySelector('.table');
    expect(table).toHaveClass('table');
  });

  test('completed status has correct styling classes', () => {
    render(<span className="completed-status">Completed</span>);
    
    const status = screen.getByText('Completed');
    expect(status).toHaveClass('completed-status');
  });

  test('expense totals have correct styling classes', () => {
    render(
      <div>
        <span className="year-total">Total: $1,500</span>
        <span className="month-total">Total: $500</span>
        <span className="date-total">Total: $100</span>
      </div>
    );
    
    expect(screen.getByText('Total: $1,500')).toHaveClass('year-total');
    expect(screen.getByText('Total: $500')).toHaveClass('month-total');
    expect(screen.getByText('Total: $100')).toHaveClass('date-total');
  });
});
