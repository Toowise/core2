import React from 'react';

const ShipmentHistory = ({ history }) => {
  return (
    <div id="shipment-history">
      <h2>Shipment History</h2>
      <table id="history-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Date Received</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(history) && history.length > 0 ? (
            history.map((entry, index) => (
              <tr key={index}>
                <td>{entry.status}</td>
                <td>{new Date(entry.updated_at).toLocaleString()}</td>
                <td>{entry.location}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No shipment history available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentHistory;
