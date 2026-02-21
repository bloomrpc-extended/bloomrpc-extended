import Store from 'electron-store';

const SettingsStore = new Store({
  name: "settings",
});

export interface TabUXSettings {
  tabSearchEnabled: boolean;
  tabGroupingEnabled: boolean;
  tabOverflowMenuEnabled: boolean;
}

const SETTINGS_KEY = "tabUXSettings";

const defaults: TabUXSettings = {
  tabSearchEnabled: true,
  tabGroupingEnabled: true,
  tabOverflowMenuEnabled: true,
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
