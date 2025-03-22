import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { VITE_APP_GOOGLE_MAP } from '/src/config.js';

const socket = io("http://localhost:5052");

const DriverTracking = () => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [location, setLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    axios.get('/driver/shipments')
      .then(response => setShipments(response.data))
      .catch(error => console.error("Error fetching shipments:", error));
  }, []);

  useEffect(() => {
    if (selectedShipments.length > 0) {
      const watchId = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          selectedShipments.forEach(trackingNumber => {
            socket.emit("driverLocationUpdate", {
              trackingNumber,
              latitude,
              longitude
            });
          });
        },
        error => {
          console.error("Geolocation error:", error);
          alert("Location tracking is disabled. Please enable GPS.");
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [selectedShipments]);

  useEffect(() => {
    if (mapInstance && location) {
      mapInstance.panTo({ lat: location.latitude, lng: location.longitude });
    }
  }, [location, mapInstance]);

  const handleShipmentSelect = (trackingNumber) => {
    setSelectedShipments(prev => {
      const updatedList = prev.includes(trackingNumber)
        ? prev.filter(num => num !== trackingNumber)
        : [...prev, trackingNumber];

      if (location && !prev.includes(trackingNumber)) {
        socket.emit("driverLocationUpdate", {
          trackingNumber,
          latitude: location.latitude,
          longitude: location.longitude
        });
      }

      return updatedList;
    });
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
          <GoogleMap
            mapContainerStyle={{ height: '300px', width: '100%' }}
            center={location}
            zoom={13}
            onLoad={map => setMapInstance(map)}
          >
            <Marker position={location} />
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
};

export default DriverTracking;
