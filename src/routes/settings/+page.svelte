<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';

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

<section class="mt-2 flex h-[calc(100vh-5rem)] mr-25 justify-center gap-10 overflow-hidden px-12 pt-7">
	<div class="flex w-60 flex-shrink-0 flex-col overflow-auto">
		<PixelFrame
			className="flex flex-col w-59 mt-8 gap-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-5 flex-shrink-0 "
		>
			<ul>
				<li class="mt-1 ml-3 text-xl font-bold text-[color:var(--color-accent-2)]">
					Personal Details
				</li>

				<li>
					<button
						onclick={() => scrollTo('language')}
						class="text-normal ml-3 block w-full rounded p-2 text-left text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Display Language
					</button>
				</li>

				<li>
					<button
						onclick={() => scrollTo('profile')}
						class="text-normal ml-3 block w-full rounded p-2 text-left text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Profile Information
					</button>
				</li>

				<li class="mt-4 ml-3 text-xl font-bold text-[color:var(--color-accent-2)]">Security</li>

				<li>
					<button
						onclick={() => scrollTo('password')}
						class="text-normal ml-3 block w-full rounded p-2 text-left text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Password Settings
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollTo('2fa')}
						class="text-normal ml-3 block w-full rounded p-2 text-left text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Two-Factor Authentication
					</button>
				</li>

				<li class="mt-4 ml-3 text-xl font-bold text-[color:var(--color-accent-2)]">
					Notifications
				</li>

				<li>
					<button
						onclick={() => scrollTo('email')}
						class="text-normal ml-3 block w-full rounded p-2 text-left text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Email Notifications
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollTo('push')}
						class="text-normal ml-3 block w-full rounded p-2 text-left text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Push Notifications
					</button>
				</li>
			</ul>
		</PixelFrame>
	</div>

	<div class="flex h-full flex-[0.5] flex-col justify-between gap-5 overflow-y-auto">
		<div class="flex flex-col gap-5 overflow-y-auto pb-4">
			<h2
				class="mt-2 mb-4 ml-6 text-6xl font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
				style="font-family: var(--font-ariw9500);"
			>
				Settings
			</h2>
			<PixelFrame
				id="language"
				className="flex flex-col gap-4 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-6"
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
			</PixelFrame>

			<PixelFrame
				id="profile"
				className="flex flex-col gap-5 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-6"
			>
				<h2 class="mb-3 text-lg font-normal text-[color:var(--color-text)]">Profile Information</h2>

				<label class="mb-3 flex flex-col text-sm text-[color:var(--color-text)]">
					<span class="mb-3">Username:</span>
					<input
						bind:value={username}
						type="text"
						class="font-body border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
					/>
				</label>

				<label class="mb-3 flex flex-col text-sm text-[color:var(--color-text)]">
					<span class="mb-3">E-mail:</span>
					<input
						bind:value={email}
						type="email"
						class="font-body border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
					/>
				</label>
			</PixelFrame>

			<PixelFrame
				id="password"
				className="flex flex-col gap-6 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-6"
			>
				<h2 class="text-normal mb-3 text-lg text-[color:var(--color-text)]">Password Settings</h2>

				<label class="flex flex-col text-sm text-[color:var(--color-text)]">
					<span class="mb-3"> Current password: </span>
					<input
						type="password"
						placeholder="********"
						bind:value={currentPassword}
						class="font-body mb-3 border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
					/>
				</label>
				<label class="flex flex-col text-xs text-[color:var(--color-text)]">
					<span class="mb-3"> New password: </span>
					<input
						type="password"
						placeholder="********"
						bind:value={newPassword}
						class="font-body mb-3 border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
					/>
				</label>
			</PixelFrame>

			<PixelFrame
				id="2fa"
				className="flex flex-col gap-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-6"
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
			</PixelFrame>

			<PixelFrame
				id="email"
				className="flex flex-col gap-6 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] p-6"
			>
				<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">Email Notifications</h2>
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
			</PixelFrame>

			<PixelFrame
				id="push"
				className="flex flex-col gap-6 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-6"
			>
				<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">Push Notifications</h2>
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
			</PixelFrame>
		</div>
		<div id="logout" class="flex w-full items-center mt-1 justify-between gap-4">
			<Button
				size="big"
				label="LOG OUT"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1.2rem"
				labelFontFamily="var(--font-lexenddeca)"
				labelFontWeight="bold"
				onclick={logout}
			/>

			<Button
				size="medium"
				label="SAVE"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1.2rem"
				labelFontFamily="var(--font-lexenddeca)"
				labelFontWeight="bold"
				onclick={saveAll}
			/>
		</div>
		<div class="relative min-h-[1.5rem]">
			{#if showSavedAll}
				<p class="absolute right-0 text-sm text-[color:var(--color-text)]">All changes saved!</p>
			{/if}
		</div>
	</div>
</section>
