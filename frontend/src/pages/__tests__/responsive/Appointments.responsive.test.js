import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios', () => ({
  get: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

const Appointments = require('../../Appointments').default;

const buildGrouped = () => ({
  '2025': {
    'January': {
      '2025-01-15': [
        { id: 1, time: '9:00 AM', client: 'John Doe', category: 'Massage', payment: 120, tip: 20, status: 'pending' },
        { id: 2, time: '2:00 PM', client: 'Jane Smith', category: 'Facial', payment: 100, tip: 15, status: 'completed' },
      ],
    },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: { grouped: buildGrouped() } });
  // Reset location.search to avoid auto-expansion by date param
  Object.defineProperty(window, 'location', { value: { search: '' }, writable: true });
});

const expandToDate = async () => {
  // Wait for data load and controls
  const expandBtn = await screen.findByRole('button', { name: /Expand All/i });
  fireEvent.click(expandBtn);
  // Date content should now be available; prefer attribute selector
  const dateGroup = document.querySelector('[data-date="2025-01-15"]');
  return dateGroup;
};

describe('Appointments responsive structure', () => {
  test('renders table and mobile cards for expanded date with matching item counts', async () => {
    render(<Appointments />);

    const dateGroup = await expandToDate();
    const dateContent = dateGroup && dateGroup.querySelector('.date-content');
    expect(dateContent).not.toBeNull();

    const table = dateContent && dateContent.querySelector('table.table');
    const tbodyRows = table ? table.querySelectorAll('tbody tr') : [];
    expect(table).not.toBeNull();
    expect(tbodyRows.length).toBe(2);

    const mobileCardsContainer = dateContent && dateContent.querySelector('.mobile-cards');
    const mobileCards = mobileCardsContainer ? mobileCardsContainer.querySelectorAll('.appointment-card') : [];
    expect(mobileCardsContainer).not.toBeNull();
    expect(mobileCards.length).toBe(2);
  });

  test('action buttons exist in both table rows and mobile cards', async () => {
    render(<Appointments />);

    const dateGroup = await expandToDate();
    const dateContent = dateGroup && dateGroup.querySelector('.date-content');

    // Table buttons
    const table = dateContent && dateContent.querySelector('table.table');
    const firstRow = table && table.querySelector('tbody tr');
    if (firstRow) {
      expect(within(firstRow).getByText('Edit')).toBeInTheDocument();
      expect(within(firstRow).getByText(/Complete|Completed/)).toBeInTheDocument();
    }

    // Mobile card buttons
    const mobileCard = dateContent && dateContent.querySelector('.mobile-cards .appointment-card');
    if (mobileCard) {
      expect(within(mobileCard).getByText('Edit')).toBeInTheDocument();
      expect(within(mobileCard).getByText(/Complete|Completed/)).toBeInTheDocument();
    }
  });
});
