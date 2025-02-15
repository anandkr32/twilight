const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true // Ensures uniqueness for non-null values
  },
  designation: {
    type: String,
  },
  dob: {
    type: Date,
  },
  address: {
    type: String,
  },
  skills: {
    type: [String],
  },
  joiningDate: {
    type: Date,
  },
  accessLevel: {
    type: String,
    enum: ['admin', 'manage', 'employee'],
  },
  superiorId: {
    type: String,
  },
  subordinateIds: {
    type: [String],
  },
  password: {
    type: String,
  }
});

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
