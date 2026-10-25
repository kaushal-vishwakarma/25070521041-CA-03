const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatMoney = (amount) => `\u20B9${rupees.format(amount)}`;

// Examples: "Unpaid", "\u20B910,000 / month", "\u20B910,000 - \u20B915,000 / month"
export const formatStipend = (min = 0, max = 0) => {
  if (!min && !max) return 'Unpaid';
  if (min === max || !min) return `${formatMoney(max)} / month`;
  return `${formatMoney(min)} - ${formatMoney(max)} / month`;
};

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

// Whole days from now until the date (negative if already passed).
export const daysLeft = (value) => Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);

export const deadlineLabel = (value) => {
  const days = daysLeft(value);
  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Closes today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

export const timeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, size] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${name}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

// "react, node" -> ["react", "node"]   (used by forms that take comma-separated skills)
export const splitList = (text = '') =>
  [...new Set(text.split(',').map((item) => item.trim()).filter(Boolean))];
