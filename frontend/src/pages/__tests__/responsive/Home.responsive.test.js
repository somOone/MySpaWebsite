import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios', () => ({ get: jest.fn() }));

const Home = require('../../Home').default;

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: {
    today: { date: '2025-01-15', appointments: 2, revenue: 220 },
    totals: { appointments: 4, revenue: 540, clients: 4 },
    spaServices: { allTime: { massages: 2, facials: 1, combos: 1 }, currentYear: { massages: 2, facials: 1, combos: 1 } }
  }});
});

describe('Home responsive structure', () => {
  test('renders compact hero and features sections', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome to Serenity Spa')).toBeInTheDocument();
    expect(screen.getByText('Book New Appointment')).toBeInTheDocument();

    // Current year stats labels exist
    expect(screen.getAllByText('Massages').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Facials').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Combos').length).toBeGreaterThan(0);

    // Features present
    expect(screen.getByText('Professional Services')).toBeInTheDocument();
    expect(screen.getByText('Natural Products')).toBeInTheDocument();
    expect(screen.getByText('Luxury Experience')).toBeInTheDocument();
  });
});
