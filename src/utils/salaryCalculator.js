function calculateSalaryFromCTC(ctc, includeGratuity = false) {
  const gratuity = includeGratuity ? ctc * 0.0481 : 0; // 4.81% gratuity (standard formula)
  const adjustedCTC = ctc - gratuity;

  const basic = adjustedCTC * 0.4;
  const hra = basic * 0.5;
  const specialAllowance = adjustedCTC - (basic + hra);

  // Deductions
  const pfEmployee = basic * 0.12;
  const pfEmployer = basic * 0.12;
  const professionalTax = 200; // fixed or tiered as per state
  const incomeTax = 0; // you can compute based on slabs
  const deductions = 0;

  const totalEarnings = basic + hra + specialAllowance;
  const totalDeductions = pfEmployee + professionalTax + incomeTax + deductions;
  const netSalary = totalEarnings - totalDeductions;

  return {
    salaryStructure: {
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
