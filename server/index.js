require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require("firebase-admin");
const rateLimit = require('express-rate-limit');
const serviceAccount = require("./firebase-service-account.json");
const User = require('./models/User'); 
const Driver = require('./models/Driver');
const PORT = process.env.PORT || 5052;
// Initialize Express & Server
const app = express();
const server = http.createServer(app);
const io = socketIo (server,{
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  },
});

// Firebase Admin Initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.mongoURIProduction;
mongoose.connect(mongoURI)
  .then(() => console.log(' MongoDB connected '))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);
  
  socket.on("joinTracking", (trackingNumber) => {
    console.log(`Client joined tracking: ${trackingNumber}`);
    socket.join(trackingNumber);
  });

  socket.on("leaveTracking", (trackingNumber) => {
    console.log(`Client left tracking: ${trackingNumber}`);
    socket.leave(trackingNumber);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Mongoose Schema for Tracking Data
const trackDataSchema = new mongoose.Schema({
  trackingNumber: String,
  status: String,
  updated_at: Date,
  current_location: String,
  expected_delivery: Date,
  deliveryAddress: String,
  latitude: Number,
  longitude: Number,
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

// Helper Function to Get Geolocation
const getCoordinates = async (location) => {
  const apiKey = process.env.apiKey;
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const { lat, lng } = response.data.results[0].geometry;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error(' Error fetching geolocation:', error);
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

//Signup 
app.post("/signup", async (req, res) => {
  try {
    console.log("Incoming signup request:", req.body); 
    const { fullname, username, email, password, address } = req.body;

    if (!fullname || !username || !email || !password || !address) {
      console.error(" Validation Error: Missing fields"); 
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    let userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.error(" User already exists:", { email, username });
      return res.status(400).json({ message: "Email or Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create Firebase user
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      console.log(" User already exists in Firebase:", firebaseUser.uid);
    } catch (firebaseError) {
      if (firebaseError.code === "auth/user-not-found") {
        try {
          firebaseUser = await admin.auth().createUser({
            email,
            password,
            displayName: fullname,
          });
          console.log(" Firebase user created:", firebaseUser.uid);
        } catch (createError) {
          console.error(" Firebase Error:", createError.code, createError.message);
          return res.status(500).json({ message: "Firebase user creation failed", error: createError.message });
        }
      } else {
        console.error(" Firebase Lookup Error:", firebaseError.code, firebaseError.message);
        return res.status(500).json({ message: "Firebase lookup failed", error: firebaseError.message });
      }
    }

    // Save user in MongoDB 
    const newUser = new User({
      firebaseUid: firebaseUser.uid,
      fullname,
      username,
      email,
      password: hashedPassword,
      address,
      userRole: "user",
      emailVerified: false, 
    });

    await newUser.save();
    console.log(" User saved successfully in MongoDB!");

    // Generate Firebase token
    const firebaseToken = await admin.auth().createCustomToken(firebaseUser.uid);
    
    res.status(201).json({ 
      message: "User registered successfully. Please check your email to verify your account.", 
      token: firebaseToken 
    });

  } catch (error) {
    console.error(" Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
//Driver Login
app.post('/driverlogin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find driver by username
    const driver = await Driver.findOne({ username });
    if (!driver) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcryptjs.compare(password, driver.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      { id: driver._id, userRole: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    res.json({ success: true, token, driver: { id: driver._id, name: driver.name, email: driver.email } });
  } catch (error) {
    console.error("Driver login error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//Driver get shipments
app.get('/driver/shipments', async (req, res) => {
  try {
    // Fetch all active tracking numbers and their delivery addresses
    const activeShipments = await TrackData.find({}, { trackingNumber: 1, deliveryAddress: 1});
    console.log("Active Shipments:", activeShipments);
    res.json(activeShipments);
  } catch (error) {
    console.error("Error fetching active shipments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//Driver Tracking
io.on("connection", (socket) => {
  console.log(" Driver connected:", socket.id);

  //  Join a tracking room when a driver selects a shipment
  socket.on("joinTracking", (trackingNumber) => {
    console.log(` Client joined tracking room: ${trackingNumber}`);
    socket.join(trackingNumber);
  });

  //  Leave the tracking room when a driver deselects a shipment
  socket.on("leaveTracking", (trackingNumber) => {
    console.log(`🚪 Client left tracking room: ${trackingNumber}`);
    socket.leave(trackingNumber);
  });

  //  Handle driver location updates
  socket.on("driverLocationUpdate", async (data) => {
    console.log(" Received driver location update:", data);

    const trackingNumbers = data.trackingNumbers || data.trackingNumber;

    //  Ensure trackingNumbers is an array
    if (!trackingNumbers || !Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
      console.error(" Invalid or missing trackingNumbers:", data);
      return;
    }

    try {
      //  Update location in TrackData
      await TrackData.updateMany(
        { trackingNumber: { $in: trackingNumbers } },
        { $set: { latitude: data.latitude, longitude: data.longitude, updated_at: new Date() } }
      );

      //  Broadcast updates **only to relevant tracking rooms**
      trackingNumbers.forEach((trackingNumber) => {
        console.log(` Broadcasting location update for ${trackingNumber}`);
        io.to(trackingNumber).emit("shipmentLocationUpdate", {
          trackingNumber,
          latitude: data.latitude,
          longitude: data.longitude
        });
      });
    } catch (error) {
      console.error(" Error updating shipment location:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(" Driver disconnected:", socket.id);
  });
});

//  Email
app.post("/verify-email", async (req, res) => {
  try {
    const { email } = req.body;
    // Get user from Firebase
    const userRecord = await admin.auth().getUserByEmail(email);
    if (!userRecord) {
      console.log(" User not found in Firebase.");
      return res.status(404).json({ success: false, message: "User not found in Firebase." });
    }

    console.log(` Firebase emailVerified: ${userRecord.emailVerified}`);

    // Check if email is verified
    if (userRecord.emailVerified) {
      // Update MongoDB only if it's not already true
      const updatedUser = await User.findOneAndUpdate(
        { email }, 
        { emailVerified: true }, 
      );

      if (!updatedUser) {
        console.log(" User not found in MongoDB.");
        return res.status(404).json({ success: false, message: "User not found in database." });
      }

      console.log(` MongoDB emailVerified updated for: ${updatedUser.email}`);
      return res.status(200).json({ 
        success: true, 
        message: " Email verified successfully!", 
        user: { email: updatedUser.email, emailVerified: updatedUser.emailVerified } 
      });
    } else {
      console.log(" Email not verified in Firebase yet.");
      return res.status(400).json({ success: false, message: " Email not verified yet. Please check your inbox." });
    }
  } catch (error) {
    console.error(" Email verification check error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});
// Limit resend email requests
const resendEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests max per window
  message: 'Too many requests. Please try again later.',
});

// Resend Verification Email Route
app.post('/resend-verification', resendEmailLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const userRecord = await admin.auth().getUserByEmail(email);

    if (!userRecord) {
      return res.status(404).json({ message: "User not found." });
    }

    if (userRecord.emailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }
    // Generate verification email link
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);
    
    console.log(`Email verification link: ${verificationLink}`);

    res.status(200).json({ message: 'Verification email resent successfully!' });
  } catch (error) {
    console.error('Resend Email Error:', error);
    res.status(500).json({ message: 'Failed to resend email. Try again later.' });
  }
});

// Delete 
app.delete('/track/:trackingNumber', async (req, res) => {
  const { trackingNumber } = req.params;
  try {
    const deletedShipment = await TrackData.findOneAndDelete({ trackingNumber });

    if (!deletedShipment) {
      return res.status(404).json({ status: 'error', message: 'Shipment not found' });
    }
    res.json({ status: 'success', message: 'Shipment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Error deleting shipment' });
  }
});

// Track Shipment
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
        events: shipment.events,
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

// Start Server
server.listen(PORT, () => {
  console.log(` Server running on PORT: ${PORT}`);
});
