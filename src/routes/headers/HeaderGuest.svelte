<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '../../Components/ThemeToggle.svelte';

	let currentLang = '🇺🇸';
	function toggleLang() {
		currentLang = currentLang === '🇺🇸' ? '🇵🇱' : '🇺🇸';
	}
</script>

<header class="flex justify-between items-center px-8 py-4 bg-[color:var(--color-tile)] text-[color:var(--color-text)] border-b-2 border-[color:var(--color-accent-1)] font-body sticky top-0 z-50">
	<a href="/" class="text-[color:var(--color-accent-2)] text-base no-underline">BEETCODE</a>

	<nav>
		<ul class="flex gap-6 list-none p-0 m-0 text-xs uppercase tracking-wide">
			<li>
				<a
					href="/aboutus"
					aria-current={$page.url.pathname === '/about' ? 'page' : undefined}
					class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
				>
					About Us
				</a>
			</li>
			<li>
				<a
					href="/learnmore"
					aria-current={$page.url.pathname === '/learnmore' ? 'page' : undefined}
					class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
				>
					Learn More
				</a>
			</li>
			<li>
				<a
					href="/login"
					aria-current={$page.url.pathname === '/login' ? 'page' : undefined}
					class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
				>
					Log In
				</a>
			</li>
			<li>
				<a
					href="/signup"
					aria-current={$page.url.pathname === '/signup' ? 'page' : undefined}
					class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
				>
					Sign Up
				</a>
			</li>
		</ul>
	</nav>

	<div class="flex items-center gap-4">
		
		<ThemeToggle />
		
		<button
			onclick={toggleLang}
			class="text-xl bg-transparent border-none cursor-pointer p-0 leading-none"
			aria-label="Toggle Language"
		>
			{currentLang}
		</button>
	</div>
</header>