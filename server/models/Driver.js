const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const DriverSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userRole: { type: String, default: 'driver' },
  assignedShipments: [String],
});

DriverSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

const Driver = mongoose.model('Driver', DriverSchema);
module.exports = Driver;