<script lang="ts">

	let username = 'OrbitOwl';
	let email = 'orbitowl@gmail.com';
	let currentPassword = '';
	let newPassword = '';
	let smsNumber = '';
	let twoFactor = false;
	let emailNotifs = true;
	let pushNotifs = false;
	let smsNotifs = true;
	let showSavedProfile = false;
	let showSavedLanguage = false;
	let showSavedContact = false;
	let showSavedPassword = false;
	let displayLanguage: 'en' | 'pl' = 'en';

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

	function saveContact() {
		showSavedContact = true;
		setTimeout(() => (showSavedContact = false), 1000);
	}

	function savePassword() {
		showSavedPassword = true;
		setTimeout(() => (showSavedPassword = false), 1000);
	}

</script>

<svelte:head>
	<title>Settings – Beetcode</title>
</svelte:head>

<section class="flex justify-center gap-14 p-10 h-[calc(100vh-4rem)] overflow-hidden">

	<div class="flex flex-col gap-2 w-66 flex-shrink-0">

  		<h2 
		class="font-bold text-5xl text-[color:var(--color-primary)] mt-2 mb-6 text-center"
		style="font-family: var(--font-ariw9500);"
		>
		Settings
		</h2>

		<div 
		class="w-74 h-[57vh] overflow-y-auto border-2 border-[color:var(--color-accent-1)] rounded-lg p-4 bg-[color:var(--color-tile)]  flex-shrink-0"
		
		>
			<ul>
				<li 
				class="font-bold text-xl text-[color:var(--color-accent-2)] mt-2"
				>
				Personal Details
				</li>

				<li>
					<button onclick={() => scrollTo('profile')} 
						class="block w-full text-[color:var(--color-accent-2)] text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-tile)] rounded"
						>
						Profile Information
					</button>
				</li>

				<li>
					<button onclick={() => scrollTo('language')} 
						class="block w-full text-[color:var(--color-accent-2)] text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-tile)] rounded"
						>
						Display Language
					</button>
				</li>

				<li class="font-bold text-xl text-[color:var(--color-accent-2)] mt-8">Security
				</li>
				
				<li>
					<button onclick={() => scrollTo('password')} 
						class="block w-full text-[color:var(--color-accent-2)] text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-tile)] rounded"
						>
						Password Settings
					</button>
				</li>
				<li>
					<button onclick={() => scrollTo('2fa')} 
						class="block w-full text-[color:var(--color-accent-2)] text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-tile)] rounded"
						>
						Two-Factor Authentication
					</button>
				</li>

				<li class="font-bold text-xl text-[color:var(--color-accent-2)] mt-8"
				>
				Notifications
				</li>

				<li>
					<button onclick={() => scrollTo('email')} class="block w-full text-[color:var(--color-accent-2)] text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-tile)] rounded"
						>
						Email Notifications
					</button>
				</li>
				<li>
					<button onclick={() => scrollTo('push')} class="block w-full text-[color:var(--color-accent-2)] text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-tile)] rounded"
						>
						Push Notifications
					</button>
				</li>

			</ul>
		</div> 
    </div>

	
	<div class="flex flex-col gap-5 overflow-y-auto pr-4 flex-[0.5]"
	
	>
		<div id="profile" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-5"
		>
			<h2 class="text-lg font-normal text-[color:var(--color-accent-2)]"
			>
				Profile Information
			</h2>

			<label class="flex flex-col text-sm text-[color:var(--color-text)]"
			>
				<span class="mb-1">Username:</span>
				<input
					bind:value={username}
					type="text"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-1 text-sm font-body text-black"
				/>
			</label>

			<label class="flex flex-col text-sm text-[color:var(--color-text)]">
				<span class="mb-1">E-mail:</span>
				<input
					bind:value={email}
					type="email"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-1 text-sm font-body text-black"
				/>
			</label>

			<button
				onclick={saveProfile}
				class="self-end px-3 py-1 text-xs bg-[color:var(--color-primary)] text-[color:var(--color-tile)] rounded font-body">Save
			</button>
			{#if showSavedProfile}
				<p class="text-[0.75rem] text-[color:var(--color-accent-2)] text-right mt-1">Changes saved!</p>
			{/if}
		</div>

		<div id="language" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-4"
		>
			<h2 class="text-lg font-normal text-[color:var(--color-accent-2)]"
			>
			Display Language
			</h2>

			<div class="flex gap-4 text-sm text-[color:var(--color-text)]">
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						name="displayLanguage"
						value="en"
						bind:group={displayLanguage}
						class="hidden peer"
					/>
					<div class="w-4 h-4 rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-tile)] flex items-center justify-center peer-checked:after:bg-[color:var(--color-primary)] after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-[color:var(--color-tile)] transition-colors"
					></div>
					English
				</label>

				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						name="displayLanguage"
						value="pl"
						bind:group={displayLanguage}
						class="hidden peer"
					/>
					<div class="w-4 h-4 rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-tile)] flex items-center justify-center peer-checked:after:bg-[color:var(--color-primary)] after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-[color:var(--color-tile)] transition-colors"
					></div>
					Polish
				</label>
			</div>

			<button
				onclick={saveLanguage}
				class="self-end px-3 py-1 text-xs bg-[color:var(--color-primary)] text-[color:var(--color-tile)] rounded font-body"
			>
				Save
			</button>

			{#if showSavedLanguage}
				<p class="text-[0.75rem] text-[color:var(--color-accent-2)] text-right mt-1"
				>
				Changes saved!
				</p>
			{/if}
		</div>

		<div id="password" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6"
		>
			<h2 class="text-lg text-[color:var(--color-accent-2)] text-normal"
			>
			Password Settings
			</h2>

			<label class="flex flex-col text-sm text-[color:var(--color-text)]">
				<span class="mb-[0.2rem]"
				>
				Current password:
				</span> 
				<input
					type="password"
					placeholder="********"
					bind:value={currentPassword}
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-[0.3rem] text-black font-body text-xs"
				/>
			</label>
			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-[0.2rem]"
				>
				New password:
				</span>
				<input
					type="password"
					placeholder="********"
					bind:value={newPassword}
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-[0.3rem] text-black font-body text-xs"
				/>
			</label>
			<button
				onclick={savePassword}
				class="self-end px-[0.8rem] py-[0.3rem] bg-[color:var(--color-primary)] text-[color:var(--color-tile)] text-xs font-body rounded cursor-pointer border-none"
				>
				Save
			</button>
			{#if showSavedPassword}
				<p class="text-[0.75rem] text-[color:var(--color-accent-2)] mt-[0.3rem] text-right"
				>
					Changes saved!
				</p>
			{/if}
		</div>

		<div id="2fa" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-4"
		>
			<h2 class="text-lg font-normal text-[color:var(--color-accent-2)]"
			>
				Two-Factor Authentication

			</h2>
			<div class="flex flex-row justify-between items-center text-sm text-[color:var(--color-text)]">
				<span>
					Enable 2FA:
				</span>
				<input
					type="checkbox"
					bind:checked={twoFactor}
					class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
					style:background-color={twoFactor ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-xs text-[color:var(--color-text)] -mt-2">
				{twoFactor ? 'Enabled' : 'Disabled'}
			</p>
		</div>

		<div id="email" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6"
		>
			<h2 class="text-lg font-normal text-[color:var(--color-accent-2)] mb-1"
			>
				Email Notifications
			</h2>
			<div class="flex flex-row justify-between items-center text-sm text-[color:var(--color-text)]"
			>
				<span>
					Receive updates:

				</span>
				<input
					type="checkbox"
					bind:checked={emailNotifs}
					class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
					style:background-color={emailNotifs ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-xs text-[color:var(--color-text)] -mt-2">
				{emailNotifs ? 'On' : 'Off'}
			</p>
		</div>

		<div id="push" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6">
			<h2 class="text-lg font-normal text-[color:var(--color-accent-2)] mb-1"
			>
				Push Notifications

			</h2>
			<div class="flex flex-row justify-between items-center text-sm text-[color:var(--color-text)]">
				<span>
					Enable push:

				</span>
				<input
					type="checkbox"
					bind:checked={pushNotifs}
					class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
					style:background-color={pushNotifs ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-xs text-[color:var(--color-text)] -mt-2">
				{pushNotifs ? 'On' : 'Off'}
			</p>
		</div>

	</div>
</section>