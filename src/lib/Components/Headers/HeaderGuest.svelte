<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/Components/LayoutComponents/ThemeToggles/ThemeToggle.svelte';

</script>

<header
	class="font-body sticky top-0 z-50 flex h-16 items-center justify-between border-b-4 border-[color:var(--color-bg-header-border)] bg-[color:var(--color-header-guest)] px-8 py-4 text-[color:var(--color-text)]"
>
	<a href="/" class="text-lg font-semibold text-[color:var(--color-logo-header)] no-underline">
		AlgoDuck
	</a>

	<nav>
		<ul
			class="ml-24 flex list-none gap-7 p-0 font-semibold tracking-wide text-[color:var(--color-landingpage-subtitle)]"
		>
			<li>
				<a
					href="/"
					aria-current={page.url.pathname === '/' ? 'page' : undefined}
					class="tracking-normal no-underline hover:text-[color:var(--color-primary)]"
				>
					Home
				</a>
			</li>
			<!-- <li>
				<a
					href="/learnmore"
					aria-current={page.url.pathname === '/learnmore' ? 'page' : undefined}
					class="tracking-normal text-[#f5f5f5] no-underline hover:text-[color:var(--color-primary)]"
				>
					Learn More
				</a>
			</li> -->
			<li>
				<a
					href="/aboutus"
					aria-current={page.url.pathname === '/about' ? 'page' : undefined}
					class="tracking-normal no-underline hover:text-[color:var(--color-primary)]"
				>
					About Us
				</a>
			</li>
			<li>
				<a
					href="/login"
					aria-current={page.url.pathname === '/login' ? 'page' : undefined}
					class="tracking-normal no-underline hover:text-[color:var(--color-primary)]"
				>
					Log In
				</a>
			</li>
			<li>
				<a
					href="/signup"
					aria-current={page.url.pathname === '/signup' ? 'page' : undefined}
					class="tracking-normal no-underline hover:text-[color:var(--color-primary)]"
				>
					Sign Up
				</a>
			</li>
		</ul>
	</nav>

	<div class="flex h-full flex-row items-center justify-center gap-4">
		<div class="w-18">
			<ThemeToggle />
		</div>
	</div>
</header>
