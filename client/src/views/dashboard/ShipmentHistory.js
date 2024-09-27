import React from 'react';

const ShipmentHistory = ({ history }) => {
  return (
    <div id="shipment-history">
      <h2>Shipment History</h2>
      <table id="history-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Updated At</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={index}>
              <td>{entry.status}</td>
              <td>{new Date(entry.updated_at).toLocaleString()}</td>
              <td>{entry.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentHistory;