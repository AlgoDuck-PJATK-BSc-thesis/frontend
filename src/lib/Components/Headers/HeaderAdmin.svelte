<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authApi } from '$lib/api/auth';

	const logout = async () => {
		try {
			await authApi.logout(fetch);
		} finally {
			await goto('/login');
		}
	};
</script>

<header
	class="font-body sticky top-0 z-50 flex h-16 items-center justify-between border-b-4 border-[color:var(--color-bg-header-border)] bg-admin-bg-tertiary px-8 py-4 text-[color:var(--color-landingpage-subtitle)]"
>
	<div class="flex items-center gap-6 whitespace-nowrap">
		<a href="/home" class="text-lg font-semibold text-[color:var(--color-primary)] no-underline"
			>AlgoDuck</a
		>
		<span
			class="rounded-sm border border-admin-bg-primary bg-admin-bg-primary px-2 py-1 text-xs font-semibold tracking-wider text-[color:var(--color-landingpage-subtitle)]"
		>
			ADMIN
		</span>
	</div>

	<nav class="mr-6 ml-6 overflow-y-auto">
		<ul
			class="mr-4 flex list-none items-center gap-6 font-semibold tracking-wider whitespace-nowrap"
		>
			<li>
				<a
					href="/problem"
					aria-current={page.url.pathname.startsWith('/problem') ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Add problem
				</a>
			</li>

			<li>
				<a
					href="/users"
					aria-current={page.url.pathname.startsWith('/users') ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Users
				</a>
			</li>

			<li>
				<a
					href="/cohorts"
					aria-current={page.url.pathname.startsWith('/cohorts') ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Cohorts
				</a>
			</li>
		</ul>
	</nav>

	<div class="flex h-full flex-row items-center justify-center gap-2">
		<button
			type="button"
			onclick={logout}
			class="rounded-sm border border-admin-accent-primary bg-admin-accent-primary px-3 py-1 text-sm font-semibold tracking-wider text-white hover:bg-admin-accent-primary-hover"
			aria-label="Logout"
		>
			Logout
		</button>
	</div>
</header>
