import type { AuthUserDto } from "$lib/api/auth";

export const UserData: { user: AuthUserDto } = $state({} as { user: AuthUserDto });