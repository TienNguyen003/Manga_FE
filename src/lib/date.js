/** Small date helpers shared by streak, goal, calendar and "time ago" UI. */

export const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');

/** Local-time YYYY-MM-DD (NOT UTC — a reader in +7 must not shift a day). */
export function toDayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDayKey(dayKey) {
  const [y, m, d] = String(dayKey).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function shiftDay(dayKey, delta) {
  const base = fromDayKey(dayKey) || new Date();
  base.setDate(base.getDate() + delta);
  return toDayKey(base);
}

/** Whole calendar days between two day keys (b - a). */
export function diffDays(aKey, bKey) {
  const a = fromDayKey(aKey);
  const b = fromDayKey(bKey);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/** The last `count` day keys, oldest -> newest, ending today. */
export function recentDayKeys(count, from = new Date()) {
  const keys = [];
  const cursor = fromDayKey(toDayKey(from)) || new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(d.getDate() - i);
    keys.push(toDayKey(d));
  }
  return keys;
}

export function timeAgo(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 0) return 'vừa xong';
  if (seconds < 60) return 'vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  return new Date(then).toLocaleDateString('vi-VN');
}

export const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** True for 22:00-04:59 local time. */
export function isNightHour(date = new Date()) {
  const h = (date instanceof Date ? date : new Date(date)).getHours();
  return h >= 22 || h < 5;
}

/** Saturday(6) or Sunday(0). */
export function isWeekend(date = new Date()) {
  const day = (date instanceof Date ? date : new Date(date)).getDay();
  return day === 0 || day === 6;
}

export function greeting(date = new Date()) {
  const h = (date instanceof Date ? date : new Date(date)).getHours();
  if (h < 5) return 'Đêm khuya rồi';
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/** Deterministic 32-bit hash — lets us build a stable "daily" rotation. */
export function hashString(input) {
  let hash = 2166136261;
  const str = String(input);
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}
