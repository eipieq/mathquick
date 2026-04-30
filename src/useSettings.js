import { useState, useCallback } from "react";

const STORAGE_KEY = "mq_settings_v1";
const DEFAULTS = {
  timerEnabled: true,
  timerSeconds: null, // null = use per-question adaptive default (15–30s)
};

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { settings, update };
}
