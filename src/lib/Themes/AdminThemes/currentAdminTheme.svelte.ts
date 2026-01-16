import { adminThemes, type AdminTheme } from ".";

export const CurrentAdminTheme = $state<{ theme: AdminTheme }>({ theme: 'default' })