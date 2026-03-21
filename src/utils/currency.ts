export const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    default: return '$';
  }
};
