import React, { useState } from 'react';

const TrackingForm = () => {
    const [trackingNumber, setTrackingNumber] = useState(''); 
    const [shipmentData, setShipmentData] = useState(null);   
  
   
    const handleSubmit = (e) => {
      e.preventDefault();
  
      if (!trackingNumber) {
        alert('Please enter a tracking number.');
        return;
      }
  
      const formData = new FormData();
      formData.append('trackingNumber', trackingNumber);
  
      fetch('track.php', { 
        method: 'POST', 
        body: formData 
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'error') {
            alert(data.message);
            return;
          }
          setShipmentData(data); 
        })
        .catch(error => {
          console.error('Error fetching shipment data:', error);
          alert('An error occurred while fetching shipment data. Please try again later.');
        });
    };
    return (
        <div>
          <form id="tracking-form" onSubmit={handleSubmit} className="center-elements">
            <input 
              type="text" 
              value={trackingNumber} 
              onChange={(e) => setTrackingNumber(e.target.value)} 
              placeholder="Enter tracking number"
            />
            <button type="submit">Track</button>
          </form>
    
          
          {shipmentData && shipmentData.data && (
            <div>
              <h3>Shipment Details</h3>
              <p>Status: {shipmentData.data.status}</p>
              <p>Last Updated: {new Date(shipmentData.data.updated_at).toLocaleString()}</p>
              <p>Current Location: {shipmentData.data.current_location}</p>
              <p>Expected Delivery: {new Date(shipmentData.data.expected_delivery).toLocaleDateString()}</p>
    
              
              {shipmentData.data.current_latitude && shipmentData.data.current_longitude && (
                <Map
                  current_latitude={shipmentData.data.current_latitude}
                  current_longitude={shipmentData.data.current_longitude}
                />
              )}
    
             
              <h4>Shipment History</h4>
              <table border="1">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Updated At</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentData.history.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.status}</td>
                      <td>{new Date(entry.updated_at).toLocaleString()}</td>
                      <td>{entry.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    };

    export default TrackingForm;