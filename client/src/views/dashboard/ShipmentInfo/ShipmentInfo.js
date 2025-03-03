import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ShipmentInfo.scss"; 

const ShipmentInfo = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="shipment-container">
      {/* Header */}
      <div className="header">
        <h2 className="status">{data.status}</h2>
        <div className="package-info">
          <img src="\src\assets\images\package.jpg" alt="Package" className="package-img" />
          <div>
            <p className="carrier">Standard International</p>
            <p className="tracking-number">{data.trackingNumber}</p>
          </div>
        </div>
        <button className="toggle-btn" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "Hide Details" : "Order Details"}
        </button>
      </div>

      {/* Timeline */}
      {showDetails && (
        <div>
          {data.events.map((event, index) => (
            <div key={index}>
              <div>
                {/* Status Indicator */}
                <div>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: index === 0 ? "orange" : "gray",
                    }}
                  ></div>
                  {index !== data.events.length - 1 && (
                    <div
                      style={{
                        width: "2px",
                        height: "32px",
                        backgroundColor: "lightgray",
                        marginLeft: "5px",
                      }}
                    ></div>
                  )}
                </div>

                {/* Status Details */}
                <div>
                  <p
                    style={{
                      fontWeight: index === 0 ? "bold" : "normal",
                      color: index === 0 ? "orange" : "black",
                    }}
                  >
                    {event.status}
                  </p>
                  <p>{event.date} {event.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// Sample Data
const TrackingData = {
  trackingNumber: "TRK123456789",
  status: "Delivered",
  events: [
    { status: "Parcel has been delivered", date: "02 Aug", time: "17:40" },
    { status: "Parcel is out for delivery", date: "02 Aug", time: "13:13" },
    { status: "Arrived at delivery hub: North East Caloocan", date: "02 Aug", time: "06:30" },
    { status: "Departed from sorting facility", date: "01 Aug", time: "20:14" },
    { status: "Parcel received at facility: SOC 5 SPX", date: "01 Aug", time: "15:00" },
    { status: "Arrived at destination port: Manila", date: "01 Aug", time: "04:31" },
  ],
};

export default function App() {
  return <ShipmentInfo data={TrackingData} />;
}
