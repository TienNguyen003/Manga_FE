/**
 * Namespaced, crash-safe localStorage helper.
 *
 * WHY THIS EXISTS
 * ---------------
 * Reading progress / reader settings / streak fallback / XP / coins all need to
 * survive a refresh, but they must NEVER crash the app when:
 *   - localStorage is disabled (Safari private mode, SSR, sandboxed iframe)
 *   - the stored value is corrupt / was written by an older version
 *   - a quota error happens on write
 *
 * It also exposes a tiny pub/sub so a value written by the Reader immediately
 * updates the Header / Home / Dashboard without prop drilling or re-fetching.
 */

const NAMESPACE = 'cmx';
const memoryFallback = new Map();

const canUseDom = () => typeof window !== 'undefined' && !!window.localStorage;

export const storageKey = (key) => `${NAMESPACE}:${key}`;

export function readRaw(key) {
  if (!canUseDom()) return memoryFallback.get(storageKey(key)) ?? null;
  try {
    return window.localStorage.getItem(storageKey(key));
  } catch {
    return memoryFallback.get(storageKey(key)) ?? null;
  }
}

export function writeRaw(key, value) {
  memoryFallback.set(storageKey(key), value);
  if (!canUseDom()) return false;
  try {
    window.localStorage.setItem(storageKey(key), value);
    return true;
  } catch {
    return false;
  }
}

export function removeRaw(key) {
  memoryFallback.delete(storageKey(key));
  if (!canUseDom()) return;
  try {
    window.localStorage.removeItem(storageKey(key));
  } catch {
    /* noop */
  }
}

export function readJson(key, fallback = null) {
  const raw = readRaw(key);
  if (raw === null || raw === undefined) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    // Corrupt payload (partial write / legacy format) -> self-heal.
    removeRaw(key);
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Pub/sub so local state stays in sync across the app without a server
 * ------------------------------------------------------------------ */

const listeners = new Map();

export function subscribeStorage(key, callback) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(callback);
  return () => {
    listeners.get(key)?.delete(callback);
  };
}

function emit(key) {
  listeners.get(key)?.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.warn(`[storage] listener for "${key}" failed`, err);
    }
  });
}

/**
 * writeJson + notify. Prefer this over writeJson when UI depends on the value.
 */
export function setJson(key, value) {
  const ok = writeJson(key, value);
  emit(key);
  return ok;
}

export function clearKey(key) {
  removeRaw(key);
  emit(key);
}

export const STORAGE_KEYS = {
  READING_PROGRESS: 'reading-progress',
  READING_STATS: 'reading-stats',
  READER_SETTINGS: 'reader-settings',
  READING_GOAL: 'reading-goal',
  XP: 'xp-state',
  ACHIEVEMENTS: 'achievement-state',
  CHALLENGES: 'challenge-state',
  MEMBERSHIP: 'membership',
  COINS: 'coin-wallet',
  REFERRAL: 'referral',
  DISCOVERY_PREFERENCES: 'discovery-preferences',
  CONTENT_ACCESS: 'content-access',
};
