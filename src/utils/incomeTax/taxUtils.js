function calculateIncomeTaxNewRegime(annualIncome) {
  let tax = 0;
  const slabs = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.1 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];
  let remainingIncome = annualIncome;

  for (let i = 0; i < slabs.length; i++) {
    const currentSlab = slabs[i];
    const nextLimit = slabs[i + 1]?.limit || Infinity;
    const taxable = Math.min(remainingIncome, nextLimit - currentSlab.limit);
    tax += taxable * currentSlab.rate;
    remainingIncome -= taxable;
    if (remainingIncome <= 0) break;
  }

  return Math.round(tax);
}

function calculateIncomeTaxOldRegime(annualIncome) {
  let tax = 0;
  if (annualIncome <= 250000) return 0;
  if (annualIncome <= 500000) return Math.round((annualIncome - 250000) * 0.05);
  if (annualIncome <= 1000000) return Math.round(250000 * 0.05 + (annualIncome - 500000) * 0.20);
  return Math.round(250000 * 0.05 + 500000 * 0.20 + (annualIncome - 1000000) * 0.30);
}

function calculateIncomeTax_2025_26(annualIncome) {
  if (annualIncome <= 1200000) return 0;
  if (annualIncome <= 1500000) {
    return Math.round((annualIncome - 1200000) * 0.20);
  } else {
    return Math.round((300000 * 0.20) + ((annualIncome - 1500000) * 0.30));
  }
}

module.exports = {
  calculateIncomeTaxNewRegime,
  calculateIncomeTaxOldRegime,
  calculateIncomeTax_2025_26,
};
