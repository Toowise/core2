import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import axios from '../../../api/axios.js'
import 'leaflet/dist/leaflet.css'
import ShipmentInfo from '../ShipmentInfo/ShipmentInfo.js'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { VITE_APP_GOOGLE_MAP, VITE_SOCKET_URL } from '../../../config.js'

const GOOGLE_MAPS_LIBRARIES = ['places']

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
  const markerRef = useRef(null)
  const [directions, setDirections] = useState(null)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: VITE_APP_GOOGLE_MAP,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  useEffect(() => {
    const ws = new WebSocket(VITE_SOCKET_URL)
    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return

    const joinTracking = () => {
      const joinMessage = JSON.stringify({
        action: 'joinTracking',
        trackingNumber,
      })
      socket.send(joinMessage)
    }

    socket.addEventListener('open', joinTracking)

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)

      if (message.type === 'shipmentLocationUpdate') {
        const updatedShipment = message.data
        setShipmentData((prevData) => ({
          ...prevData,
          latitude: updatedShipment.latitude,
          longitude: updatedShipment.longitude,
          updated_at: new Date(updatedShipment.updated_at),
        }))
      }
    })

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        const leaveMessage = JSON.stringify({
          action: 'leaveTracking',
          trackingNumber,
        })
        socket.send(leaveMessage)
      }
      socket.removeEventListener('open', joinTracking)
      socket.removeEventListener('message', () => {})
    }
  }, [trackingNumber, socket])

  useEffect(() => {
    const getDirections = async () => {
      if (
        shipmentData?.latitude &&
        shipmentData?.longitude &&
        shipmentData?.destination_latitude &&
        shipmentData?.destination_longitude &&
        isLoaded &&
        window.google?.maps
      ) {
        const directionsService = new window.google.maps.DirectionsService()
        const origin = {
          lat: shipmentData.latitude,
          lng: shipmentData.longitude,
        }
        const destination = {
          lat: shipmentData.destination_latitude,
          lng: shipmentData.destination_longitude,
        }

        directionsService.route(
          {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result)
            } else {
              console.error('Directions request failed due to', status)
            }
          },
        )
      }
    }

    getDirections()
  }, [
    shipmentData?.latitude,
    shipmentData?.longitude,
    shipmentData?.destination_latitude,
    shipmentData?.destination_longitude,
    isLoaded,
  ])

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
      if ((!data.destination_latitude || !data.destination_longitude) && data.deliveryAddress) {
        const coords = await getCoordinates(data.deliveryAddress)
        if (coords) {
          data.destination_latitude = coords.latitude
          data.destination_longitude = coords.longitude
        }
      }

      setShipmentData({
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        destination_latitude: Number(data.destination_latitude),
        destination_longitude: Number(data.destination_longitude),
        updated_at: new Date(data.updated_at),
        expected_delivery: new Date(data.expected_delivery),
      })
    } catch (error) {
      console.error('Error fetching shipment data:', error)
      alert('An error occurred while fetching shipment data. Please try again later.')
    }
  }

  const animateMarker = (toLat, toLng) => {
    if (!markerRef.current || !window.google) return
    const marker = markerRef.current
    const start = marker.getPosition?.()
    if (!start) return

    const end = new window.google.maps.LatLng(toLat, toLng)
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

  useEffect(() => {
    if (isLoaded && shipmentData && markerRef.current) {
      animateMarker(shipmentData.latitude, shipmentData.longitude)
    }
  }, [shipmentData?.latitude, shipmentData?.longitude, isLoaded])

  const renderMap = () => {
    if (!shipmentData || !shipmentData.latitude || !shipmentData.longitude) return null

    const { latitude, longitude, destination_latitude, destination_longitude } = shipmentData

    return (
      <GoogleMap
        mapContainerStyle={{ height: '300px', width: '100%' }}
        center={{ lat: latitude, lng: longitude }}
        zoom={zoom}
        onLoad={(map) => setMapInstance(map)}
      >
        <Marker
          position={{ lat: latitude, lng: longitude }}
          onLoad={(marker) => (markerRef.current = marker)}
          icon={
            isLoaded && window.google
              ? {
                  url: 'https://cdn-icons-png.flaticon.com/512/744/744465.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }
              : undefined
          }
        />
        {destination_latitude && destination_longitude && (
          <Marker
            position={{ lat: destination_latitude, lng: destination_longitude }}
            icon={
              isLoaded && window.google
                ? {
                    url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                  }
                : undefined
            }
          />
        )}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5,
              },
            }}
          />
        )}
        {mapInstance && <MapCenterUpdater lat={latitude} lng={longitude} map={mapInstance} />}
      </GoogleMap>
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

      {isLoaded ? renderMap() : <div>Loading map...</div>}
    </div>
  )
}

export default TrackingForm
