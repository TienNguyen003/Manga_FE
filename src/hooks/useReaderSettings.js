import { useCallback, useEffect, useState } from 'react';

import readerSettingsService, {
  getBackgroundColor,
  getMaxPageWidth,
  isDarkBackground,
  PAGE_WIDTHS,
  READING_BACKGROUNDS,
  READING_MODES,
  ZOOM_LEVELS,
} from '~/services/readerSettingsService';

/**
 * useReaderSettings — Page/Component -> Hook -> Service -> localStorage
 *
 * Persists reader appearance and re-renders the Reader on every change, so the
 * settings panel doubles as a live preview. Initialised from storage in a
 * `useState` initialiser (not an effect) to avoid a flash of default settings.
 */
export default function useReaderSettings() {
  const [settings, setSettingsState] = useState(() => readerSettingsService.getReaderSettings());

  // Keep multiple mounted consumers (settings panel + reader shell) in sync.
  useEffect(() => {
    const onStorage = () => setSettingsState(readerSettingsService.getReaderSettings());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setSettings = useCallback((patch) => {
    setSettingsState(readerSettingsService.updateReaderSettings(patch));
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(readerSettingsService.resetReaderSettings());
  }, []);

  const cycleBackground = useCallback(() => {
    const index = READING_BACKGROUNDS.findIndex((b) => b.value === settings.background);
    const next = READING_BACKGROUNDS[(index + 1) % READING_BACKGROUNDS.length];
    setSettings({ background: next.value });
    return next.value;
  }, [settings.background, setSettings]);

  const stepZoom = useCallback(
    (direction) => {
      const index = ZOOM_LEVELS.indexOf(settings.zoom);
      const nextIndex = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, (index < 0 ? 2 : index) + direction));
      setSettings({ zoom: ZOOM_LEVELS[nextIndex] });
      return ZOOM_LEVELS[nextIndex];
    },
    [settings.zoom, setSettings],
  );

  return {
    settings,
    setSettings,
    resetSettings,
    cycleBackground,
    stepZoom,
    backgroundColor: getBackgroundColor(settings.background),
    maxWidth: getMaxPageWidth(settings.pageWidth),
    isDark: isDarkBackground(settings.background),
    options: { modes: READING_MODES, backgrounds: READING_BACKGROUNDS, widths: PAGE_WIDTHS, zooms: ZOOM_LEVELS },
  };
}

export { useReaderSettings };
