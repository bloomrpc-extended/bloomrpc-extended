import Store from 'electron-store';

const SettingsStore = new Store({
  name: "settings",
});

export interface TabUXSettings {
  tabSearchEnabled: boolean;
  tabGroupingEnabled: boolean;
  tabOverflowMenuEnabled: boolean;
  editorFontSize: number;
}

const SETTINGS_KEY = "tabUXSettings";

export const EDITOR_FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24] as const;

const defaults: TabUXSettings = {
  tabSearchEnabled: true,
  tabGroupingEnabled: true,
  tabOverflowMenuEnabled: true,
  editorFontSize: 13,
};

export function getTabUXSettings(): TabUXSettings {
  return SettingsStore.get(SETTINGS_KEY, defaults) as TabUXSettings;
}

export function storeTabUXSettings(settings: TabUXSettings) {
  SettingsStore.set(SETTINGS_KEY, settings);
}

export function clearSettings() {
  SettingsStore.clear();
}
