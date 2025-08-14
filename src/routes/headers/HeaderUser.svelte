<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '../../Components/LayoutComponents/ThemeToggle.svelte';
	import logoutButton from '$lib/images/logout.png';
	import coin from '$lib/images/coin.png';

	let coins = 5000;
	let level = 5;

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
	<header
		class="font-body sticky top-0 z-[100] flex min-w-max items-center justify-between gap-4 border-b-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-4 text-[color:var(--color-text)] md:px-8"
	>
		<div class="flex items-center gap-6 whitespace-nowrap">
			<a href="/home" class="text-lg text-[color:var(--color-accent-2)] no-underline"> BEETCODE</a>

			<div
				class="relative inline-flex items-center overflow-hidden rounded-full px-1 text-[0.85rem] tracking-widest"
			>
				<div
					class="pointer-events-none absolute inset-0 z-0 rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-bg-2)]"
				></div>

				<div
					class="relative z-10 ml-[-2px] rounded-full border border-[color:var(--color-primary)] bg-[color:var(--color-primary)] px-3 py-[0.2rem] text-[color:var(--color-bg-2)]"
					style="font-family: var(--font-ariw9500);"
				>
					LVL {level.toLocaleString()}
				</div>

				<div
					class="relative z-10 px-2 py-[0.2rem] text-[color:var(--color-primary)]"
					style="font-family: var(--font-ariw9500);"
				>
					{coins.toLocaleString()}
					<img src={coin} alt="coin" class="inline-block h-[1.5rem] w-[1.5rem] align-[-0.45em]" />
				</div>
			</div>
		</div>

		<nav class="ml-6">
			<ul class="m-0 flex list-none gap-6 p-0 tracking-wider whitespace-nowrap">
				<li>
					<a
						href="/home"
						aria-current={$page.url.pathname === '/home' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Home
					</a>
				</li>
				<li>
					<a
						href="/Categories"
						aria-current={$page.url.pathname === '/Categories' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Problems
					</a>
				</li>
				<li>
					<a
						href="/contest"
						aria-current={$page.url.pathname === '/contest' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Contest
					</a>
				</li>
				<li>
					<a
						href="/Shop"
						aria-current={$page.url.pathname === '/Shop' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Shop
					</a>
				</li>
				<li>
					<a
						href="/cohort"
						aria-current={$page.url.pathname === '/cohort' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Cohort
					</a>
				</li>
				<li>
					<a
						href="/leaderboard"
						aria-current={$page.url.pathname === '/leaderboard' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Leaderboard
					</a>
				</li>
				<li>
					<a
						href="/settings"
						aria-current={$page.url.pathname === '/settings' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Settings
					</a>
				</li>
			</ul>
		</nav>

		<div class="ml-6 flex items-center gap-4 whitespace-nowrap">
			<ThemeToggle />

			<!-- <button
				onclick={toggleLanguage}
				class="text-2xl bg-transparent border-none cursor-pointer p-0 leading-none"
				aria-label="Toggle Language"
			>
				{currentLanguage === 'en' ? '🇺🇸' : '🇵🇱'}
			</button> -->

			<button onclick={logout} class=" cursor-pointer px-2" aria-label="Logout">
				<img src={logoutButton} alt="Logout" class="inline-block h-7 w-7" />
			</button>
		</div>
	</header>
</div>
