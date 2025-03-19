import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { VITE_APP_GOOGLE_MAP } from '../../../config.js';

const socket = io("http://localhost:5052");

const DriverTracking = () => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [location, setLocation] = useState(null);
  
  useEffect(() => {
    // Fetch shipments assigned to the logged-in driver
    axios.get('/driver/shipments')
      .then(response => setShipments(response.data))
      .catch(error => console.error("Error fetching shipments:", error));
  }, []);

  useEffect(() => {
    if (selectedShipments.length > 0) {
      const watchId = navigator.geolocation.watchPosition(position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        // Emit location update for all selected shipments
        socket.emit("driverLocationUpdate", {
          trackingNumbers: selectedShipments,
          latitude,
          longitude
        });
      });

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [selectedShipments]);

  const handleShipmentSelect = (trackingNumber) => {
    setSelectedShipments(prev => 
      prev.includes(trackingNumber) ? prev.filter(num => num !== trackingNumber) : [...prev, trackingNumber]
    );
  };

  return (
    <div>
      <h2>Driver Tracking</h2>
      <h3>Select Shipments to Track:</h3>
      <ul>
        {shipments.map(shipment => (
          <li key={shipment.trackingNumber}>
            <input 
              type="checkbox" 
              checked={selectedShipments.includes(shipment.trackingNumber)} 
              onChange={() => handleShipmentSelect(shipment.trackingNumber)}
            />
            {shipment.trackingNumber} - {shipment.current_location}
          </li>
        ))}
      </ul>

      {location && (
        <LoadScript googleMapsApiKey={VITE_APP_GOOGLE_MAP}>
          <GoogleMap mapContainerStyle={{ height: '300px', width: '100%' }} center={location} zoom={13}>
            <Marker position={location} />
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
};

export default DriverTracking;
