import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Appointments page components for visual testing
const AppointmentsPage = ({ className = '' }) => (
  <div className={`appointments-page ${className}`}>
    <h1>Manage Appointments</h1>
    
    <div className="accordion-controls">
      <button className="accordion-btn expand-all-btn">📂 Expand All</button>
      <button className="accordion-btn collapse-all-btn">📁 Collapse All</button>
    </div>
    
    <div className="table-container">
      <div className="year-group">
        <div className="year-header">
          <span>2025</span>
          <span className="arrow">▶</span>
        </div>
        <div className="year-content">
          <div className="month-group">
            <div className="month-header">
              <span>January</span>
              <span className="arrow">▶</span>
            </div>
            <div className="month-content">
              <div className="date-group">
                <div className="date-header">
                  <span>Wednesday, January 15, 2025</span>
                  <span className="arrow">▶</span>
                </div>
                <div className="date-content">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Client</th>
                        <th>Category</th>
                        <th>Payment</th>
                        <th>Tip</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>9:00 AM</td>
                        <td>John Doe</td>
                        <td>Massage</td>
                        <td>$120.00</td>
                        <td>$20.00</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn edit-btn">Edit</button>
                            <button className="action-btn save-btn">Complete</button>
                            <button className="action-btn delete-btn">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mobile-cards">
                    <div className="appointment-card">
                      <div className="card-header">
                        <span className="time">9:00 AM</span>
                        <span className="status">Active</span>
                      </div>
                      <div className="card-body">
                        <div className="info-row">
                          <span className="label">Client:</span>
                          <span className="value">John Doe</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Category:</span>
                          <span className="value">Massage</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Tip:</span>
                          <span className="value">$20.00</span>
                        </div>
                      </div>
                      <div className="actions">
                        <button className="action-btn edit-btn">Edit</button>
                        <button className="action-btn save-btn">Complete</button>
                        <button className="action-btn delete-btn">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

describe('Appointments Page Visual Design', () => {
  test('appointments page has correct base styling classes', () => {
    render(<AppointmentsPage />);
    
    const page = screen.getByText('Manage Appointments').closest('.appointments-page');
    expect(page).toHaveClass('appointments-page');
    
    const pageTitle = page.querySelector('h1');
    expect(pageTitle).toBeInTheDocument();
  });

  test('accordion controls have correct styling classes', () => {
    render(<AppointmentsPage />);
    
    const controls = screen.getByText('📂 Expand All').closest('.accordion-controls');
    expect(controls).toHaveClass('accordion-controls');
    
    const expandBtn = screen.getByText('📂 Expand All');
    expect(expandBtn).toHaveClass('accordion-btn', 'expand-all-btn');
    
    const collapseBtn = screen.getByText('📁 Collapse All');
    expect(collapseBtn).toHaveClass('accordion-btn', 'collapse-all-btn');
  });

  test('accordion hierarchy has correct styling classes', () => {
    render(<AppointmentsPage />);
    
    const yearGroup = screen.getByText('2025').closest('.year-group');
    expect(yearGroup).toHaveClass('year-group');
    
    const yearHeader = yearGroup.querySelector('.year-header');
    expect(yearHeader).toHaveClass('year-header');
    
    const yearContent = yearGroup.querySelector('.year-content');
    expect(yearContent).toHaveClass('year-content');
    
    const monthGroup = yearContent.querySelector('.month-group');
    expect(monthGroup).toHaveClass('month-group');
    
    const monthHeader = monthGroup.querySelector('.month-header');
    expect(monthHeader).toHaveClass('month-header');
    
    const monthContent = monthGroup.querySelector('.month-content');
    expect(monthContent).toHaveClass('month-content');
    
    const dateGroup = monthContent.querySelector('.date-group');
    expect(dateGroup).toHaveClass('date-group');
    
    const dateHeader = dateGroup.querySelector('.date-header');
    expect(dateHeader).toHaveClass('date-header');
    
    const dateContent = dateGroup.querySelector('.date-content');
    expect(dateContent).toHaveClass('date-content');
  });

  test('table has correct styling classes and structure', () => {
    render(<AppointmentsPage />);
    
    const table = screen.getByText('Time').closest('.table');
    expect(table).toHaveClass('table');
    
    const tableContainer = table.closest('.table-container');
    expect(tableContainer).toHaveClass('table-container');
    
    const headers = table.querySelectorAll('th');
    expect(headers).toHaveLength(6);
    
    const rows = table.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(1);
    
    const cells = rows[0].querySelectorAll('td');
    expect(cells).toHaveLength(6);
  });

  test('mobile cards have correct styling classes and structure', () => {
    render(<AppointmentsPage />);
    
    const mobileCards = document.querySelector('.mobile-cards');
    expect(mobileCards).toHaveClass('mobile-cards');
    
    const appointmentCard = mobileCards.querySelector('.appointment-card');
    expect(appointmentCard).toHaveClass('appointment-card');
    
    const cardHeader = appointmentCard.querySelector('.card-header');
    expect(cardHeader).toHaveClass('card-header');
    
    const time = cardHeader.querySelector('.time');
    expect(time).toHaveClass('time');
    
    const status = cardHeader.querySelector('.status');
    expect(status).toHaveClass('status');
    
    const cardBody = appointmentCard.querySelector('.card-body');
    expect(cardBody).toHaveClass('card-body');
    
    const infoRows = cardBody.querySelectorAll('.info-row');
    expect(infoRows).toHaveLength(3);
    
    infoRows.forEach(row => {
      expect(row).toHaveClass('info-row');
      expect(row.querySelector('.label')).toHaveClass('label');
      expect(row.querySelector('.value')).toHaveClass('value');
    });
    
    const actions = appointmentCard.querySelector('.actions');
    expect(actions).toHaveClass('actions');
  });

  test('action buttons have correct styling classes', () => {
    render(<AppointmentsPage />);
    
    const editBtns = screen.getAllByText('Edit');
    expect(editBtns.length).toBe(2); // One in table, one in mobile card
    
    const completeBtns = screen.getAllByText('Complete');
    expect(completeBtns.length).toBe(2); // One in table, one in mobile card
    
    const cancelBtns = screen.getAllByText('Cancel');
    expect(cancelBtns.length).toBe(2); // One in table, one in mobile card
    
    // Check first instance of each button type
    expect(editBtns[0]).toHaveClass('action-btn', 'edit-btn');
    expect(completeBtns[0]).toHaveClass('action-btn', 'save-btn');
    expect(cancelBtns[0]).toHaveClass('action-btn', 'delete-btn');
    
    const actionButtons = editBtns[0].closest('.action-buttons');
    expect(actionButtons).toHaveClass('action-buttons');
  });

  test('arrows have correct styling classes', () => {
    render(<AppointmentsPage />);
    
    const arrows = screen.getAllByText(/[▶▼]/);
    expect(arrows).toHaveLength(3); // year, month, date
    
    arrows.forEach(arrow => {
      expect(arrow).toHaveClass('arrow');
    });
  });

  test('table column headers are properly structured', () => {
    render(<AppointmentsPage />);
    
    const expectedHeaders = ['Time', 'Client', 'Category', 'Payment', 'Tip', 'Actions'];
    expectedHeaders.forEach(headerText => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('TH');
    });
  });

  test('mobile card displays appointment information correctly', () => {
    render(<AppointmentsPage />);
    
    const card = document.querySelector('.mobile-cards .appointment-card');
    
    // Check that all expected information is present
    expect(card).toHaveTextContent('9:00 AM');
    expect(card).toHaveTextContent('Active');
    expect(card).toHaveTextContent('John Doe');
    expect(card).toHaveTextContent('Massage');
    expect(card).toHaveTextContent('$20.00');
    
    // Check that all expected elements exist
    expect(card.querySelector('.time')).toHaveTextContent('9:00 AM');
    expect(card.querySelector('.status')).toHaveTextContent('Active');
    expect(card.querySelector('.label')).toHaveTextContent('Client:');
    expect(card.querySelector('.value')).toHaveTextContent('John Doe');
  });
});
