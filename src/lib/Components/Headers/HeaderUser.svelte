<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/Components/ThemeToggle.svelte';
	import coin from '$lib/images/headers/Coin.png';
<<<<<<< Updated upstream:src/lib/Components/Headers/HeaderUser.svelte
	import { SupportedLangs, userThemePreference, type Lang } from '$lib/stores/theme.svelte';
	import DropDownSelect from '../GenericComponents/dropDownMenu/DropDownSelect.svelte';
=======
	import PixelFrameMini from '$lib/Components/PixelFrames/PixelFrameMini.svelte';
	import PixelFrame from '$lib/Components/PixelFrames/PixelFrame.svelte';
	import { ui } from '$lib/stores/ui.svelte';
>>>>>>> Stashed changes:src/routes/headers/HeaderUser.svelte

	let coins = 1000000;
	let level = 5;

	const logout = () => {
		alert('Logging out...');
		window.location.href = 'http://localhost:5173';
	};
</script>

<div class="w-full sticky top-0 overflow-x-auto">
	<header
<<<<<<< Updated upstream:src/lib/Components/Headers/HeaderUser.svelte
		class="font-body flex h-16 w-full items-center justify-between border-b-4 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] text-[color:var(--color-text)] md:px-8"
=======
		class="font-body sticky top-0 z-[100] flex h-16 min-w-max items-center justify-between gap-4 border-b-4 border-[color:var(--color-bg-header-border)] bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-4 text-[color:var(--color-text)] md:px-8"
>>>>>>> Stashed changes:src/routes/headers/HeaderUser.svelte
	>
		<div class="flex items-center gap-6 whitespace-nowrap">
			<a href="/home" class="text-lg font-semibold text-[color:var(--color-accent-2)] no-underline">
				AlgoDuck</a
			>
		</div>

		<nav class="ml-6">
			<ul class="mr-20 flex list-none gap-6 font-semibold tracking-wider whitespace-nowrap">
				<li>
					<a
						href="/home"
						aria-current={page.url.pathname === '/home' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Home
					</a>
				</li>
				<li>
					<a
						href="/categories"
						aria-current={page.url.pathname === '/Categories' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Problems
					</a>
				</li>
				<li>
					<a
						href="/cohort"
						aria-current={page.url.pathname === '/cohort' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Cohort
					</a>
				</li>

				<li>
					<a
						href="/contest"
						aria-current={page.url.pathname === '/contest' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Contest
					</a>
				</li>
				<li>
					<a
						href="/leaderboard"
						aria-current={page.url.pathname === '/leaderboard' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Leaderboard
					</a>
				</li>
				<li>
					<a
						href="/studytimer"
						aria-current={page.url.pathname === '/studytimer' ? 'page' : undefined}
						class="tracking-tight text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Study Timer
					</a>
				</li>
				<li>
					<a
						href="/Shop"
						aria-current={page.url.pathname === '/Shop' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Shop
					</a>
				</li>
				<li>
					<a
						href="/settings"
						aria-current={page.url.pathname === '/settings' ? 'page' : undefined}
						class="text-[color:var(--color-text)] no-underline hover:text-[color:var(--color-primary)]"
					>
						Settings
					</a>
				</li>
				<!-- <div class=" relative mr-1 h-[1rem] w-[1rem] translate-y-[-0px]">
					<ThemeToggle />
				</div> -->
			</ul>
		</nav>

<<<<<<< Updated upstream:src/lib/Components/Headers/HeaderUser.svelte
		<div class="flex h-full flex-row justify-center gap-3 items-center">
			<div class="w-15">
				<ThemeToggle />
			</div>
			<div class="w-24 h-8">
				<DropDownSelect options={{
					options: SupportedLangs.map(l => {
						return {
							key: l,
							value: l
						}
					}),
					onSelectCallback: (selected: Lang) => {
						userThemePreference.lang = selected
					}
				}}/>
			</div>
=======
		<div class="mr-2 flex items-center justify-between gap-20">
			<div class="relative h-[1rem] w-[1rem] translate-y-[-4px]">
				<ThemeToggle />
			</div>

			<PixelFrameMini
				className="bg-[color:var(--color-bg)] relative inline-flex items-center px-1 text-[1rem] tracking-widest"
			>
				<div class="relative z-10 px-2 py-[0.2rem] font-bold text-[color:var(--color-accent-2)]">
					{coins.toLocaleString()}
					<img src={coin} alt="coin" class="inline-block h-[1.2rem] w-[1.2rem] align-[-0.2em]" />
				</div>
			</PixelFrameMini>
>>>>>>> Stashed changes:src/routes/headers/HeaderUser.svelte
		</div>
	</header>
</div>