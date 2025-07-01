<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '../ThemeToggle.svelte';

	let currentLanguage = 'en';
	const toggleLanguage = () => {
		currentLanguage = currentLanguage === 'en' ? 'pl' : 'en';
	};

	const logout = () => {
		alert('Logging out...');
		window.location.href = 'http://localhost:5173';
	};
</script>

<header class="flex justify-between items-center p-4 md:px-8 border-b-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-body flex-wrap gap-4 sticky top-0 z-[100]">
	<a href="/home" class="text-[color:var(--color-primary)] text-base no-underline">BEETCODE</a>

	<nav>
		<ul class="flex gap-6 list-none m-0 p-0 flex-wrap text-xs uppercase tracking-wider">
			<!-- <li>
				<a
					href="/home"
					class={`no-underline ${
						$page.url.pathname === '/home' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
					} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
				>
					Home
				</a>
			</li> -->
		
			<li aria-current={$page.url.pathname === '/home' ? 'page' : undefined}>
				<a href="/home">Home</a>
			</li>
			<li><a href="/Categories">Problems</a></li>
			<li><a href="/cohorts">Cohorts</a></li>
			<li><a href="/contest">Contest</a></li>
			<li><a href="/leaderboard">Leaderboard</a></li>
			<li><a href="/store">Store</a></li>
		</ul>
	</nav>

	<div class="flex items-center gap-4 flex-wrap">
		<button
			onclick={toggleLanguage}
			class="text-xl bg-transparent border-none cursor-pointer p-0 leading-none"
			aria-label="Toggle Language"
		>
			{currentLanguage === 'en' ? '🇺🇸' : '🇵🇱'}
		</button>

		<ThemeToggle />

		<a href="/settings" aria-label="User settings" class="text-xl text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline">👤</a>

		<div class="relative flex border-2 border-[color:var(--color-accent-1)] rounded-full text-[0.65rem] overflow-hidden whitespace-nowrap">
			<div class="absolute top-[-25%] left-1/2 w-[2px] h-[150%] rotate-[30deg] bg-[color:var(--color-accent-1)] z-[1]"></div>
			<div class="flex-1 flex items-center justify-center px-3 py-1 z-[2] pl-4 pr-2">Lvl 10</div>
			<div class="flex-1 flex items-center justify-center px-3 py-1 z-[2] pl-8 pr-2">$10,000</div>
		</div>

		<button
			onclick={logout}
			class="text-[0.65rem] px-3 py-1 bg-[color:var(--color-primary)] text-[color:var(--color-bg)] rounded-md border-none cursor-pointer"
		>
			Logout
		</button>
	</div>
</header>