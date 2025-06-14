const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
    ref: 'Tenant',
  },
  employeeName: { type: String },
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  panNumber: {
    type: String,
    required: true,
  },
  uanNumber: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  pfNumberOfEmployee: {
    type: "String",
    requred: true,
  },
  pfNumberOfEmployer: {
    type: String,
    required: true,
  },

  salaryStructure: {
    ctc:{
      default: 0,
      type: Number,
      required: true,  
    },
    basic: {
      type: Number,
      default:0,
      required: true,
     
    },
    hra: {
      type: Number,
      default: 0,
      required: true,
    },
    specialAllowance: {
      type: Number,
      default: 0,
    },
    professionalTax: {
      type: Number,
      default: 0,
      required: true,
    },
    incomeTax: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    pfEmployee: {
      default: 0,
      type: Number,
    },
    pfEmployer: {
      default: 0,
      type: Number,
    },
    gratuity: {
      default: 0,
      type: Number,
    }
  },
  totalEarnings: {
    type: Number,
    default: 0,
    // required: true,
  },
  totalDeductions: {
    type: Number,
    default: 0,
    // required: true,
  },
  netSalary: {
    type: Number,
    default: 0,
    // required: true,
  },
 

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Salary", salarySchema);
