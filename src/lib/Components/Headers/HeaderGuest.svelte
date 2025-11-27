<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/Components/LayoutComponents/ThemeToggle.svelte';

	let currentLang = '🇺🇸';
	function toggleLang() {
		currentLang = currentLang === '🇺🇸' ? '🇵🇱' : '🇺🇸';
	}
</script>

<header
	class="font-body sticky top-0 z-50 flex h-16 items-center justify-between border-b-4 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] px-8 py-4 text-[color:var(--color-text)]"
>
	<a href="/" class="text-lg font-semibold text-[color:var(--color-accent-2)] no-underline">
		AlgoDuck
	</a>

	<nav>
		<ul class="ml-24 flex list-none gap-7 p-0 font-semibold tracking-wide">
			<li>
				<a
					href="/"
					aria-current={page.url.pathname === '/' ? 'page' : undefined}
					class="tracking-normal text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Home
				</a>
			</li>
			<!-- <li>
				<a
					href="/learnmore"
					aria-current={page.url.pathname === '/learnmore' ? 'page' : undefined}
					class="tracking-normal text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Learn More
				</a>
			</li> -->
			<li>
				<a
					href="/aboutus"
					aria-current={page.url.pathname === '/about' ? 'page' : undefined}
					class="tracking-normal text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
				>
					About Us
				</a>
			</li>
			<li>
				<a
					href="/login"
					aria-current={page.url.pathname === '/login' ? 'page' : undefined}
					class="tracking-normal text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Log In
				</a>
			</li>
			<li>
				<a
					href="/signup"
					aria-current={page.url.pathname === '/signup' ? 'page' : undefined}
					class="tracking-normal text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Sign Up
				</a>
			</li>
		</ul>
	</nav>

	<div class="flex items-center gap-4">
		<div class="relative mr-18 ml-16 h-[1rem] w-[1rem] translate-y-[-3px]">
			<ThemeToggle />
		</div>
		<button
			onclick={toggleLang}
			class="cursor-pointer border-none bg-transparent text-2xl leading-none"
			aria-label="Toggle Language"
		>
			{currentLang}
		</button>
	</div>
</header>