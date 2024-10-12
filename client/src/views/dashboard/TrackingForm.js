import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import ShipmentInfo from './ShipmentInfo'
import Modal from './Modal'
//Track Shipment
const TrackingForm = () => {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipmentData, setShipmentData] = useState(null)
  const [carrier, setCarrier] = useState('')
  const [contact, setContact] = useState('')
  const [zoom, setZoom] = useState(13)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      setCarrier(data.carrier);
      setContact(data.contact);

    } catch (error) {
      console.error('Error fetching shipment data:', error)
      alert('An error occurred while fetching shipment data. Please try again later.')
    }
  }
  //Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!shipmentData) {
      alert('No shipment data to update.');
      return;
    }

    try {
      const response = await axios.put('http://localhost:5000/shipments/update', {
        trackingNumber,
        carrier,
        contact
      });

      if (response.data) {
        setShipmentData({ ...shipmentData, carrier, contact });
        alert('Carrier and contact information updated successfully!');
        setIsEditMode(false);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log('error')
      console.error('Error updating shipment data:', error);
      alert('An error occurred while updating shipment data. Please try again later.');
    }
  }
  const toggleEditMode = () => {
  setIsEditMode(!isEditMode);
  setIsModalOpen(true);
  }
  //Create Map
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
  //Tracking Form
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
      {shipmentData && (
        <div className="edit">
          <button onClick={toggleEditMode}>
            {isEditMode ? 'Cancel' : 'Edit Carrier Info'}
          </button>
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
        </form>
      </Modal>
      
    </div>
  )
}
//Map Updater
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
