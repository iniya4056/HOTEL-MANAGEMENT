const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatPrice = (n) => inr.format(Number(n) || 0);

export const truncate = (text = '', max = 120) => (text.length > max ? `${text.slice(0, max).trimEnd()}…` : text);
