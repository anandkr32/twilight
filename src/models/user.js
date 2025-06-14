const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  tenantId: {
    type: String,
    required: true,
    ref: 'Tenant',
  },
  name: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: '', // or provide a default avatar URL
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    default: 'single',
  },
  email: { 
    type: String,
    required: true,
    unique: true,
    trim: true,
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email Id is not valid", +value);
      }
    },
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true // Ensures uniqueness for non-null values
  },
  gender:{
    type: String,
    
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
    enum: ["admin", "manage", "employee"],
  },
  superiorId: {
    type: String,
  },
  subordinateIds: {
    type: [String],
  },
  password: {
    type: String,
  },
  firstLogin: { 
    type: Boolean, 
    default: false },

}, { timestamps: true });

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
