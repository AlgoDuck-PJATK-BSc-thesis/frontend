<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrameSimple from '$lib/Components/PixelFrames/PixelFrameSimple.svelte';
	import { ui } from '$lib/stores/ui.svelte';

	let username = 'OrbitOwl';
	let email = 'orbitowl@gmail.com';
	let currentPassword = '';
	let newPassword = '';
	let twoFactor = false;
	let emailNotifs = true;
	let pushNotifs = false;
	let displayLanguage: 'en' | 'pl' = 'en';
	let showSaved2FA = false;
	let showSavedEmailNotifs = false;
	let showSavedPushNotifs = false;
	let showSavedProfile = false;
	let showSavedLanguage = false;
	let showSavedPassword = false;
	let showSavedAll = false;

	function logout() {
		const confirmed = confirm('Are you sure you want to log out?');

		if (confirmed) {
			window.location.href = 'http://localhost:5173';
		}
	}

	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		el?.scrollIntoView({ behavior: 'smooth' });
	};

	function saveProfile() {
		showSavedProfile = true;
		setTimeout(() => (showSavedProfile = false), 1000);
	}

	function saveLanguage() {
		showSavedLanguage = true;
		setTimeout(() => (showSavedLanguage = false), 1000);
	}

	function savePassword() {
		showSavedPassword = true;
		setTimeout(() => (showSavedPassword = false), 1000);
	}

	function save2FA() {
		showSaved2FA = true;
		setTimeout(() => (showSaved2FA = false), 1000);
	}

	function saveEmailNotifs() {
		showSavedEmailNotifs = true;
		setTimeout(() => (showSavedEmailNotifs = false), 1000);
	}

	function savePushNotifs() {
		showSavedPushNotifs = true;
		setTimeout(() => (showSavedPushNotifs = false), 1000);
	}

	function saveAll() {
		saveProfile();
		saveLanguage();
		savePassword();
		save2FA();
		saveEmailNotifs();
		savePushNotifs();

		showSavedAll = true;
		setTimeout(() => (showSavedAll = false), 1200);
	}
</script>

<svelte:head>
	<title>Settings - AlgoDuck</title>
</svelte:head>

<section
	class="mt-2 mr-30 flex h-[calc(100vh-5rem)] justify-center gap-10 overflow-hidden px-12 pt-7"
