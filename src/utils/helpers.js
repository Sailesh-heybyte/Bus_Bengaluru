export function formatTime(timeString) {
  if (!timeString || typeof timeString !== 'string') return '';
  const [hourStr, minStr] = timeString.split(':');
  if (hourStr === undefined || minStr === undefined) return timeString;

  const h = parseInt(hourStr, 10);
  if (isNaN(h)) return timeString;

  const period = h >= 12 ? 'pm' : 'am';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${minStr} ${period}`;
}

export function formatFare(baseFare, maxFare) {
  if (baseFare === undefined || maxFare === undefined) return '';
  if (baseFare === maxFare) return `₹${baseFare}`;
  return `₹${baseFare} - ₹${maxFare}`;
}

export default {
  formatTime,
  formatFare
};
