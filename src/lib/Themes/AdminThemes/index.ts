import { contrast1, contrast2 } from "./contrast";
import { defaultTheme } from "./default";

export const adminThemes = {
  'default': defaultTheme,
  'contrast1': contrast1,
  'contrast2': contrast2,
} as const;

export type AdminTheme = keyof typeof adminThemes;

export const applyThemeAdmin = (themeName: AdminTheme) => {
  Object.entries(adminThemes[themeName]).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}