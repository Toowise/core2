const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); 
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/shiptrack';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const trackDataSchema = new mongoose.Schema({
  trackingNumber: String,
  status: String,
  updated_at: Date,
  current_location: String,
  expected_delivery: Date,
  deliveryAddress: String,
  latitude: {
    type: Number,
    required: false, 
  },
  longitude: {
    type: Number,
    required: false, 
  }
});

const TrackData = mongoose.model('Trackdata', trackDataSchema);


const getCoordinates = async (location) => {
  const apiKey = '16640e6ac8e44d81b7860668ca6faf24'; 
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const { lat, lng } = response.data.results[0].geometry; 
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return null;
  }
};

app.post('/track', async (req, res) => {
  const { trackingNumber } = req.body;

  try {
    const shipment = await TrackData.findOne({ trackingNumber });

    if (shipment) {
      if (!shipment.latitude || !shipment.longitude) {
        console.log('Fetching coordinates for:', shipment.current_location);
        const coordinates = await getCoordinates(shipment.current_location);
        
        if (coordinates) {
          shipment.latitude = coordinates.latitude;
          shipment.longitude = coordinates.longitude;
          await shipment.save(); 
        } else {
          return res.status(500).json({ status: 'error', message: 'Unable to fetch geolocation.' });
        }
      }

      return res.json({
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        current_location: shipment.current_location,
        expected_delivery: shipment.expected_delivery,
        updated_at: shipment.updated_at,
        latitude: Number(shipment.latitude),
        longitude: Number(shipment.longitude),
      });
    } else {
      return res.status(404).json({ status: 'error', message: 'Invalid Tracking Number' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'An error occurred while fetching shipment data.' });
  }
});

app.get('/history', async (req, res) => {
  try {
    const shippedData = await TrackData.find();
    if (shippedData.length > 0) {
      res.json({ status: 'success', data: shippedData });
    } else {
      res.status(404).json({ status: 'error', message: 'No shipped data found' });
    }
  } catch (err) {
    console.error('Error fetching shipment data:', err);
    res.status(500).json({ status: 'error', message: 'An error occurred while fetching shipment data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
