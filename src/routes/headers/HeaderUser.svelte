<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '../components/ThemeToggle.svelte';

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
						class={`no-underline ${
							$page.url.pathname === '/home' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
						} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
					>
						Home
					</a>
				</li>
				<li>
					<a
						href="/Categories"
						class={`no-underline ${
							$page.url.pathname === '/Categories' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
						} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
					>
						Problems
					</a>
				</li>
				<li>
					<a
						href="/cohort"
						class={`no-underline ${
							$page.url.pathname === '/cohort' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
						} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
					>
						Cohort
					</a>
				</li>
				<li>
					<a
						href="/contest"
						class={`no-underline ${
							$page.url.pathname === '/contest' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
						} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
					>
						Contest
					</a>
				</li>
				<li>
					<a
						href="/store"
						class={`no-underline ${
							$page.url.pathname === '/store' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
						} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
					>
						Store
					</a>
				</li>
				<li>
					<a
						href="/leaderboard"
						class={`no-underline ${
							$page.url.pathname === '/leaderboard' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
						} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
					>
						Leaderboard
					</a>
				</li>
				<li>
					<a
						href="/settings"
						class={`no-underline ${
							$page.url.pathname === '/settings' ? 'border-b-2 border-[color:var(--color-primary)]' : ''
						} text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]`}
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