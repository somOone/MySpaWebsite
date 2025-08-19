import React from 'react';
import { render, screen } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios', () => ({ get: jest.fn() }));

const Reports = require('../../Reports').default;

afterEach(() => jest.clearAllMocks());

const mockReport = () => ({
  period: { start: 'January 1, 2025', end: 'January 31, 2025', isCurrentMonth: true },
  summary: {
    totalRevenue: 540,
    totalTips: 90,
    totalExpenses: 55,
    netProfit: 575,
    totalAppointments: 2,
    totalExpenseItems: 2
  },
  appointments: [
    { id: 1, date: '2025-01-15', time: '9:00 AM', client: 'John Doe', category: 'Massage', payment: 120, tip: 20 },
    { id: 2, date: '2025-01-16', time: '10:00 AM', client: 'Jane Smith', category: 'Facial', payment: 100, tip: 15 }
  ],
  expenses: [
    { id: 11, date: '2025-01-15', description: 'Oil', category: 'Supplies', amount: 25 },
    { id: 12, date: '2025-01-16', description: 'Cream', category: 'Products', amount: 30 }
  ],
  charts: { labels: ['Jan'], revenue: [540], tips: [90], expenses: [55] }
});

beforeEach(() => {
  axios.get.mockResolvedValue({ data: mockReport() });
});

describe('Reports responsive structure', () => {
  test('renders summary cards, tables, and mobile cards', async () => {
    render(<Reports />);

    // Summary section
    expect(await screen.findByText('Financial Summary')).toBeInTheDocument();
    expect(screen.getByText(/Total Revenue/)).toBeInTheDocument();
    expect(screen.getByText(/Total Tips/)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses/)).toBeInTheDocument();
    expect(screen.getByText(/Net Profit/)).toBeInTheDocument();

    // Appointments table and mobile cards container present
    expect(screen.getByText(/Appointments \(2\)/)).toBeInTheDocument();
    expect(document.querySelector('table.table')).not.toBeNull();
    expect(document.querySelectorAll('.mobile-cards .appointment-card').length).toBeGreaterThan(0);

    // Expenses table and mobile cards container present
    expect(screen.getByText(/Expenses \(2\)/)).toBeInTheDocument();
    const tables = document.querySelectorAll('table.table');
    expect(tables.length).toBeGreaterThan(1);
    expect(document.querySelectorAll('.mobile-cards .appointment-card').length).toBeGreaterThan(0);
  });
});
