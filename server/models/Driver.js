const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userRole: { type: String, default: 'driver' },
  assignedShipments: [String],
});

const Driver = mongoose.model('Driver', DriverSchema);
module.exports = Driver;