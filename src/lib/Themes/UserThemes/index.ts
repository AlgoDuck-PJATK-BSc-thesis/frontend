import { dark } from "./dark";
import { light } from "./light";

export const themes = {
  'light': light,
  'dark' : dark,
} as const

export type ThemeName = keyof typeof themes;

export const applyTheme = (themeName: ThemeName) => {
  Object.entries(themes[themeName]).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}