import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ring } from 'ldrs'
ring.register()
const ShipmentHistory = ({}) => {
  const [shipmentHistory, setShipmentHistory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShipmentHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/history')
        const data = response.data

        if (data.status === 'success') {
          setShipmentHistory(data.data)
        } else {
          setShipmentHistory([])
        }
      } catch (error) {
        console.error('Error fetching shipment history:', error)
        setShipmentHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchShipmentHistory()
  }, [])
  return (
    <div id="shipment-history" className="">
      <h2 className="">Shipment History</h2>
      {loading ? (
        <span>
          <l-ring size="40" stroke="5" bg-opacity="0" speed="2" color="black" />
        </span>
      ) : (
        <table id="history-table">
          <thead>
            <tr>
              <th>Tracking Number</th>
              <th>Status</th>
              <th>Date Received</th>
              <th> Delivery Address</th>
            </tr>
          </thead>
          <tbody>
            {shipmentHistory ? (
              shipmentHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.trackingNumber}</td>
                  <td>{entry.status}</td>
                  <td>{new Date(entry.updated_at).toLocaleString()}</td>
                  <td>{entry.deliveryAddress}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No shipment history available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ShipmentHistory
