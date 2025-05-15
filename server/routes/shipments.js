const express = require('express');
const router = express.Router();
const Shipment = require('../models/TrackData');
const verifyToken = require('../middleware/auth') 

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.find();
    res.json(shipments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
router.get('/user', verifyToken, async (req, res) => {
  try {
    const shipments = await Shipment.find({user_id: req.user.id}).populate('user_id')
    res.json(shipments)
  } catch (err) {
    console.error('Error fetching user shipments:', err)
    res.status(500).json({ error: 'Server error fetching shipments.' })
  }
})

// Optionally: Get single shipment by tracking number
router.get('/:trackingNumber', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber });
    if (!shipment) return res.status(404).send('Shipment not found');
    res.json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
