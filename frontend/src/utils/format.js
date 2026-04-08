/** Formatting helpers */

/** Sort time strings like "8:00 AM", "1:00 PM" chronologically */
export function sortTimes(times) {
  return [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

/** Convert "8:00 AM" → 480 (minutes from midnight) */
export function timeToMinutes(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [h] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60;
}

/** Calculate utilization color */
export function utilizationColor(pct) {
  if (pct > 70) return '#ef4444';
  if (pct > 40) return '#f59e0b';
  return '#06d6a0';
}

/** Calculate workload color */
export function workloadColor(pct) {
  if (pct >= 100) return '#ef4444';
  if (pct >= 75)  return '#f59e0b';
  return '#06d6a0';
}

/** Truncate text */
export function truncate(str, len = 30) {
  return str?.length > len ? str.slice(0, len) + '…' : str;
}
