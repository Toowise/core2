import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from '/src/api/axios.js'
import io from 'socket.io-client'
import 'leaflet/dist/leaflet.css'
import ShipmentInfo from '../ShipmentInfo/ShipmentInfo.js'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { VITE_APP_GOOGLE_MAP, VITE_SOCKET_URL } from '../../../config.js'

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
  const [zoom] = useState(13)
  const [mapInstance, setMapInstance] = useState(null)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(VITE_SOCKET_URL, { autoConnect: false })
    setSocket(newSocket)
    return () => {
      newSocket.disconnect() // Cleanup on unmount
    }
  }, [])

  // Connect WebSocket for Live Tracking
  useEffect(() => {
    if (!trackingNumber || !socket) return

    socket.connect()
    socket.emit('joinTracking', trackingNumber)

    socket.on('locationUpdate', (updatedShipment) => {
      console.log('Live location update received:', updatedShipment)
      setShipmentData((prevData) => ({
        ...prevData,
        latitude: updatedShipment.latitude,
        longitude: updatedShipment.longitude,
        updated_at: new Date(updatedShipment.updated_at),
      }))
    })

    return () => {
      socket.emit('leaveTracking', trackingNumber)
      socket.off('locationUpdate')
    }
  }, [trackingNumber, socket])

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
    } catch (error) {
      console.error('Error fetching shipment data:', error)
      alert('An error occurred while fetching shipment data. Please try again later.')
    }
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
      <h2>Axleshift Package Tracking</h2>
      <div className="subheader">Input your tracking number</div>
      <form onSubmit={handleSubmit} className="center-elements">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder=" Enter tracking number "
        />
        <div className="track-btn">
          <button type="submit">Track</button>
        </div>
      </form>

      {shipmentData && <ShipmentInfo data={shipmentData} />}
      {renderMap()}
    </div>
  )
}

export default TrackingForm
