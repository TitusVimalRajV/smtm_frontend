import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BalanceSheetTable from './BalanceSheetTable';
import '@testing-library/jest-dom';

// Mock the global fetch API
global.fetch = jest.fn();

const mockResponse = {
  Reports: [
    {
      ReportID: 'BalanceSheet',
      ReportName: 'Balance Sheet',
      ReportDate: '23 Feb 2018',
      Rows: [
        {
          RowType: 'Header',
          Cells: [
            { Value: '' },
            { Value: '28 Feb 2018' },
            { Value: '28 Feb 2017' }
          ]
        },
        {
          RowType: 'Section',
          Title: 'Bank',
          Rows: [
            {
              RowType: 'Row',
              Cells: [
                { Value: 'Business Account' },
                { Value: '1000.00' },
                { Value: '800.00' }
              ]
            },
            {
              RowType: 'SummaryRow',
              Cells: [
                { Value: 'Total Bank' },
                { Value: '1000.00' },
                { Value: '800.00' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

describe('BalanceSheetTable', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders balance sheet data from API', async () => {
    render(<BalanceSheetTable />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('28 Feb 2018')).toBeInTheDocument();
      expect(screen.getByText('Bank')).toBeInTheDocument();
      expect(screen.getByText('Business Account')).toBeInTheDocument();
      expect(screen.getByText('Total Bank')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API down'));

    render(<BalanceSheetTable />);

    const errorMsg = await screen.findByText(/api down/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
