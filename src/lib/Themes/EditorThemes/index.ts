import { dark } from "./dark";
import { light } from "./light";
import { dracula } from "./dracula";

export const editorThemes = {
  'vs-dark': dark,
  'vs': light,
  'dracula': dracula,
} as const;

export type EditorThemeName = keyof typeof editorThemes;

export const applyThemeEditor = (themeName: EditorThemeName) => {
  Object.entries(editorThemes[themeName]).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}