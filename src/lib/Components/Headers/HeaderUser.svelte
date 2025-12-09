<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/Components/LayoutComponents/ThemeToggles/ThemeToggle.svelte';
	import coin from '$lib/images/headers/Coin.png';
	import { SupportedLangs, userThemePreference, type Lang } from '$lib/stores/theme.svelte';
	import DropDownSelect from '../GenericComponents/dropDownMenu/DropDownSelect.svelte';
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';

	let coins = 1000000;
	let level = 5;

	const logout = () => {
		alert('Logging out...');
		window.location.href = 'http://localhost:5173';
	};
</script>

<header
	class="font-body sticky top-0 z-50 flex h-16 items-center justify-between border-b-4 border-[color:var(--color-bg-header-border)] bg-[color:var(--color-header-user)] px-8 py-4 text-[color:var(--color-landingpage-subtitle)]"
>
	<div class="flex items-center gap-6 whitespace-nowrap">
		<a href="/home" class="text-lg font-semibold text-[color:var(--color-primary)] no-underline">
			AlgoDuck</a
		>
	</div>

	<nav class="ml-6">
		<ul class="mr-4 flex list-none gap-6 font-semibold tracking-wider whitespace-nowrap">
			<li>
				<a
					href="/home"
					aria-current={page.url.pathname === '/home' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Home
				</a>
			</li>
			<li>
				<a
					href="/categories"
					aria-current={page.url.pathname === '/Categories' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Problems
				</a>
			</li>
			<li>
				<a
					href="/cohort"
					aria-current={page.url.pathname === '/cohort' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Cohort
				</a>
			</li>

			<li>
				<a
					href="/contest"
					aria-current={page.url.pathname === '/contest' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Contest
				</a>
			</li>
			<li>
				<a
					href="/leaderboard"
					aria-current={page.url.pathname === '/leaderboard' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Leaderboard
				</a>
			</li>
			<li>
				<a
					href="/visualizer"
					aria-current={page.url.pathname === '/visualizer' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Visualizer
				</a>
			</li>
			<li>
				<a
					href="/studytimer"
					aria-current={page.url.pathname === '/studytimer' ? 'page' : undefined}
					class="tracking-tight text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Study Timer
				</a>
			</li>
			<li>
				<a
					href="/Shop"
					aria-current={page.url.pathname === '/Shop' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Shop
				</a>
			</li>
			<li>
				<a
					href="/settings"
					aria-current={page.url.pathname === '/settings' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Settings
				</a>
			</li>
			<!-- <div class=" relative mr-1 h-[1rem] w-[1rem] translate-y-[-0px]">
					<ThemeToggle />
				</div> -->
		</ul>
	</nav>

	<div class="flex h-full flex-row items-center justify-center gap-2">
		<div class="mr-2 flex flex-row items-center justify-between gap-4">
			<div class="relative w-18">
				<ThemeToggle />
			</div>

			<PixelFrameMini
				className="bg-[color:var(--color-accent-3)] relative inline-flex items-center px-1 text-[1rem] tracking-widest"
			>
				<div
					class="relative z-10 inline-flex items-center py-[0.2rem] pr-3 pl-2 font-bold whitespace-nowrap text-[color:var(--color-landingpage-subtitle)]"
				>
					<span class="mr-1">{coins.toLocaleString()}</span>
					<img
						src={coin}
						alt="coin"
						class="inline-block h-[1.2rem] w-[1.2rem] shrink-0 align-[-0.2em]"
					/>
				</div>
			</PixelFrameMini>
		</div>
		<!-- <div class="h-10 w-20">
			<DropDownSelect
				options={{
					options: SupportedLangs.map((l) => {
						return {
							key: l,
							value: l
						};
					}),
					onSelectCallback: (selected: Lang) => {
						userThemePreference.lang = selected;
					}
				}}
			/>
		</div> -->
	</div>
</header>
