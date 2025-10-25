import { Table } from 'react-bootstrap';
import './MeasurementTable.css';

function MeasurementTable({ title, headers, data = [] }) {
  return (
    <div className="measurement-table-container">
      {title && <h5 className="table-title">{title}</h5>}
      <Table striped bordered hover responsive className="measurement-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center text-muted">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    {typeof cell === 'number' ? cell.toFixed(2) : cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default MeasurementTable;