>
	<div class="flex w-30 flex-shrink-0 flex-col overflow-auto"></div>

	<div class="flex h-full flex-[0.5] flex-col justify-between gap-5 overflow-y-auto">
		<div class="flex flex-col gap-5 overflow-y-auto pb-4">
			{#if ui.mode === 'retro'}
				<div class="mr-10 text-center">
					<h2
						class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
					>
						Settings
					</h2>
				</div>
			{:else}
				<div class="mr-10 text-center">
					<h2
						class="text-6xl font-semibold tracking-wide text-[color:var(--color-primary)] drop-shadow-[0_8px_25px_rgba(0,0,0,0.05)]"
					>
						Settings
					</h2>
				</div>
			{/if}

			{#if ui.mode === 'retro'}
				<PixelFrameSimple
					id="language"
					className="flex flex-col gap-4 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-6 w-full max-w-md mx-auto"
				>
					<h2 class="mb-4 text-lg font-normal text-[color:var(--color-text)]">Display Language</h2>

					<div class="mb-2 flex gap-4 text-sm text-[color:var(--color-text)]">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="displayLanguage"
								value="en"
								bind:group={displayLanguage}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							English
						</label>

						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="displayLanguage"
								value="pl"
								bind:group={displayLanguage}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Polish
						</label>
					</div>
				</PixelFrameSimple>
			{:else}
				<div
					id="language"
					class="mx-auto flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-[color:var(--color-bg)] p-6 text-[color:var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl"
				>
					<h2 class="mb-4 text-lg font-normal text-[color:var(--color-text)]">Display Language</h2>

					<div class="mb-2 flex gap-4 text-sm text-[color:var(--color-text)]">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="displayLanguage"
								value="en"
								bind:group={displayLanguage}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-bg)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-bg)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							English
						</label>

						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="displayLanguage"
								value="pl"
								bind:group={displayLanguage}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-bg)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-bg)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Polish
						</label>
					</div>
				</div>
			{/if}

			{#if ui.mode === 'retro'}
				<PixelFrameSimple
					id="ui-style"
					className="flex flex-col gap-4 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-6 w-full max-w-md mx-auto"
				>
					<h2 class="mb-4 text-lg font-normal text-[color:var(--color-text)]">
						User Interface Style
					</h2>

					<div class="mb-2 flex gap-4 text-sm text-[color:var(--color-text)]">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="uiMode"
								value="retro"
								bind:group={ui.mode}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Retro
						</label>

						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="uiMode"
								value="modern"
								bind:group={ui.mode}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Modern
						</label>
					</div>
				</PixelFrameSimple>
			{:else}
				<div
					id="ui-style"
					class="mx-auto flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-[color:var(--color-bg)] p-6 text-[color:var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl"
				>
					<h2 class="mb-4 text-lg font-normal text-[color:var(--color-text)]">
						User Interface Style
					</h2>

					<div class="mb-2 flex gap-4 text-sm text-[color:var(--color-text)]">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="uiMode"
								value="retro"
								bind:group={ui.mode}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-bg)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-bg)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Retro
						</label>

						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="uiMode"
								value="modern"
								bind:group={ui.mode}
								class="peer hidden"
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-bg)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-bg)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Modern
						</label>
					</div>
				</div>
			{/if}

			{#if ui.mode === 'retro'}
				<PixelFrameSimple
					id="profile"
					className="flex flex-col gap-5 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-6 w-full max-w-md mx-auto"
				>
					<h2 class="mb-3 text-lg font-normal text-[color:var(--color-text)]">
						Profile Information
					</h2>

					<label class="mb-3 flex flex-col text-sm text-[color:var(--color-text)]">
						<span class="mb-3">Username:</span>
						<input
							bind:value={username}
							type="text"
							class="font-body w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
						/>
					</label>

					<label class="mb-3 flex flex-col text-sm text-[color:var(--color-text)]">
						<span class="mb-3">E-mail:</span>
						<input
							bind:value={email}
							type="email"
							class="font-body w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
						/>
					</label>
				</PixelFrameSimple>
			{:else}
				<div
					id="profile"
					class="mx-auto flex w-full max-w-md flex-col gap-5 rounded-3xl border border-white/10 bg-[color:var(--color-bg)] p-6 text-[color:var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl"
				>
					<h2 class="mb-3 text-lg font-normal text-[color:var(--color-text)]">
						Profile Information
					</h2>

					<label class="mb-3 flex flex-col text-sm text-[color:var(--color-text)]">
						<span class="mb-3">Username:</span>
						<input
							bind:value={username}
							type="text"
							class="font-body w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
						/>
					</label>

					<label class="mb-3 flex flex-col text-sm text-[color:var(--color-text)]">
						<span class="mb-3">E-mail:</span>
						<input
							bind:value={email}
							type="email"
							class="font-body w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
						/>
					</label>
				</div>
			{/if}

			{#if ui.mode === 'retro'}
				<PixelFrameSimple
					id="password"
					className="flex flex-col gap-6 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-6 w-full max-w-md mx-auto"
				>
					<h2 class="text-normal mb-3 text-lg text-[color:var(--color-text)]">Password Settings</h2>

					<label class="flex flex-col text-sm text-[color:var(--color-text)]">
						<span class="mb-3"> Current password: </span>
						<input
							type="password"
							placeholder="********"
							bind:value={currentPassword}
							class="font-body mb-3 w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
						/>
					</label>
					<label class="flex flex-col text-xs text-[color:var(--color-text)]">
						<span class="mb-3"> New password: </span>
						<input
							type="password"
							placeholder="********"
							bind:value={newPassword}
							class="font-body mb-3 w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
						/>
					</label>
				</PixelFrameSimple>
			{:else}
				<div
					id="password"
					class="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-[color:var(--color-bg)] p-6 text-[color:var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl"
				>
					<h2 class="text-normal mb-3 text-lg text-[color:var(--color-text)]">Password Settings</h2>

					<label class="flex flex-col text-sm text-[color:var(--color-text)]">
						<span class="mb-3"> Current password: </span>
						<input
							type="password"
							placeholder="********"
							bind:value={currentPassword}
							class="font-body mb-3 w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
						/>
					</label>
					<label class="flex flex-col text-xs text-[color:var(--color-text)]">
						<span class="mb-3"> New password: </span>
						<input
							type="password"
							placeholder="********"
							bind:value={newPassword}
							class="font-body mb-3 w-full max-w-sm border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
						/>
					</label>
				</div>
			{/if}

			{#if ui.mode === 'retro'}
				<PixelFrameSimple
					id="2fa"
					className="flex flex-col gap-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-6 w-full max-w-md mx-auto"
				>
					<h2 class="mb-3 text-lg font-normal text-[color:var(--color-text)]">
						Two-Factor Authentication
					</h2>
					<div
						class="mb-3 flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
					>
						<span> Enable 2FA: </span>
						<input
							type="checkbox"
							bind:checked={twoFactor}
							class="h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[color:var(--color-accent-1)] bg-white transition-colors"
							style:background-color={twoFactor ? 'var(--color-primary)' : 'white'}
						/>
					</div>
					<p class="-mt-2 text-xs text-[color:var(--color-text)]">
						{twoFactor ? 'Enabled' : 'Disabled'}
					</p>
				</PixelFrameSimple>
			{:else}
				<div
					id="2fa"
					class="mx-auto flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-[color:var(--color-bg)] p-6 text-[color:var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl"
				>
					<h2 class="mb-3 text-lg font-normal text-[color:var(--color-text)]">
						Two-Factor Authentication
					</h2>
					<div
						class="mb-3 flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
					>
						<span> Enable 2FA: </span>
						<input
							type="checkbox"
							bind:checked={twoFactor}
							class="h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[color:var(--color-accent-1)] bg-white transition-colors"
							style:background-color={twoFactor ? 'var(--color-primary)' : 'white'}
						/>
					</div>
					<p class="-mt-2 text-xs text-[color:var(--color-text)]">
						{twoFactor ? 'Enabled' : 'Disabled'}
					</p>
				</div>
			{/if}

			{#if ui.mode === 'retro'}
				<PixelFrameSimple
					id="email"
					className="flex flex-col gap-6 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-6 w-full max-w-md mx-auto"
				>
					<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">
						Email Notifications
					</h2>
					<div
						class="mb-3 flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
					>
						<span> Receive updates: </span>
						<input
							type="checkbox"
							bind:checked={emailNotifs}
							class="h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[color:var(--color-accent-1)] bg-white transition-colors"
							style:background-color={emailNotifs ? 'var(--color-primary)' : 'white'}
						/>
					</div>
					<p class="-mt-2 text-xs text-[color:var(--color-text)]">
						{emailNotifs ? 'On' : 'Off'}
					</p>
				</PixelFrameSimple>
			{:else}
				<div
					id="email"
					class="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-[color:var(--color-bg)] p-6 text-[color:var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl"
				>
					<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">
						Email Notifications
					</h2>
					<div
						class="mb-3 flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
					>
						<span> Receive updates: </span>
						<input
							type="checkbox"
							bind:checked={emailNotifs}
							class="h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[color:var(--color-accent-1)] bg-white transition-colors"
							style:background-color={emailNotifs ? 'var(--color-primary)' : 'white'}
						/>
					</div>
					<p class="-mt-2 text-xs text-[color:var(--color-text)]">
						{emailNotifs ? 'On' : 'Off'}
					</p>
				</div>
			{/if}

			{#if ui.mode === 'retro'}
				<PixelFrameSimple
					id="push"
					className="flex flex-col gap-6 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-6 w-full max-w-md mx-auto"
				>
					<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">
						Push Notifications
					</h2>
					<div
						class="mb-3 flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
					>
						<span> Enable push: </span>
						<input
							type="checkbox"
							bind:checked={pushNotifs}
							class="h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[color:var(--color-accent-1)] bg-white transition-colors"
							style:background-color={pushNotifs ? 'var(--color-primary)' : 'white'}
						/>
					</div>
					<p class="-mt-2 text-xs text-[color:var(--color-text)]">
						{pushNotifs ? 'On' : 'Off'}
					</p>
				</PixelFrameSimple>
			{:else}
				<div
					id="push"
					class="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-[color:var(--color-bg)] p-6 text-[color:var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl"
				>
					<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">
						Push Notifications
					</h2>
					<div
						class="mb-3 flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
					>
						<span> Enable push: </span>
						<input
							type="checkbox"
							bind:checked={pushNotifs}
							class="h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[color:var(--color-accent-1)] bg-white transition-colors"
							style:background-color={pushNotifs ? 'var(--color-primary)' : 'white'}
						/>
					</div>
					<p class="-mt-2 text-xs text-[color:var(--color-text)]">
						{pushNotifs ? 'On' : 'Off'}
					</p>
				</div>
			{/if}
		</div>

		{#if ui.mode === 'retro'}
			<div id="logout" class="mt-4 flex w-full items-center justify-center gap-10">
				<Button
					size="big"
					label="Log Out"
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="1.2rem"
					labelFontWeight="normal"
					labelTracking="extra"
					labelClass=""
					onclick={logout}
				/>

				<Button
					size="big"
					label="Save All"
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="1.2rem"
					labelFontWeight="normal"
					labelTracking="extra"
					labelClass=""
					onclick={saveAll}
				/>
			</div>
		{:else}
			<div id="logout" class="mt-4 flex w-full items-center justify-center gap-18">
				<button
					type="button"
					onclick={logout}
					class="relative rounded-2xl bg-[color:var(--color-primary)] px-8 py-3 text-base
					font-semibold tracking-wide
					text-[color:var(--color-bg)]
					shadow-[0_18px_90px_rgba(0,0,0,0.10)]
					transition
					hover:brightness-90
					active:scale-95"
				>
					Log Out
				</button>

				<button
					type="button"
					onclick={saveAll}
					class="relative rounded-2xl bg-[color:var(--color-primary)] px-8 py-3 text-base
					font-semibold tracking-wide
					text-[color:var(--color-bg)]
					shadow-[0_18px_90px_rgba(0,0,0,0.10)]
					transition
					hover:brightness-90
					active:scale-95"
				>
					Save All
				</button>
			</div>
		{/if}

		<div class="relative min-h-[1.5rem]">
			{#if showSavedAll}
				<p class="absolute right-0 text-sm text-[color:var(--color-text)]">All changes saved!</p>
			{/if}
		</div>
	</div>
</section>