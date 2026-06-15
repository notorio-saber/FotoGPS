import { OverlaySettings } from '../types';

const STORAGE_KEY = 'geofoto-overlay-settings';

const DEFAULT_SETTINGS: OverlaySettings = {
  showDate: true,
  showTime: true,
  showCoords: true,
  showAccuracy: true,
  showAltitude: true,
  showCity: true,
  showProject: true,
  showLogo: false,
  logoDataUrl: '',
  coordFormat: 'decimal',
  fontSize: 'medium',
  position: 'bottom',
};

export function getSettings(): OverlaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<OverlaySettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: OverlaySettings): void {
  // logoDataUrl is stored in IndexedDB — never in localStorage (quota issues)
  const { logoDataUrl: _omit, ...rest } = settings;
  void _omit;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    console.warn('saveSettings: localStorage quota exceeded');
  }
}

export function updateSettings(partial: Partial<OverlaySettings>): OverlaySettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  saveSettings(updated);
  return updated;
}
