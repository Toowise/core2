require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const path = require('path');
const { updateShipmentStatus } = require('./utils/statusUpdate');
const admin = require("firebase-admin");
const rateLimit = require('express-rate-limit');
const serviceAccount = require("./firebase-service-account.json");
const shipmentsRoutes = require('./routes/shipments');
const driversRoutes = require('./routes/drivers');
const User = require('./models/User'); 
const Driver = require('./models/Driver');
const TrackData = require('./models/TrackData');
const PORT = process.env.PORT || 5052;
const WebSocket = require('ws');
const clients = new Map();
let dbReady = false;
// Initialize Express & Server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });
// Firebase Admin Initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
app.use(cors({
  origin: ['https://core2.axleshift.com','http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

app.use('/api/shipments', shipmentsRoutes);
app.use('/api/drivers', driversRoutes);
// MongoDB Connection
const mongoURI = process.env.mongoURIProduction;
mongoose.connect(mongoURI)
  .then(() => {
    dbReady = true; 
    console.log('MongoDB connected');

    server.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    dbReady = false; 
  });

//Websocket Connection
wss.on('connection', (socket) => {
  console.log('New WebSocket client connected.');

  clients.set(socket, { trackingNumbers: [] });

  socket.on('message', async (message) => {
    try {
      const parsed = JSON.parse(message);

      if (parsed.type === 'joinTracking') {
        const { trackingNumber } = parsed;
        if (trackingNumber) {
          const clientData = clients.get(socket);
          clientData.trackingNumbers.push(trackingNumber);
          console.log(`Client joined tracking: ${trackingNumber}`);
        }
      }

      if (parsed.type === 'leaveTracking') {
        const { trackingNumber } = parsed;
        if (trackingNumber) {
          const clientData = clients.get(socket);
          clientData.trackingNumbers = clientData.trackingNumbers.filter(tn => tn !== trackingNumber);
          console.log(`Client left tracking: ${trackingNumber}`);
        }
      }

      if (parsed.type === 'driverLocationUpdate') {
        const { trackingNumber, latitude, longitude, driverUsername } = parsed;
        const trackingNumbers = Array.isArray(trackingNumber) ? trackingNumber : [trackingNumber];

        const updatedAt = new Date();

        await TrackData.updateMany(
          { trackingNumber: { $in: trackingNumbers } },
          {
            $set: {
              latitude,
              longitude,
              updated_at: updatedAt,
              driverUsername,
            },
          }
        );

        broadcastToTracking(trackingNumbers, {
          type: 'shipmentLocationUpdate',
          data: { trackingNumbers, latitude, longitude, updated_at: updatedAt },
        });
      }

      if (parsed.type === 'locationUpdate') {
        const { trackingNumber, latitude, longitude } = parsed;

        if (!trackingNumber || !latitude || !longitude) return;

        const shipment = await TrackData.findOne({ trackingNumber });
        if (!shipment) return;

        const locationName = await getAddressFromCoordinates(latitude, longitude) || 
        `${latitude}, ${longitude}`;

        shipment.latitude = latitude;
        shipment.longitude = longitude;

        const newStatus = updateShipmentStatus(shipment, { lat: latitude, lon: longitude });

        if (newStatus !== shipment.status) {
          shipment.status = newStatus;
          shipment.events.push({
            status: newStatus,
            date: new Date().toISOString(),
            location: locationName,
            coordinates: { latitude, longitude },
          });

          await shipment.save();

          broadcastToTracking([trackingNumber], {
            type: 'statusChanged',
            data: { trackingNumber, newStatus },
          });
        } else {
          await shipment.save();
        }

        broadcastToTracking([trackingNumber], {
          type: 'shipmentLocationUpdate',
          data: { trackingNumber, latitude, longitude, status: shipment.status },
        });
      }

    } catch (error) {
      console.error('Error parsing WebSocket message:', error.message);
    }
  });

  socket.on('close', () => {
    console.log('WebSocket client disconnected.');
    clients.delete(socket);
  });
});

// Helper: broadcast to clients watching specific tracking numbers
function broadcastToTracking(trackingNumbers, message) {
  clients.forEach(({ trackingNumbers: clientTrackingNumbers }, clientSocket) => {
    if (trackingNumbers.some(tn => clientTrackingNumbers.includes(tn))) {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify(message));
      }
    }
  });
}


// Helper Function to Get Geolocation
const getCoordinates = async (address) => {
  if (!address) {
    console.error('Location is undefined or empty');
    return null;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY; 
  if (!apiKey) {
    console.error('Google Maps API key is missing from environment variables');
    return null;
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const results = response.data.results;

    if (!results || results.length === 0) {
      console.warn(`No results found for location: "${location}"`);
      return null;
    }

    const { lat, lng } = results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error('Error fetching geolocation from Google Maps:', error.message);
    return null;
  }
};
// Reverse Geocode
const getAddressFromCoordinates = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    console.error('Coordinates are missing');
    return null;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is missing');
    return null;
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const results = response.data.results;

    if (!results || results.length === 0) {
      console.warn(`No address found for coordinates: ${latitude},${longitude}`);
      return null;
    }

    // Return formatted address (e.g., "Manila, Philippines")
    return results[0].formatted_address;
    
  } catch (error) {
    console.error('Error reverse geocoding:', error.message);
    return null;
  }
};

// Nodemailer
const twoFACodes = {}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

//Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' })

    // Generate a 2FA code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    twoFACodes[username] = { code, expires: Date.now() + 5 * 60 * 1000 }

    // Send the code via email
    await transporter.sendMail({
      from: '"Login Verification" <noreply@example.com>',
      to: user.email,
      subject: 'Your Login 2FA Code',
      text: `Your 2FA code is: ${code}. It expires in 5 minutes.`,
    })

    res.json({ requires2FA: true, username })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Verify 
app.post('/verify-2fa', async (req, res) => {
  const { username, code } = req.body
  const entry = twoFACodes[username]

  if (!entry || entry.code !== code || Date.now() > entry.expires) {
    return res.status(401).json({ message: 'Invalid or expired 2FA code' })
  }

  delete twoFACodes[username]

  const user = await User.findOne({ username })
  const token = jwt.sign(
    { username: user.username, userRole: user.userRole },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.json({
    token,
    user: {
      username: user.username,
      userRole: user.userRole,
    },
  })
})

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
  console.log(`Incoming request: ${req.method} ${req.url}`);

  try {
    // Find driver by username
    const driver = await Driver.findOne({ username });
    if (!driver) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcryptjs.compare(password, driver.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    driver.onDuty = true;
    await driver.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: driver._id, userRole: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );
    res.json({ success: true, token, driver: { id: driver._id, username: driver.username, email: driver.email, onDuty: driver.onDuty } });
  } catch (error) {
    console.error("Driver login error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Driver logout
app.post('/logout', async (req, res) => {
  try {
    const { driverUsername } = req.body;

    const driver = await Driver.findOne({username: driverUsername});
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    driver.onDuty = false;
    await driver.save(); 

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

//Driver get shipments
app.get('/driver/shipments', async (req, res) => {
  try {
    const activeShipments = await TrackData.find({}, {
      trackingNumber: 1,
      deliveryAddress: 1,
      status: 1,
      latitude: 1,
      longitude: 1,
      driverUsername: 1,
      updated_at: 1,
    })

    res.json(activeShipments)
  } catch (error) {
    console.error("Error fetching active shipments:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})
// Driver selects shipments to track
app.post('/driver/select-shipment', async (req, res) => {
  const { trackingNumber, driverUsername } = req.body;
  console.log('Received for assign:', { trackingNumber, driverUsername })

  try {
    const shipment = await TrackData.findOne({ trackingNumber });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    shipment.driverUsername = driverUsername; 
    await shipment.save();

    res.json({ message: "Shipment successfully assigned to the driver", shipment });
  } catch (error) {
    console.error("Error assigning shipment:", error);
    res.status(500).json({ message: "Server error" });
  }
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

      if (!shipment.destination_latitude || !shipment.destination_longitude) {
        console.log('Fetching coordinates for destination:', shipment.deliveryAddress); 

        if (!shipment.deliveryAddress) {
          return res.status(400).json({ status: 'error', message: 'Delivery address is missing.' });
        }

        const destinationCoords = await getCoordinates(shipment.deliveryAddress);

        if (destinationCoords) {
          shipment.destination_latitude = destinationCoords.latitude;
          shipment.destination_longitude = destinationCoords.longitude;
        } else {
          return res.status(500).json({ status: 'error', message: 'Unable to fetch geolocation for delivery address.' });
        }
      }

      await shipment.save();

      return res.json({
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        current_location: shipment.current_location,
        expected_delivery: shipment.expected_delivery,
        updated_at: shipment.updated_at,
        latitude: Number(shipment.latitude),
        longitude: Number(shipment.longitude),
        destination_latitude: Number(shipment.destination_latitude),
        destination_longitude: Number(shipment.destination_longitude),
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

// Notifications 
const criticalStatuses = ["Out for delivery", "Delivered", "Exception"];
const lastStatusMap = new Map();

setInterval(async () => {
  if (!dbReady) return;
  try {
    const recentShipments = await TrackData.find().sort({ updatedAt: -1 }).limit(10);

    recentShipments.forEach((shipment) => {
      const lastStatus = lastStatusMap.get(shipment.trackingNumber);

      if (criticalStatuses.includes(shipment.status) && shipment.status !== lastStatus) {
        lastStatusMap.set(shipment.trackingNumber, shipment.status);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "shipmentUpdate",
                data: {
                  trackingNumber: shipment.trackingNumber,
                  status: shipment.status,
                },
              })
            );
          }
        });
      }
    });
  } catch (err) {
    console.error("Error broadcasting shipment updates:", err);
  }
}, 60000);

function getStatusMessage(status, location) {
  switch (status) {
    case "Out for delivery":
      return `Shipment is out for delivery from ${location}`;
    case "Delivered":
      return `Shipment has been delivered successfully.`;
    case "Exception":
      return `Shipment has encountered an issue. Please contact support.`;
    default:
      return `Shipment update: ${status}`;
  }
}


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


