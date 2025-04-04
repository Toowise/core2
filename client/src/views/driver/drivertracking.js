import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'src/api/axios.js'
import io from 'socket.io-client'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { VITE_APP_GOOGLE_MAP, VITE_SOCKET_URL } from '../../config.js'
import './drivertracking.css' 

const socket = io(VITE_SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
})

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

const DriverTracking = () => {
  const [shipments, setShipments] = useState([])
  const [selectedShipments, setSelectedShipments] = useState([])
  const [location, setLocation] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)

  useEffect(() => {
    axios
      .get('/driver/shipments')
      .then((response) => {
        setShipments(Array.isArray(response.data) ? response.data : [])
      })
      .catch((error) => console.error('Error fetching shipments:', error))
  }, [])

  useEffect(() => {
    if (selectedShipments.length > 0) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })

          selectedShipments.forEach((trackingNumber) => {
            socket.emit('driverLocationUpdate', {
              trackingNumber: [trackingNumber],
              latitude,
              longitude,
            })
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Location tracking is disabled. Please enable GPS.')
        },
        { enableHighAccuracy: true, maximumAge: 5000 },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [selectedShipments])

  useEffect(() => {
    if (mapInstance && location) {
      mapInstance.panTo({ lat: location.latitude, lng: location.longitude })
    }
  }, [location, mapInstance])

  const handleShipmentSelect = (trackingNumber) => {
    setSelectedShipments((prev) => {
      const updatedList = prev.includes(trackingNumber)
        ? prev.filter((num) => num !== trackingNumber)
        : [...prev, trackingNumber]

      if (!prev.includes(trackingNumber)) {
        socket.emit('joinTracking', trackingNumber)
      } else {
        socket.emit('leaveTracking', trackingNumber)
      }

      return updatedList
    })
  }

  return (
    <div className="driver-tracking-container">
      <h2>Driver Tracking</h2>
      <h3>Select Shipments to Track:</h3>
      {shipments.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Tracking Number</th>
              <th>Delivery Address</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.trackingNumber}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedShipments.includes(shipment.trackingNumber)}
                    onChange={() => handleShipmentSelect(shipment.trackingNumber)}
                  />
                </td>
                <td>{shipment.trackingNumber}</td>
                <td>{shipment.deliveryAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading shipments or no shipments available.</p>
      )}

      {location && (
        <LoadScript googleMapsApiKey={VITE_APP_GOOGLE_MAP}>
          <GoogleMap
            mapContainerClassName="map-container"
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={15}
            onLoad={(map) => setMapInstance(map)}
          >
            <Marker position={{ lat: location.latitude, lng: location.longitude }} />
            {mapInstance && (
              <MapCenterUpdater
                lat={location.latitude}
                lng={location.longitude}
                map={mapInstance}
              />
            )}
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  )
}

export default DriverTracking
