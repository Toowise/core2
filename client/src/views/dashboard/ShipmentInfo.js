import React from 'react'
import PropTypes from 'prop-types'
const ShipmentInfo = ({ data }) => {
  return (
    <div id="shipment-info">
      <h2>Shipment Details</h2>
      <p>Status: {data.status}</p>
      <p>Last Updated: {data.updated_at.toLocaleDateString()}</p>
      <p>Current Location: {data.current_location}</p>
      <p>Expected Delivery: {new Date(data.expected_delivery).toLocaleDateString()}</p>
    </div>
  )
}
ShipmentInfo.propTypes = {
  data: PropTypes.shape({
    status: PropTypes.string.isRequired,
    updated_at: PropTypes.instanceOf(Date).isRequired,
    current_location: PropTypes.string.isRequired,
    expected_delivery: PropTypes.instanceOf(Date).isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
}
export default ShipmentInfo
