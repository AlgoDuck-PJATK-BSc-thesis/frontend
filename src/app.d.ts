import type { AuthUserDto } from '$lib/api/auth';

declare global {
	namespace App {
		interface PageData {
			user?: AuthUserDto;
		}
	}
}

export {};
