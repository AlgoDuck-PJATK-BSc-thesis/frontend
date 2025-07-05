<script lang="ts">
	let username = 'OrbitOwl';
	let email = 'orbitowl@gmail.com';
	let password = '';
	let twoFactor = false;
	let emailNotifs = true;
	let pushNotifs = false;
	let smsNotifs = true;
	let showSavedProfile = false;
	let showSavedContact = false;
	let showSavedPassword = false;

	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		el?.scrollIntoView({ behavior: 'smooth' });
	};

	function saveProfile() {
	showSavedProfile = true;
	setTimeout(() => (showSavedProfile = false), 1000);
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

<section class="flex justify-center gap-8 p-8 h-[calc(100vh-6rem)] overflow-hidden">
	
	<div class="w-64 h-[65vh] overflow-y-auto border-2 border-[color:var(--color-accent-1)] rounded-lg p-4 bg-[color:var(--color-tile)] text-xs flex-shrink-0">
		<ul>
			<li class="font-normal text-[color:var(--color-accent-2)] mt-8">Personal Details</li>
			<li><button onclick={() => scrollTo('profile')} class="block w-full text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] rounded">Profile Information</button></li>
			<li><button onclick={() => scrollTo('contact')} class="block w-full text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] rounded">Contact Details</button></li>

			<li class="font-normal text-[color:var(--color-accent-2)] mt-8">Notifications</li>
			<li><button onclick={() => scrollTo('email')} class="block w-full text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] rounded">Email Notifications</button></li>
			<li><button onclick={() => scrollTo('push')} class="block w-full text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] rounded">Push Notifications</button></li>
			<li><button onclick={() => scrollTo('sms')} class="block w-full text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] rounded">SMS Notifications</button></li>

			<li class="font-normal text-[color:var(--color-accent-2)] mt-8">Security</li>
			<li><button onclick={() => scrollTo('password')} class="block w-full text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] rounded">Password Settings</button></li>
			<li><button onclick={() => scrollTo('2fa')} class="block w-full text-left p-2 hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-bg)] rounded">Two-Factor Authentication</button></li>
		</ul>
	</div>

	<div class="flex flex-col gap-5 overflow-y-auto pr-4 pb-44 flex-[0.5]">
		
		<div id="profile" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-5">
			<h2 class="text-base font-normal text-[color:var(--color-accent-2)]">Profile Information</h2>
			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-1">Username:</span>
				<input
					bind:value={username}
					type="text"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-1 text-xs font-body text-black"
				/>
			</label>

			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-1">E-mail:</span>
				<input
					bind:value={email}
					type="email"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-1 text-xs font-body text-black"
				/>
			</label>
			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-1">Password:</span>
				<input
					bind:value={password}
					type="password"
					placeholder="**********"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-1 text-xs font-body"
				/>
			</label>
			<div class="flex justify-between items-center text-xs text-[color:var(--color-text)]">
				<span>Two factor authorization:</span>
				<input
					type="checkbox"
					bind:checked={twoFactor}
					class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
					style:background-color={twoFactor ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-xs text-[color:var(--color-text)] -mt-2">2FA: {twoFactor ? 'Enabled' : 'Disabled'}</p>
			<button
				onclick={saveProfile}
				class="self-end px-3 py-1 text-xs bg-[color:var(--color-primary)] text-black rounded font-body">Save
			</button>
			{#if showSavedProfile}
				<p class="text-[0.65rem] text-[color:var(--color-accent-2)] text-right mt-1">Changes saved!</p>
			{/if}
		</div>

		<div id="contact"class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6">
			<h2 class="text-base font-normal text-[color:var(--color-accent-2)]">Contact Details</h2>
			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-1">Phone:</span>
				<input
					type="text"
					placeholder="+48 123 456 789"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-1 text-xs font-body"
				/>
			</label>
			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-1">Address:</span>
				<input
					type="text"
					placeholder="Street 123, City"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-1 text-xs font-body"
				/>
			</label>
			<button
				onclick={saveContact}
				class="self-end px-3 py-1 text-xs bg-[color:var(--color-primary)] text-black rounded font-body">Save
			</button>
			{#if showSavedContact}
				<p class="text-[0.65rem] text-[color:var(--color-accent-2)] text-right mt-1">
					Changes saved!
				</p>
			{/if}
		</div>

		<div id="email" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6">
			<h2 class="text-base font-normal text-[color:var(--color-accent-2)] mb-1">Email Notifications</h2>
			<div class="flex flex-row justify-between items-center text-xs text-[color:var(--color-text)]">
				<span>Receive updates:</span>
				<input
				type="checkbox"
				bind:checked={emailNotifs}
				class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
				style:background-color={emailNotifs ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-[0.6rem] text-[color:var(--color-text)] -mt-2">
				Email notifications: {emailNotifs ? 'On' : 'Off'}
			</p>
		</div>


		<div id="push" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6">
			<h2 class="text-base font-normal text-[color:var(--color-accent-2)] mb-1">Push Notifications</h2>
			<div class="flex flex-row justify-between items-center text-xs text-[color:var(--color-text)]">
				<span>Enable push:</span>
				<input
				type="checkbox"
				bind:checked={pushNotifs}
				class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
				style:background-color={pushNotifs ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-[0.6rem] text-[color:var(--color-text)] -mt-2">
				Push notifications: {pushNotifs ? 'On' : 'Off'}
			</p>
		</div>

		<div id="sms" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6">
			<h2 class="text-base font-normal text-[color:var(--color-accent-2)] mb-1">SMS Notifications</h2>
			<div class="flex flex-row justify-between items-center text-xs text-[color:var(--color-text)]">
				<span>Receive alerts:</span>
				<input
				type="checkbox"
				bind:checked={smsNotifs}
				class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
				style:background-color={smsNotifs ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-[0.6rem] text-[color:var(--color-text)] -mt-2">
				SMS notifications: {smsNotifs ? 'On' : 'Off'}
			</p>
		</div>

		<div id="password" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-6">
			<h2 class="text-base text-[color:var(--color-accent-2)] text-normal">Password Settings</h2>
			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-[0.2rem]">Current password:</span>
				<input
					type="password"
					placeholder="********"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-[0.3rem] font-body text-xs"
				/>
			</label>
			<label class="flex flex-col text-xs text-[color:var(--color-text)]">
				<span class="mb-[0.2rem]">New password:</span>
				<input
					type="password"
					placeholder="********"
					class="bg-white border-2 border-[color:var(--color-accent-1)] p-[0.3rem] font-body text-xs"
				/>
			</label>
			<button
				onclick={savePassword}
				class="self-end px-[0.8rem] py-[0.3rem] bg-[color:var(--color-primary)] text-black text-[0.65rem] font-body rounded cursor-pointer border-none">Save
			</button>
			{#if showSavedPassword}
				<p class="text-[0.65rem] text-[color:var(--color-accent-2)] mt-[0.3rem] text-right">Changes saved!</p>
			{/if}
		</div>

		<div id="2fa" class="border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl flex flex-col gap-4">
			<h2 class="text-base font-normal text-[color:var(--color-accent-2)]">Two-Factor Authentication</h2>
			<p class="text-[0.7rem] text-[color:var(--color-text)]">
				Add extra layer of security to your account by enabling 2FA.
			</p>
			<div class="flex flex-row justify-between items-center text-xs text-[color:var(--color-text)]">
				<span>Enable 2FA</span>
				<input
				type="checkbox"
				bind:checked={twoFactor}
				class="w-5 h-5 appearance-none border-2 border-[color:var(--color-accent-1)] rounded bg-white cursor-pointer transition-colors"
				style:background-color={twoFactor ? 'var(--color-primary)' : 'white'}
				/>
			</div>
			<p class="text-[0.6rem] text-[color:var(--color-text)] -mt-2">
				2FA: {twoFactor ? 'Enabled' : 'Disabled'}
			</p>
		</div>

	</div>
</section>