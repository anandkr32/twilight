const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  address: String,
  contactEmail: {type:String, required: true, unique: true},
  contactPhone: String,
  gstn: String, // Goods and Services Tax Number
  // Add more fields as needed
}, { timestamps: true });

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;