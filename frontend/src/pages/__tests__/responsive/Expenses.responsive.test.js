import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const Expenses = require('../../Expenses').default;

const buildGrouped = () => ({
  '2025': {
    'January': {
      '2025-01-15': [
        { id: 11, date: '2025-01-15', description: 'Oil', amount: 25, category: 'Supplies' },
        { id: 12, date: '2025-01-15', description: 'Cream', amount: 30, category: 'Products' },
      ],
    },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: [
    { month: '2025-01', expenses: buildGrouped()['2025']['January']['2025-01-15'] },
  ]});
});

const expandToDate = async () => {
  const expandBtn = await screen.findByRole('button', { name: /Expand All/i });
  fireEvent.click(expandBtn);
  const dateHeaderTextEl = screen.getByText(/January 15, 2025/);
  return dateHeaderTextEl.closest('.date-group');
};

describe('Expenses responsive structure', () => {
  test('renders table and mobile cards for expanded date with matching item counts', async () => {
    render(<Expenses />);

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
});
