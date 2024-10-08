import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import ShipmentInfo from './ShipmentInfo'

const TrackingForm = () => {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipmentData, setShipmentData] = useState(null)
  const [zoom, setZoom] = useState(13)

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

      setShipmentData({
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        updated_at: new Date(data.updated_at),
        expected_delivery: new Date(data.expected_delivery),
      })
    } catch (error) {
      console.error('Error fetching shipment data:', error)
      alert('An error occurred while fetching shipment data. Please try again later.')
    }
  }

  const renderMap = () => {
    if (!shipmentData || !shipmentData.latitude || !shipmentData.longitude) return null

    const { latitude, longitude } = shipmentData

    return (
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        className="border-card overflow-hidden mt-4 w-full"
        style={{ height: '300px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} />
        <MapCenterUpdater lat={latitude} lng={longitude} />
      </MapContainer>
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
        <button type="submit">Track</button>
      </form>

      {shipmentData && <ShipmentInfo data={shipmentData} />}
      {renderMap()}
    </div>
  )
}

const MapCenterUpdater = ({ lat, lng }) => {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])

  return null
}
MapCenterUpdater.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
}

export default TrackingForm
