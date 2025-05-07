const calculateIncomeTax_2025_26 = require('./incomeTax/calculateIncomeTax_2025_26');

function calculateSalaryFromCTC(ctc, includeGratuity = false) {
  const gratuity = includeGratuity ? ctc * 0.0481 : 0;
  const adjustedCTC = ctc - gratuity;

  const basic = adjustedCTC * 0.4;
  const hra = basic * 0.5;
  const specialAllowance = adjustedCTC - (basic + hra);

  const pfEmployee = basic * 0.12;
  const pfEmployer = basic * 0.12;
  const professionalTax = 200;

  // 🧮 Income Tax based on annual earnings
  const annualGross = basic + hra + specialAllowance;
  const incomeTax = calculateIncomeTax_2025_26(annualGross);

  const deductions = 0;
  const totalEarnings = basic + hra + specialAllowance;
  const totalDeductions = pfEmployee + professionalTax + incomeTax + deductions;
  const netSalary = totalEarnings - totalDeductions;

  return {
    salaryStructure: {
      ctc: Math.round(ctc),
      basic: Math.round(basic),
      hra: Math.round(hra),
      specialAllowance: Math.round(specialAllowance),
      professionalTax,
      incomeTax,
      deductions,
      pfEmployee: Math.round(pfEmployee),
      pfEmployer: Math.round(pfEmployer),
    },
    totalEarnings: Math.round(totalEarnings),
    totalDeductions: Math.round(totalDeductions),
    netSalary: Math.round(netSalary),
    gratuity: Math.round(gratuity),
    ctc: Math.round(ctc),
  };
}

module.exports = calculateSalaryFromCTC;
