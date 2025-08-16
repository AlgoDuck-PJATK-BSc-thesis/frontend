<script lang="ts">
	import Button from '../../Components/ButtonComponents/Button.svelte';

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
	<title>Settings – Beetcode</title>
</svelte:head>

<section class="flex h-[calc(100vh-6rem)] justify-center gap-14 overflow-hidden p-10">
	<div class="flex w-66 flex-shrink-0 flex-col gap-2">
		<!-- <h2
			class="mt-2 mb-6 ml-2 text-6xl font-bold text-[color:var(--color-primary)]"
			style="font-family: var(--font-ariw9500);"
		>
			Settings
		</h2> -->

		<div
			class="h-[70vh] w-74 flex-shrink-0 overflow-y-auto rounded-lg border-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-4"
		>
			<ul>
				<li class="mt-2 ml-3 text-xl font-semibold text-[color:var(--color-accent-2)]">
					Personal Details
				</li>

				<li>
					<button
						onclick={() => scrollTo('language')}
						class="ml-3 block w-full rounded p-2 text-left text-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Display Language
					</button>
				</li>

				<li>
					<button
						onclick={() => scrollTo('profile')}
						class="ml-3 block w-full rounded p-2 text-left text-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Profile Information
					</button>
				</li>

				<li class="mt-8 ml-3 text-xl font-semibold text-[color:var(--color-accent-2)]">Security</li>

				<li>
					<button
						onclick={() => scrollTo('password')}
						class="ml-3 block w-full rounded p-2 text-left text-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Password Settings
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollTo('2fa')}
						class="ml-3 block w-full rounded p-2 text-left text-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Two-Factor Authentication
					</button>
				</li>

				<li class="mt-8 ml-3 text-xl font-semibold text-[color:var(--color-accent-2)]">
					Notifications
				</li>

				<li>
					<button
						onclick={() => scrollTo('email')}
						class="ml-3 block w-full rounded p-2 text-left text-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Email Notifications
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollTo('push')}
						class="ml-3 block w-full rounded p-2 text-left text-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)]"
					>
						Push Notifications
					</button>
				</li>
			</ul>
		</div>
	</div>

	<div class="flex h-full flex-[0.5] flex-col justify-between gap-5 overflow-y-auto pr-4">
		<div class="flex flex-col gap-5 overflow-y-auto pr-1 pb-4">
			<div
				id="language"
				class="flex flex-col gap-4 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-3))] p-4"
			>
				<h2 class="text-lg font-normal text-[color:var(--color-text)]">Display Language</h2>

				<div class="flex gap-4 text-sm text-[color:var(--color-text)]">
					<label class="flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							name="displayLanguage"
							value="en"
							bind:group={displayLanguage}
							class="peer hidden"
						/>
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-tile)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-tile)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
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
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-tile)] transition-colors after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-tile)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
						></div>
						Polish
					</label>
				</div>
			</div>

			<div
				id="profile"
				class="flex flex-col gap-5 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-3))] p-4"
			>
				<h2 class="text-lg font-normal text-[color:var(--color-text)]">Profile Information</h2>

				<label class="flex flex-col text-sm text-[color:var(--color-text)]">
					<span class="mb-1">Username:</span>
					<input
						bind:value={username}
						type="text"
						class="font-body border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
					/>
				</label>

				<label class="flex flex-col text-sm text-[color:var(--color-text)]">
					<span class="mb-1">E-mail:</span>
					<input
						bind:value={email}
						type="email"
						class="font-body border-2 border-[color:var(--color-accent-1)] bg-white p-1 text-sm text-black"
					/>
				</label>
			</div>

			<div
				id="password"
				class="flex flex-col gap-6 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-3))] p-4"
			>
				<h2 class="text-normal text-lg text-[color:var(--color-text)]">Password Settings</h2>

				<label class="flex flex-col text-sm text-[color:var(--color-text)]">
					<span class="mb-[0.2rem]"> Current password: </span>
					<input
						type="password"
						placeholder="********"
						bind:value={currentPassword}
						class="font-body border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
					/>
				</label>
				<label class="flex flex-col text-xs text-[color:var(--color-text)]">
					<span class="mb-[0.2rem]"> New password: </span>
					<input
						type="password"
						placeholder="********"
						bind:value={newPassword}
						class="font-body border-2 border-[color:var(--color-accent-1)] bg-white p-[0.3rem] text-xs text-black"
					/>
				</label>
			</div>

			<div
				id="2fa"
				class="flex flex-col gap-4 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-3))] p-4"
			>
				<h2 class="text-lg font-normal text-[color:var(--color-text)]">
					Two-Factor Authentication
				</h2>
				<div
					class="flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
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

			<div
				id="email"
				class="flex flex-col gap-6 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-3))] p-4"
			>
				<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">Email Notifications</h2>
				<div
					class="flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
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

			<div
				id="push"
				class="flex flex-col gap-6 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-3))] p-4"
			>
				<h2 class="mb-1 text-lg font-normal text-[color:var(--color-text)]">Push Notifications</h2>
				<div
					class="flex flex-row items-center justify-between text-sm text-[color:var(--color-text)]"
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
		</div>
		<div id="logout" class="mt-2 flex w-full items-center justify-between gap-4">
			<Button
				size="small"
				label="Log Out"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1rem"
				labelFontFamily="var(--font-ariw9500)"
				labelFontWeight="normal"
				onclick={logout}
			/>

			<Button
				size="small"
				label="Save"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1rem"
				labelFontFamily="var(--font-ariw9500)"
				labelFontWeight="normal"
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
