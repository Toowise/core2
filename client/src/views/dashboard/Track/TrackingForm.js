import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import axios from '/src/api/axios.js'
import 'leaflet/dist/leaflet.css'
import ShipmentInfo from '../ShipmentInfo/ShipmentInfo.js'
import Modal from '../Modal.js'
import { useStateContext } from '../../../context/contextProvider.js'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { VITE_APP_GOOGLE_MAP } from '../../../config.js'

const MapCenterUpdater = ({ lat, lng, map }) => {
  useEffect(() => {
    if (map && lat && lng) {
      map.panTo({ lat, lng })
    }
  }, [lat, lng, map])

  return null
}

MapCenterUpdater.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  map: PropTypes.object,
}

const TrackingForm = () => {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipmentData, setShipmentData] = useState(null)
  const [carrier, setCarrier] = useState('')
  const [contact, setContact] = useState('')
  const [zoom] = useState(13)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const { user } = useStateContext()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!trackingNumber) {
      alert('Please enter a tracking number.')
      return
    }

    try {
      const response = await axios.post('/track', { trackingNumber })
      const data = response.data

      if (data.status === 'error') {
        alert(data.message)
        return
      }

      setShipmentData({
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        updated_at: new Date(data.updated_at),
        expected_delivery: new Date(data.expected_delivery),
      })
      setCarrier(data.carrier)
      setContact(data.contact)
    } catch (error) {
      console.error('Error fetching shipment data:', error)
      alert('An error occurred while fetching shipment data. Please try again later.')
    }
  }
  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!shipmentData) {
      alert('No shipment data to update.')
      return
    }

    try {
      const response = await axios.put('/shipments/update', {
        trackingNumber,
        carrier,
        contact,
      })

      if (response.data) {
        setShipmentData({ ...shipmentData, carrier, contact })
        alert('Carrier and contact information updated successfully!')
        setIsEditMode(false)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error('Error updating shipment data:', error)
      alert('An error occurred while updating shipment data. Please try again later.')
    }
  }

  const handleCancel = () => {
    setIsEditMode(false)
    setIsModalOpen(false)
    setCarrier(shipmentData?.carrier || '')
    setContact(shipmentData?.contact || '')
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    setIsModalOpen(true)
  }

  const renderMap = () => {
    if (!shipmentData || !shipmentData.latitude || !shipmentData.longitude) return null

    const { latitude, longitude } = shipmentData

    return (
      <LoadScript googleMapsApiKey={VITE_APP_GOOGLE_MAP}>
        <GoogleMap
          mapContainerStyle={{ height: '300px', width: '100%' }}
          center={{ lat: latitude, lng: longitude }}
          zoom={zoom}
          onLoad={(map) => setMapInstance(map)}
        >
          <Marker position={{ lat: latitude, lng: longitude }} />
          {mapInstance && <MapCenterUpdater lat={latitude} lng={longitude} map={mapInstance} />}
        </GoogleMap>
      </LoadScript>
    )
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
        <div className="track-btn">
          <button type="submit">Track</button>
        </div>
      </form>
      {shipmentData && user?.userRole === 'admin' && (
        <div className="edit">
          <button onClick={toggleEditMode}>{isEditMode ? 'Cancel' : 'Edit Carrier Info'}</button>
        </div>
      )}
      {shipmentData && <ShipmentInfo data={shipmentData} />}

      {renderMap()}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleUpdate} className="edit-form">
          <h3>Update Carrier Info</h3>
          <div>
            <label>Carrier:</label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="Update Carrier"
            />
          </div>
          <div>
            <label>Contact Number:</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Update Contact Number"
            />
          </div>
          <button type="submit">Update Carrier Info</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default TrackingForm
