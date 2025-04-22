const mongoose = require('mongoose');

const trackDataSchema = new mongoose.Schema({
  trackingNumber: String,
  status: { type: String,
  enum: ['Pending for Pickup', 'Package Received', 'Out for Delivery', 'Delivered'],
  default: 'Pending for Pickup'
},
  updated_at: Date,
  current_location: String,
  expected_delivery: Date,
  deliveryAddress: String,
  driverUsername: { type: String },
  latitude: Number,
  longitude: Number,
  destination_latitude: Number,      
  destination_longitude: Number, 
  events: [
    {
      status: { type: String, required: true },
      date: { type: String, required: true },
      time: { type: String, required: true },
      location: { type: String, required: true },
    },
  ],
});
const TrackData = mongoose.model('Trackdata', trackDataSchema);
module.exports = TrackData;