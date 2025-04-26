import React, { useState, useEffect, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, LoadScript} from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from '../../api/axios'
import { VITE_APP_GOOGLE_MAP, VITE_SOCKET_URL } from '../../config'
import './drivertracking.css'

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
  const markerRef = useRef(null)
  const socketRef = useRef(null)
  const navigate = useNavigate()

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: VITE_APP_GOOGLE_MAP,
    libraries: ['places']
  })

  // Load available shipments
  useEffect(() => {
    axios
      .get('/driver/shipments')
      .then((response) => {
        setShipments(Array.isArray(response.data) ? response.data : [])
      })
      .catch((error) => {
        console.error('Error fetching shipments:', error)
      })
  }, [])

  // Initialize WebSocket
  useEffect(() => {
    socketRef.current = new WebSocket(VITE_SOCKET_URL)

    socketRef.current.onopen = () => {
      console.log('WebSocket connected (DriverTracking)')
    }

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === 'shipmentLocationUpdate') {
        console.log('Shipment location updated:', message.data)
      }
    }

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      socketRef.current?.close()
    }
  }, [])

  // Track driver's real-time location
  useEffect(() => {
    if (selectedShipments.length > 0) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })

          selectedShipments.forEach((trackingNumber) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(
                JSON.stringify({
                  type: 'driverLocationUpdate',
                  trackingNumber,
                  latitude,
                  longitude,
                })
              )
            }
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Location tracking is disabled. Please enable GPS.')
        },
        { enableHighAccuracy: true, maximumAge: 2000 }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [selectedShipments])

  // Get initial GPS location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log('Initial GPS Location:', latitude, longitude)
        setLocation({ latitude, longitude })
      },
      (error) => {
        console.error('Error getting initial location:', error)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  // Animate marker smoothly
  useEffect(() => {
    if (location && markerRef.current) {
      const marker = markerRef.current
      const start = marker.getPosition()
      const end = new window.google.maps.LatLng(location.latitude, location.longitude)

      const steps = 60
      let i = 0
      const deltaLat = (end.lat() - start.lat()) / steps
      const deltaLng = (end.lng() - start.lng()) / steps

      const move = () => {
        i++
        const lat = start.lat() + deltaLat * i
        const lng = start.lng() + deltaLng * i
        marker.setPosition(new window.google.maps.LatLng(lat, lng))
        if (i < steps) requestAnimationFrame(move)
      }

      move()
    }
  }, [location])

  const handleLogout = () => {
    sessionStorage.removeItem('driverToken')
    window.dispatchEvent(new Event('storage'))
    navigate('/driverlogin')
  }

  const handleShipmentSelect = (trackingNumber) => {
    setSelectedShipments((prev) => {
      const updatedList = prev.includes(trackingNumber)
        ? prev.filter((num) => num !== trackingNumber)
        : [...prev, trackingNumber]

      if (!prev.includes(trackingNumber)) {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              type: 'joinTracking',
              trackingNumber,
            })
          )
        }
        onShipmentSelect(trackingNumber)
      } else {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              type: 'leaveTracking',
              trackingNumber,
            })
          )
        }
      }

      return updatedList
    })
  }

  const assignShipmentToDriver = async (trackingNumber, driverUsername) => {
    try {
      await axios.post('/driver/select-shipment', {
        trackingNumber,
        driverUsername,
      })
    } catch (error) {
      console.error('Failed to assign shipment:', error)
    }
  }

  const onShipmentSelect = (trackingNumber) => {
    const driverUsername = sessionStorage.getItem('driverUsername')
    console.log('Assigning shipment to driver:', driverUsername)
    assignShipmentToDriver(trackingNumber, driverUsername)
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

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {isLoaded && location && (
        <GoogleMap 
        mapContainerClassName="map-container"
        center={{ lat: location.latitude, lng: location.longitude }} 
        zoom={15}
        >
          <Marker 
          position={{ lat: location.latitude, lng: location.longitude }}
          onLoad={(marker) => (markerRef.current = marker)} 
          icon={
            window.google?.maps
              ? {
                  url: 'https://cdn-icons-png.flaticon.com/512/744/744465.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }
              : undefined
          }
        />
          {mapInstance && 
          <MapCenterUpdater 
          lat={location.latitude} 
          lng={location.longitude} 
          map={mapInstance} 
          />
          }
        </GoogleMap>
      )}
    </div>
  )
}

export default DriverTracking
