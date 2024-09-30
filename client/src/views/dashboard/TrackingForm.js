import React, { useState } from 'react';
import axios from 'axios';
import ShipmentHistory from './ShipmentHistory';
import ShipmentInfo from './ShipmentInfo';

const TrackingForm = () => {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipmentData, setShipmentData] = useState(null)
  const [shipmentHistory, setShipmentHistory] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!trackingNumber) {
      alert('Please enter a tracking number.')
      return
    }

    try {
      const response = await axios.post('http://localhost:5000/track', { trackingNumber })
      const data = response.data

      if (data.status === 'error') {
        alert(data.message)
        return
      }

      setShipmentData(data)

      const historyResponse = await axios.get(
        `http://localhost:5000/shipment-history/${trackingNumber}`,
      )
      const historyData = historyResponse.data

      if (historyData.status === 'success') {
        setShipmentHistory(historyData.data)
      } else {
        setShipmentHistory([])
      }
    } catch (error) {
      console.error('Error fetching shipment data:', error)
      alert('An error occurred while fetching shipment data. Please try again later.')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="center-elements">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
        />
        <button type="submit">Track</button>
      </form>

      {shipmentData ? <ShipmentInfo data={shipmentData} /> : null}
      {shipmentHistory ? <ShipmentHistory history={shipmentHistory} /> : null}
      
    </div>
  )
}

export default TrackingForm
