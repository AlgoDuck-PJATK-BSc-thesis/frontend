import { dark } from "./dark";
import { light } from "./light";
import { contrast, type ContrastLevel } from './contrast';

export const themes = {
  'light': light,
  'dark' : dark,
} as const

export type ThemeName = keyof typeof themes;

export const applyTheme = (themeName: ThemeName) => {
  Object.entries(themes[themeName]).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
  document.documentElement.setAttribute('data-theme', themeName);
}

export const applyContrast = (level: ContrastLevel | '0' | 0 | null) => {
  const root = document.documentElement;

  Object.keys(contrast['1']).forEach(k => root.style.removeProperty(k));
  Object.keys(contrast['2']).forEach(k => root.style.removeProperty(k));

  if (level === '1' || level === '2') {
    Object.entries(contrast[level]).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
    root.setAttribute('data-contrast', level);
  } else {
    root.setAttribute('data-contrast', '0');
    const currentTheme = (root.getAttribute('data-theme') ?? 'light') as ThemeName;
    applyTheme(currentTheme);
  }
};

export const setThemeWithContrast = (
  theme: ThemeName,
  level: ContrastLevel | '0' | 0 | null
) => {
  applyTheme(theme);
  applyContrast(level);
};
