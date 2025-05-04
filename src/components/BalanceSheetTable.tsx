import React, { useEffect, useState } from 'react';
import { BalanceSheetResponse, Row } from '../types';
import './BalanceSheetTable.css';

const BalanceSheetTable: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3005/balanceData')
      .then((res) => {
        console.log(res);
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((data: BalanceSheetResponse) => {
        const report = data.Reports?.[0];
        if (report?.Rows) {
          setRows(report.Rows);
        } else {
          throw new Error('Not a valid report');
        }
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      });
  }, []);

  const renderCells = (cells: any[] = []) =>
    cells.map((cell, i) => <td key={i}>{cell?.Value || ''}</td>);

  const renderRow = (row: Row, level: number = 0): React.ReactNode => {
    const indentClass = `indent-level-${level}`;
    const key = row.Title || `${row.RowType}-${Math.random()}`;

    switch (row.RowType) {
      case 'Header':
        return (
          <tr key={key} className="header-row">
            {renderCells(row.Cells)}
          </tr>
        );

      case 'Section':
        return (
          <React.Fragment key={key}>
            <tr>
              <td className={`section-title ${indentClass}`}>
                {row.Title}
              </td>
            </tr>
            {(row.Rows || []).map((childRow, index) => (
              <React.Fragment key={index}>{renderRow(childRow, level + 1)}</React.Fragment>
            ))}
          </React.Fragment>
        );

      case 'Row':
        return (
          <tr key={key}>
            {renderCells(row.Cells)}
          </tr>
        );

      case 'SummaryRow':
        return (
          <tr key={key} className="summary-row">
            {renderCells(row.Cells)}
          </tr>
        );

      default:
        return null;
    }
  };

  if (error) return <p className="error-text">Error: {error}</p>;
  if (!rows.length) return <p>Loading...</p>;

  return (
    <table className="balance-sheet-table">
      <tbody>
        {rows.map((row, index) => renderRow(row))}
      </tbody>
    </table>
  );
};

export default BalanceSheetTable;
