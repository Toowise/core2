const express = require('express')
const router = express.Router()
const Driver = require('../models/Driver')
require('../models/Vehicle')

router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find().populate('vehicle')
    res.status(200).json(drivers)
  } catch (err) {
    console.error('Error fetching drivers:', err)
    res.status(500).json({ error: 'Failed to fetch drivers' })
  }
})

module.exports = router
