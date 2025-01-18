const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  accessLevel: {
    type: String,
    enum: ['admin', 'manage', 'employee'],
    required: true
  },
  superiorId: {
    type: String,
    required: true
  },
  subordinateIds: {
    type: [String],
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
