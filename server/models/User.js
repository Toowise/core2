const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userRole: { type: String, enum: ['admin', 'user'], default: 'user' },
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  firebaseUid: {type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);
module.exports = User;