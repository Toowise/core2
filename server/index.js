require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); 
const app = express();  
const User = require('./models/User');
const PORT = process.env.PORT || 5000;
const Admin = require('./middleware/Admin');
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
app.use(cors());
app.use(express.json());

const mongoURI = process.env.mongoURIProduction;

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
  carrier: String,
  contact: String,
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
  const apiKey = process.env.apiKey 
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
//Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

   
    const token = jwt.sign(
      { username: user.username, userRole: user.userRole },
      process.env.JWT_SECRET,  
      { expiresIn: '1h' }  
    );

    console.log(user);
    res.json({ 
      token, 
      user: { 
        username: user.username, 
        userRole: user.userRole  
      } 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


//Create User
app.post('/createUser', Admin, async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,  
      role,  
    });

    await newUser.save();
    
    res.json({ message: 'User created successfully', newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.delete('/track/:trackingNumber', async (req, res) => {
  const { trackingNumber } = req.params;
  try {
      const deletedShipment = await TrackData.findOneAndDelete(trackingNumber);
      
      if (!deletedShipment) {
          return res.status(404).json({ status: 'error', message: 'Shipment not found' });
      }
      res.json({ status: 'success', message: 'Shipment deleted successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: 'Error deleting shipment' });
  }
});

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
        carrier: shipment.carrier,
        contact: shipment.contact,
      });
    } else {
      return res.status(404).json({ status: 'error', message: 'Invalid Tracking Number' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'An error occurred while fetching shipment data.' });
  }
});
app.put('/shipments/update', async (req, res) => {
  const { trackingNumber, carrier, contact } = req.body;

  try {
    const shipment = await TrackData.findOne({ trackingNumber: trackingNumber });
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    shipment.carrier = carrier;
    shipment.contact = contact;

    const updatedShipment = await shipment.save()
    res.json(updatedShipment);
  } catch (err) {
    res.status(500).json({ message:'Update Failed'})
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
  console.log(`Server is running on PORT: ${PORT}`);
});
