import React from 'react';

const ShipmentInfo = ({ data }) => {
  return (
    <div id="shipment-info">
      <h2>Shipment Details</h2>
      <p>Status: {data.status}</p>
      <p>Last Updated: {new Date(data.updated_at).toLocaleString()}</p>
      <p>Current Location: {data.current_location}</p>
      <p>Expected Delivery: {new Date(data.expected_delivery).toLocaleDateString()}</p>
    </div>
  );
};

export default ShipmentInfo;
