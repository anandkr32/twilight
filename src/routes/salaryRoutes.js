const userAuth = require("../middlewares/auth");
const Salary = require("../models/salary");
const User = require("../models/user"); // Import User model
const calculateSalary = require("../utils/salaryCalculator");
const express = require("express");
const router = express.Router();

//GET Api to get the Salry Account Details
router.get("/getSalaryAccount", userAuth, async(req, res)=>{
  try{
    const salary = await Salary.find({})
    res.status(200).json(salary)

  }catch(err){
    res.status(400).json({error:err.message})
  }
})

//GET Api for salary details using employee id
router.get("/getSalaryAccount/:employeeId", userAuth,  async (req, res) => {
  try {
    const { employeeId } = req.params; // Get employeeId from URL params

    const salary = await Salary.findOne({ employeeId })

    if (!salary) {
      return res.status(404).json({ success: false, message: "Salary account not found" });
    }

    res.status(200).json({ success: true, salary });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Post API for generating Account Details
router.post("/createAccountDetails", userAuth, async (req, res) => {
  try {
    const {employeeId, ifscCode, bankName, accountNumber, panNumber, uanNumber,pfNumberOfEmployee, pfNumberOfEmployer } = req.body;
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const existingSalary = await Salary.findOne({employeeId});
    //Existing Details Validation
    if(existingSalary){
      return res.status(400).json({err:"salary details already added"})
    }

    const accountDetails = new Salary({employeeId, employeeName: user.name, ifscCode, bankName, accountNumber, panNumber, uanNumber, pfNumberOfEmployee, pfNumberOfEmployer }); // Fixed `ifscCode` to `ifsc`
    
    await accountDetails.save();
    res.status(200).json({ accountDetails });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//PATCH Api to create salary details
router.patch("/updateSalaryDetails", userAuth,  async (req, res) => {
  try {
    const {
      employeeId,
      basic,
      hra,
      specialAllowance,
      professionalTax,
      incomeTax,
      deductions,
      pfEmployer,
      pfEmployee,
      ctc
    } = req.body;

    // Find the existing salary record
    const salaryRecord = await Salary.findOne({ employeeId });

    if (!salaryRecord) {
      return res.status(404).json({ success: false, message: "Salary account not found for this employee" });
    }

    // Calculate Gross & Net Salary
    const grossSalary = basic + hra + specialAllowance;
    const totalDeductions = pfEmployee + professionalTax + incomeTax + deductions;
    const netSalary = grossSalary - totalDeductions;

    // Update salaryStructure within the record
    salaryRecord.salaryStructure = {
      basic,
      hra,
      specialAllowance,
      professionalTax,
      incomeTax,
      deductions,
      pfEmployee,
      pfEmployer     
    };

    // Update calculated fields
   
    salaryRecord.ctc = ctc;
    salaryRecord.totalEarnings = grossSalary;
    salaryRecord.totalDeductions = totalDeductions;
    salaryRecord.netSalary = netSalary;

    await salaryRecord.save();

    res.status(200).json({
      success: true,
      message: "Salary details updated successfully",
      updatedRecord: salaryRecord
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

//PATCH Api to update Account details
router.patch("/updateAccountDetails", userAuth, async (req, res) => {
  try {
    const { employeeId, ...updateData } = req.body;

    // Check if user exists
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update salary details
    const salary = await Salary.findOneAndUpdate(
      { employeeId }, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );

    if (!salary) {
      return res.status(404).json({ success: false, message: "Salary details not found" });
    }

    res.status(200).json({ success: true, salary });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});






module.exports = router;  // ✅ Correct export

