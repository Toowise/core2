import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import './ShipmentInfo.scss'
import packageimg from './../../../assets/brand/package.jpg'

const ShipmentInfo = ({ data }) => {
  const [shipmentData, setShipmentData] = useState(data) // ✅ No conflict now
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const socket = io('https://core2.axleshift.com/')

    socket.emit('joinRoom', data.trackingNumber)

    socket.on('shipmentLocationUpdate', (update) => {
      setShipmentData((prev) => ({ ...prev, ...update }))
    })

    socket.on('statusChanged', ({ newStatus }) => {
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
    })

    return () => socket.disconnect()
  }, [data.trackingNumber]) // ✅ Using the original prop safely

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
