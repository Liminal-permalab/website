"use client";

// Light or dark. The choice is written on the page (<html data-theme>) so tokens.css can switch every colour, and
// remembered in this browser. It is a look preference only; no personal data is involved.
import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

export type Theme = "light" | "dark";
const listeners = new Set<() => void>();

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export const getTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // private window or blocked storage: the theme still applies until the page is closed
  }
  listeners.forEach((l) => l());
}

/** Called once before the first drawing, so the page never flashes the wrong theme. Dark unless light was chosen. */
export function applyStoredTheme(): void {
  document.documentElement.dataset.theme = stored() ?? "dark";
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useTheme = (): Theme => useSyncExternalStore(subscribe, getTheme, () => "dark");

/** Colours the 3D maps need per theme (three.js cannot read the CSS tokens by itself). */
export const MAP_INK: Record<Theme, { centre: string; project: string; paused: string }> = {
  light: { centre: "#33322f", project: "#a8a49d", paused: "#b9b6b0" },
  dark: { centre: "#f1efe9", project: "#8f8b84", paused: "#6b6862" },
};
