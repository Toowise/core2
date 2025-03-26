import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './ShipmentInfo.scss'
import packageimg from './src/assets/images/package.jpg'

const ShipmentInfo = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="shipment-container">
      {/* Header */}
      <div className="header">
        <h2 className="status">{data.status}</h2>
        <div className="package-info">
          <img src={packageimg} alt="Package" className="package-img" />
          <div>
            <p className="carrier">Standard International</p>
            <p className="tracking-number">{data.trackingNumber}</p>
          </div>
        </div>
        <button className="toggle-btn" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide Details' : 'Order Details'}
        </button>
      </div>

      {/* Timeline */}
      <AnimatePresence>
        {showDetails && data.events && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="timeline-container show"
          >
            {data.events.map((event, index) => (
              <div key={index} className="timeline-item">
                {/* Status Indicator */}
                <div className="status-indicator">
                  <div className={`circle ${index === 0 ? 'active' : ''}`}></div>
                  {index !== data.events.length - 1 && <div className="line"></div>}
                </div>

                {/* Status Details */}
                <div className="status-details">
                  <p className={`status-text ${index === 0 ? 'bold-text' : ''}`}>{event.status}</p>
                  <p className="date-time">
                    {event.date} {event.time} - 📍 {data.current_location}
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

// PropTypes Validation
ShipmentInfo.propTypes = {
  data: PropTypes.shape({
    trackingNumber: PropTypes.string.isRequired,
    current_location: PropTypes.string.isRequired,
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
