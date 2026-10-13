/**
 * READER SETTINGS — data source: LOCAL (localStorage)
 *
 * Backend has `PUT /mangas/preferences` (real API) but its documented payload
 * is genre/category based (`favoriteCategories`) — it is NOT a reader UI
 * preference store. So reader appearance stays local for now.
 *
 * DATA SOURCE SWAP (future)
 * -------------------------
 * Swap `readJson`/`setJson` for the preferences API and keep the same shape.
 */
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';

export const READING_MODES = [
  { value: 'scroll', label: 'Cuộn liên tục' },
  { value: 'paged', label: 'Lật trang' },
];

export const READING_BACKGROUNDS = [
  { value: 'light', label: 'Sáng', color: '#ffffff' },
  { value: 'sepia', label: 'Sepia', color: '#f4ecd8' },
  { value: 'dark', label: 'Tối', color: '#15181d' },
];

export const PAGE_WIDTHS = [
  { value: 'narrow', label: 'Hẹp', maxWidth: 720 },
  { value: 'normal', label: 'Vừa', maxWidth: 980 },
  { value: 'wide', label: 'Rộng', maxWidth: 1200 },
  { value: 'full', label: 'Toàn màn', maxWidth: '100%' },
];

export const ZOOM_LEVELS = [0.8, 0.9, 1, 1.1, 1.25, 1.5];

export const DEFAULT_READER_SETTINGS = {
  mode: 'scroll',
  background: 'light',
  pageWidth: 'normal',
  zoom: 1,
  showProgress: true,
  showChapterTitle: true,
  autoNextChapter: false,
  keepScreenAwake: false,
  resumePrompt: true,
};

export function getReaderSettings() {
  return { ...DEFAULT_READER_SETTINGS, ...(readJson(STORAGE_KEYS.READER_SETTINGS, {}) || {}) };
}

export function updateReaderSettings(patch) {
  const next = { ...getReaderSettings(), ...patch };
  setJson(STORAGE_KEYS.READER_SETTINGS, next);
  return next;
}

export function resetReaderSettings() {
  return updateReaderSettings(DEFAULT_READER_SETTINGS);
}

export const getBackgroundColor = (value) =>
  READING_BACKGROUNDS.find((b) => b.value === value)?.color || '#ffffff';

export const getMaxPageWidth = (value) =>
  PAGE_WIDTHS.find((w) => w.value === value)?.maxWidth || 980;

/** Foreground colour that stays readable on the chosen background. */
export const isDarkBackground = (value) => value === 'dark';

const readerSettingsService = {
  getReaderSettings,
  updateReaderSettings,
  resetReaderSettings,
  DEFAULT_READER_SETTINGS,
};

export default readerSettingsService;
