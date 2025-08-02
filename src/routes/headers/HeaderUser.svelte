<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '../../Components/ThemeToggle.svelte';

	let currentLanguage = 'en';
	const toggleLanguage = () => {
		currentLanguage = currentLanguage === 'en' ? 'pl' : 'en';
	};

	const logout = () => {
		alert('Logging out...');
		window.location.href = 'http://localhost:5173';
	};
</script>

<div class="w-full overflow-x-auto">
	<header class="min-w-max flex justify-between items-center p-4 md:px-8 border-b-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-body sticky top-0 z-[100] gap-4">
		
		<div class="flex items-center gap-6 whitespace-nowrap">
			<a href="/home" class="text-[color:var(--color-primary)] text-base no-underline">BEETCODE</a>
			<div class="relative flex border-2 border-[color:var(--color-accent-1)] rounded-full text-[0.65rem] overflow-hidden">
				<div class="absolute top-[-25%] left-1/2 w-[2px] h-[150%] rotate-[30deg] bg-[color:var(--color-accent-1)] z-[1]"></div>
				<div class="flex-1 flex items-center justify-center px-3 py-1 z-[2] pl-4 pr-2">Lvl 10</div>
				<div class="flex-1 flex items-center justify-center px-3 py-1 z-[2] pl-8 pr-2">$10,000</div>
			</div>
		</div>
		
		<nav class="ml-6">
			<ul class="flex gap-6 list-none m-0 p-0 text-xs uppercase tracking-wider whitespace-nowrap">
				<li>
					<a
						href="/home"
						aria-current={$page.url.pathname === '/home' ? 'page' : undefined}
						class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
					>
						Home
					</a>
				</li>
				<li>
					<a
						href="/Categories"
						aria-current={$page.url.pathname === '/Categories' ? 'page' : undefined}
						class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
					>
						Problems
					</a>
				</li>
				<li>
					<a
						href="/cohort"
						aria-current={$page.url.pathname === '/cohort' ? 'page' : undefined}
						class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
					>
						Cohort
					</a>
				</li>
				<li>
					<a
						href="/contest"
						aria-current={$page.url.pathname === '/contest' ? 'page' : undefined}
						class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
					>
						Contest
					</a>
				</li>
				<li>
					<a
						href="/Shop"
						aria-current={$page.url.pathname === '/Shop' ? 'page' : undefined}
						class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
					>
						Shop
					</a>
				</li>
				<li>
					<a
						href="/leaderboard"
						aria-current={$page.url.pathname === '/leaderboard' ? 'page' : undefined}
						class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
					>
						Leaderboard
					</a>
				</li>
				<li>
					<a
						href="/settings"
						aria-current={$page.url.pathname === '/settings' ? 'page' : undefined}
						class="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] no-underline"
					>
						Settings
					</a>
				</li>

			</ul>
		</nav>

		<div class="flex items-center gap-4 whitespace-nowrap ml-6">
			
			<ThemeToggle />
			
			<button
				onclick={toggleLanguage}
				class="text-xl bg-transparent border-none cursor-pointer p-0 leading-none"
				aria-label="Toggle Language"
			>
				{currentLanguage === 'en' ? '🇺🇸' : '🇵🇱'}
			</button>

			<button
				onclick={logout}
				class="text-[0.65rem] px-3 py-1 bg-[color:var(--color-primary)] text-[color:var(--color-bg)] rounded-md border-none cursor-pointer"
			>
				Logout
			</button>
		</div>
	</header>
</div>