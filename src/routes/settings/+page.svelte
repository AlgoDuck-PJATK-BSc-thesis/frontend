<script lang="ts">
	let username = 'OrbitOwl';
	let email = 'orbitowl@gmail.com';
	let password = '';
	let twoFactor = false;
	let darkMode = true;
	let tutorialMode = false;
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

<section class="settings">
	<div class="sidebar">
		<ul>
			<li class="group">Personal Details</li>
			<li><button onclick={() => scrollTo('profile')}>Profile</button></li>
			<li><button onclick={() => scrollTo('contact')}>Contact</button></li>

			<li class="group">Notifications</li>
			<li><button onclick={() => scrollTo('email')}>Email Notifications</button></li>
			<li><button onclick={() => scrollTo('push')}>Push Notifications</button></li>
			<li><button onclick={() => scrollTo('sms')}>SMS Notifications</button></li>

			<li class="group">Security</li>
			<li><button onclick={() => scrollTo('password')}>Password Settings</button></li>
			<li><button onclick={() => scrollTo('2fa')}>Two-Factor Authentication</button></li>
		</ul>
	</div>

	<div class="main">
		<div class="panel" id="profile">
			<h2>Profile Information</h2>
			<label>
				<span>Username:</span>
				<input bind:value={username} type="text" />
			</label>
			<label>
				<span>E-mail:</span>
				<input bind:value={email} type="email" />
			</label>
			<label>
				<span>Password:</span>
				<input bind:value={password} type="password" placeholder="**********" />
			</label>
			<label class="row">
				<span>Two factor authorization:</span>
				<input type="checkbox" bind:checked={twoFactor} class="styled-checkbox" />
			</label>
			<p class="checkbox-status">2FA: {twoFactor ? 'Enabled' : 'Disabled'}</p>
			<button class="save" onclick={saveProfile}>Save</button>
			{#if showSavedProfile}
				<p class="saved-msg">Changes saved!</p>
			{/if}
		</div>

		<div class="panel" id="contact">
			<h2>Contact Details</h2>
			<label>
				<span>Phone:</span>
				<input type="text" placeholder="+48 123 456 789" />
			</label>
			<label>
				<span>Address:</span>
				<input type="text" placeholder="Street 123, City" />
			</label>
			<button class="save" onclick={saveContact}>Save</button>
			{#if showSavedContact}
				<p class="saved-msg">Changes saved!</p>
			{/if}
		</div>

		<div class="panel" id="email">
			<h2>Email Notifications</h2>
			<label class="row">
				<span>Receive updates:</span>
				<input type="checkbox" bind:checked={emailNotifs} class="styled-checkbox" />
			</label>
			<p class="checkbox-status">Email notifications: {emailNotifs ? 'On' : 'Off'}</p>
		</div>

		<div class="panel" id="push">
			<h2>Push Notifications</h2>
			<label class="row">
				<span>Enable push:</span>
				<input type="checkbox" bind:checked={pushNotifs} class="styled-checkbox" />
			</label>
			<p class="checkbox-status">Push notifications: {pushNotifs ? 'On' : 'Off'}</p>
		</div>

		<div class="panel" id="sms">
			<h2>SMS Notifications</h2>
			<label class="row">
				<span>Receive alerts:</span>
				<input type="checkbox" bind:checked={smsNotifs} class="styled-checkbox" />
			</label>
			<p class="checkbox-status">SMS notifications: {smsNotifs ? 'On' : 'Off'}</p>
		</div>

		<div class="panel" id="password">
			<h2>Password Settings</h2>
			<label>
				<span>Current password:</span>
				<input type="password" placeholder="********" />
			</label>
			<label>
				<span>New password:</span>
				<input type="password" placeholder="********" />
			</label>
			<button class="save" onclick={savePassword}>Save</button>
			{#if showSavedPassword}
				<p class="saved-msg">Changes saved!</p>
			{/if}
		</div>

		<div class="panel" id="2fa">
			<h2>Two-Factor Authentication</h2>
			<p style="font-size: 0.7rem;">Add extra layer of security to your account by enabling 2FA.</p>
			<label class="row">
				<span>Enable 2FA</span>
				<input type="checkbox" bind:checked={twoFactor} class="styled-checkbox" />
			</label>
			<p class="checkbox-status">2FA: {twoFactor ? 'Enabled' : 'Disabled'}</p>
		</div>
	</div>
</section>

<style>
	.settings {
		display: flex;
		justify-content: center;
		padding: 2rem;
		gap: 2rem;
		height: calc(100vh - 6rem);
		overflow: hidden;
	}

	.sidebar {
		width: 16rem;
		border: 2px solid var(--color-accent-1);
		border-radius: 8px;
		padding: 1rem;
		background: var(--color-tile);
		font-size: 0.7rem;
		flex-shrink: 0;
		height: 65vh;
		overflow-y: auto;
	}

	.sidebar ul {
		list-style: none;
		padding: 0;
	}

	.sidebar li {
		margin: 0.5rem 0;          
		color: var(--color-text);
		cursor: default;
		padding: 0;                
		border-radius: 0;
	}

	.sidebar li.group {
		font-weight: bold;
		margin-top: 2rem;
		color: var(--color-accent-2);
		cursor: default;
	}

	.sidebar li:hover:not(.group) {
	background: none;
	color: inherit;
	}

	.sidebar button {
	all: unset;
	cursor: pointer;
	display: block;
	width: 100%;
	text-align: left;
	font-size: inherit;
	font-family: inherit;
	color: inherit;
	padding: 0.5rem 0.4rem;
	border-radius: 4px;
	line-height: 1.2;
	}

	.sidebar button:hover {
		background: var(--color-primary);
		color: var(--color-bg);
	}

	.main {
		flex: 0.50;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		overflow-y: auto;
		padding-right: 1rem;
		padding-bottom: 11rem;
	}

	.avatar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.avatar .circle {
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		background: var(--color-tile);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		border: 2px solid var(--color-accent-1);
	}

	.panel {
		border: 2px solid var(--color-accent-1);
		background: var(--color-tile);
		padding: 1rem;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		font-size: 0.7rem;
		color: var(--color-text);
	}

	label span {
		margin-bottom: 0.2rem;
	}

	label.row {
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	input[type="text"],
	input[type="email"],
	input[type="password"] {
		background: white;
		border: 2px solid var(--color-accent-1);
		padding: 0.3rem;
		font-family: var(--font-body);
		font-size: 0.7rem;
	}

	.styled-checkbox {
		width: 1rem;
		height: 1rem;
		appearance: none;
		background-color: white;
		border: 2px solid var(--color-accent-1);
		border-radius: 3px;
		cursor: pointer;
		display: inline-block;
		position: relative;
	}

	.styled-checkbox:checked {
		background-color: var(--color-primary);
	}

	.save {
		align-self: flex-end;
		padding: 0.3rem 0.8rem;
		border: none;
		background: var(--color-primary);
		color: black;
		font-size: 0.65rem;
		font-family: var(--font-body);
		cursor: pointer;
		border-radius: 5px;
	}

	.checkbox-status {
		font-size: 0.6rem;
		color: var(--color-text);
		margin-top: -0.5rem;
	}

	.saved-msg {
	font-size: 0.65rem;
	color: var(--color-accent-2);
	margin-top: 0.3rem;
	text-align: right;
	}

</style>