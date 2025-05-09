const mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema({
  number: { type: String, required: true }, 
  model: { type: String },
  type: { type: String }, 
  assignedDriver: { type: mongoose.Schema.Types.ObjectId,ref: 'Driver' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Vehicle', VehicleSchema)
