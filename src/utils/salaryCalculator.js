const calculateSalary = (basic, hra, specialAllowance, professionalTax, incomeTax) => {
    const totalEarnings = basic + hra + specialAllowance;
    const totalDeductions = professionalTax + incomeTax;
    const netSalary = totalEarnings - totalDeductions;
  
    return { totalEarnings, totalDeductions, netSalary };
  };
  
  module.exports = calculateSalary;
  