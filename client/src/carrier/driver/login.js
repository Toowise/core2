import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from '/src/api/axios.js';

const socket = io("http://localhost:5052");

const DriverTracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const navigate = useNavigate();

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            if (trackingNumber) {
              socket.emit("driverLocationUpdate", {
                trackingNumber,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          },
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true, maximumAge: 0 }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    };
    getLocation();
  }, [trackingNumber]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/driver/login', { trackingNumber });
      if (response.data.success) {
        alert("Tracking started");
      } else {
        alert("Invalid tracking number");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h2>Driver Tracking</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
        />
        <button type="submit">Start Tracking</button>
      </form>
    </div>
  );
};

export default DriverTracking;
