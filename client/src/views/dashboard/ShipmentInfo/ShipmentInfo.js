import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './ShipmentInfo.scss'
import packageimg from './../../../assets/brand/package.jpg'

const ShipmentInfo = ({ data }) => {
  const [shipmentData, setShipmentData] = useState(data)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const socket = new WebSocket('wss://backend-core2.axleshift.com/ws')

    socket.addEventListener('open', () => {
      // Join tracking when socket opens
      socket.send(
        JSON.stringify({
          type: 'joinTracking',
          trackingNumber: data.trackingNumber,
        }),
      )
    })

    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'shipmentLocationUpdate') {
          const update = message.data
          setShipmentData((prev) => ({
            ...prev,
            ...update,
          }))
        }

        if (message.type === 'statusChanged') {
          const { newStatus } = message.data
          setShipmentData((prev) => ({
            ...prev,
            status: newStatus,
            events: [
              ...prev.events,
              {
                status: newStatus,
                date: new Date().toISOString(),
                time: new Date().toLocaleTimeString(),
                location: `${prev.latitude}, ${prev.longitude}`,
              },
            ],
          }))
        }
      } catch (error) {
        console.error('WebSocket message handling error:', error)
      }
    })

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'leaveTracking',
            trackingNumber: data.trackingNumber,
          }),
        )
      }
      socket.close()
    }
  }, [data.trackingNumber])
  return (
    <div className="shipment-container">
      <div className="header">
        <h2 className="status">{shipmentData.status}</h2>
        <div className="package-info">
          <img src={packageimg} alt="Package" className="package-img" />
          <div>
            <p className="carrier">Standard International</p>
            <p className="tracking-number">{shipmentData.trackingNumber}</p>
          </div>
        </div>
        <button className="toggle-btn" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide Details' : 'Order Details'}
        </button>
      </div>

      <AnimatePresence>
        {showDetails && shipmentData.events && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="timeline-container show"
          >
            {shipmentData.events.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="status-indicator">
                  <div className={`circle ${index === 0 ? 'active' : ''}`}></div>
                  {index !== shipmentData.events.length - 1 && <div className="line"></div>}
                </div>

                <div className="status-details">
                  <p className={`status-text ${index === 0 ? 'bold-text' : ''}`}>{event.status}</p>
                  <p className="date-time">
                    {new Date(event.date).toLocaleString()} - 📍 {event.location}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

ShipmentInfo.propTypes = {
  data: PropTypes.shape({
    trackingNumber: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    events: PropTypes.arrayOf(
      PropTypes.shape({
        status: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
}

export default ShipmentInfo
