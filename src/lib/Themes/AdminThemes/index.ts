import { contrast1, contrast2 } from "./contrast";
import { CurrentAdminTheme } from "./currentAdminTheme.svelte";
import { defaultTheme } from "./default";

export const adminThemes = {
  'default': defaultTheme,
  'contrast1': contrast1,
  'contrast2': contrast2,
} as const;

export type AdminTheme = keyof typeof adminThemes;

export const applyThemeAdmin = (themeName: AdminTheme) => {
  CurrentAdminTheme.theme = themeName;
  Object.entries(adminThemes[themeName]).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}


export const rgbToHex = (rgb: string): string => {
    const [r, g, b] = rgb.split(' ').map(Number);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

export const rgbToRgba = (rgb: string, alpha: number): string => {
    const [r, g, b] = rgb.split(' ').map(Number);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
