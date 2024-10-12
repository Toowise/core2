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
    <div id="shipment-history">
      <h2>Shipment History</h2>
      {loading ? (
        <span>Loading...</span>
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
            {shipmentHistory.length > 0 ? (
              shipmentHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.trackingNumber}</td>
                  <td>{entry.status}</td>
                  <td>{new Date(entry.updated_at).toLocaleString()}</td>
                  <td>{entry.deliveryAddress}</td>
                  <td>
                    {editMode === entry.trackingNumber ? (
                      <button onClick={() => handleDelete(entry.trackingNumber)}>Delete</button>
                    ) : (
                      <button onClick={() => handleEditClick(entry.trackingNumber)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No shipment history available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ShipmentHistory
