<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ThemeToggle from '$lib/Components/LayoutComponents/ThemeToggles/ThemeToggle.svelte';
	import PixelFrameCoins from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameCoins.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import { authApi } from '$lib/api/auth';
	import { userApi, type UserLeaderboardEntryDto } from '$lib/api/user';
	import { onMount } from 'svelte';

	let coins = $state<number>(0);

	let myUserId = $state<string>('');
	let myAvatarUrl = $state<string>('');
	let avatarOverride = $state<string>('');

	const defaultAvatar = `Ducks/Outfits/duck-052b219a-ec0b-430a-a7db-95c5db35dfce.png`;
	const coinSrc = '/headers/coin.png';

	const normalizeToCloudfrontKey = (value: string): string => {
		const v = (value ?? '').toString().trim();
		if (!v) return '';
		if (v.startsWith('http://') || v.startsWith('https://')) {
			try {
				const u = new URL(v);
				const p = (u.pathname ?? '').replace(/^\/+/, '').trim();
				return p || '';
			} catch {
				return '';
			}
		}
		return v;
	};

	const refreshHeaderStats = async () => {
		try {
			const s = await userApi.getMyStatistics(fetch);
			if (typeof s.coins === 'number') coins = s.coins;
		} catch {}
	};

	const tryResolveAvatarFromLeaderboard = async () => {
		if (!myUserId) return;
		try {
			const all = await userApi.getGlobalLeaderboardAll(fetch);
			const hit = all.find((x: UserLeaderboardEntryDto) => x.userId === myUserId);
			const url = (hit?.userAvatarUrl ?? '').toString().trim();
			if (url) avatarOverride = url;
		} catch {}
	};

	const refreshMe = async () => {
		try {
			const me = await userApi.getMe(fetch);

			myUserId = (me.userId ?? '').toString().trim();

			const s3 = (me.s3AvatarUrl ?? '').toString().trim();
			const u = (me.userAvatarUrl ?? '').toString().trim();

			myAvatarUrl = s3 || u || '';

			if (!myAvatarUrl) {
				avatarOverride = '';
				await tryResolveAvatarFromLeaderboard();
			}
		} catch {
			myUserId = '';
			myAvatarUrl = '';
			avatarOverride = '';
		}
	};

	const logout = async () => {
		try {
			await authApi.logout(fetch);
		} finally {
			await goto('/login');
		}
	};

	const goShop = async () => {
		await goto('/Shop');
	};

	const onKey = async (e: KeyboardEvent, fn: () => Promise<void>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			await fn();
		}
	};

	onMount(async () => {
		await Promise.all([refreshHeaderStats(), refreshMe()]);
	});
</script>

<header
	class="font-body sticky top-0 z-50 flex h-16 items-center justify-between border-b-4 border-[color:var(--color-bg-header-border)] bg-[color:var(--color-header-user)] px-8 py-4 text-[color:var(--color-landingpage-subtitle)]"
>
	<div class="flex items-center gap-6 whitespace-nowrap">
		<a href="/home" class="text-lg font-semibold text-[color:var(--color-primary)] no-underline"
			>AlgoDuck</a
		>
		<div>
			<PixelFrameCoins
				className="bg-[color:var(--color-background-coins-header)] relative inline-flex min-w-[9rem] items-center px-1 text-[1rem] tracking-widest"
			>
				<div
					class="relative z-10 inline-flex items-center justify-center py-[0.2rem] pr-3 pl-2 font-bold whitespace-nowrap text-[color:var(--color-landingpage-subtitle)]"
					role="button"
					tabindex="0"
					aria-label="Open shop"
					onclick={goShop}
					onkeydown={(e) => onKey(e, goShop)}
				>
					<span class="mr-1">{coins.toLocaleString()}</span>
					<img
						src={coinSrc}
						alt="coin"
						class="mr-1 inline-block h-[1.2rem] w-[1.2rem] shrink-0 align-[-0.2em]"
					/>
				</div>
			</PixelFrameCoins>
		</div>
	</div>

	<nav class="mr-6 ml-6 overflow-y-auto">
		<ul
			class="mr-4 flex list-none items-center gap-6 font-semibold tracking-wider whitespace-nowrap"
		>
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
					aria-current={page.url.pathname === '/categories' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Problems
				</a>
			</li>
			<li>
				<a
					href="/learn"
					aria-current={page.url.pathname === '/learn' ? 'page' : undefined}
					class="text-[color:var(--color-landingpage-subtitle)] no-underline hover:text-[color:var(--color-primary)]"
				>
					Learn
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

			<li>
				<a
					href="/user/me"
					aria-label="Profile"
					aria-current={page.url.pathname.startsWith('/user') ? 'page' : undefined}
					class="no-underline"
				>
					<div
						class="h-10 w-10 overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
					>
						<CloudfrontImage
							path={normalizeToCloudfrontKey(
								(avatarOverride || myAvatarUrl || defaultAvatar).toString()
							) || defaultAvatar}
							cls="h-full w-full -translate-x-[-20%] -translate-y-[-15%] scale-[200%] object-cover object-[left_top]"
						/>
					</div>
				</a>
			</li>

			<li>
				<div class="relative w-16">
					<ThemeToggle />
				</div>
			</li>
		</ul>
	</nav>

	<div class="flex h-full flex-row items-center justify-center gap-2"></div>
</header>
