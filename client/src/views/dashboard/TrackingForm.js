import React, { useState } from 'react';
import Map from './Map';

const TrackingForm = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shipmentData, setShipmentData] = useState(null);
    const [shipmentHistory, setShipmentHistory] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!trackingNumber) {
            alert('Please enter a tracking number.');
            return;
        }

        
        fetch('http://localhost:3000/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trackingNumber }) 
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                alert(data.message);
                return;
            }
            setShipmentData(data);
            
            return fetch(`http://localhost:3000/shipment-history/${trackingNumber}`);
        })
        .then(response => {
            if (response) return response.json();
            return null;
        })
        .then(historyData => {
            if (historyData && historyData.status === 'success') {
                setShipmentHistory(historyData.data);
            } else {
                setShipmentHistory([]); 
            }
        })
        .catch(error => {
            console.error('Error fetching shipment data:', error);
            alert('An error occurred while fetching shipment data. Please try again later.');
        });
    };

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

            {shipmentData && shipmentData.data && (
                <div>
                    <h3>Shipment Details</h3>
                    <p>Status: {shipmentData.data.status}</p>
                    <p>Last Updated: {new Date(shipmentData.data.updated_at).toLocaleString()}</p>
                    <p>Current Location: {shipmentData.data.current_location}</p>
                    <p>Expected Delivery: {new Date(shipmentData.data.expected_delivery).toLocaleDateString()}</p>

                    
                </div>
            )}

            {shipmentHistory.length > 0 && (
                <div>
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
                            {shipmentHistory.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.status}</td>
                                    <td>{new Date(entry.updated_at).toLocaleString()}</td>
                                    <td>{entry.current_location}</td>
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
