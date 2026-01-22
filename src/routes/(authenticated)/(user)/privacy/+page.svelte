<svelte:head>
	<title>Privacy Policy - AlgoDuck</title>
	<meta name="description" content="How AlgoDuck collects, uses, and protects your data." />
	<meta name="robots" content="index,follow" />
	<link rel="canonical" href="https://algoduck.pl/privacy" />
</svelte:head>

<main class="mx-auto prose max-w-3xl p-6">
	<h1>Privacy Policy</h1>
	<p>Last updated: <time>{new Date().toISOString().slice(0, 10)}</time></p>

	<h2>Who we are</h2>
	<p>
		AlgoDuck (“we”, “us”) provides programming practice services at <a href="https://algoduck.pl"
			>algoduck.com</a
		>. Contact: <a href="mailto:algoduckpl@gmail.com">support@algoduck.com</a>.
	</p>

	<h2>Data we collect</h2>
	<ul>
		<li>
			Account data: username, email, password hash, or data from OAuth providers (Google, GitHub,
			Microsoft).
		</li>
		<li>Service data: submissions, progress, messages, preferences.</li>
		<li>Technical data: IP address, device/browser info, cookies for session and security.</li>
	</ul>

	<h2>How we use data</h2>
	<ul>
		<li>Authenticate you and keep your sessions secure.</li>
		<li>Provide core features (practice, cohorts, leaderboards, messaging).</li>
		<li>Send transactional emails (e.g., login, security, 2FA).</li>
		<li>Prevent abuse and improve the service.</li>
	</ul>

	<h2>Legal bases</h2>
	<p>
		We process data to perform the contract (provide the service), for legitimate interests
		(security, improvement), and with consent where required.
	</p>

	<h2>Sharing</h2>
	<p>We do not sell personal data. We use processors to run the service:</p>
	<ul>
		<li>AWS (hosting and S3 storage)</li>
		<li>Postmark (transactional email)</li>
		<li>OAuth providers you choose (Google, GitHub, Microsoft) for sign-in</li>
	</ul>

	<h2>Retention</h2>
	<p>
		We keep account data while your account is active. You can delete your account at any time; see <a
			href="/delete-account">Delete Account</a
		>.
	</p>

	<h2>Cookies</h2>
	<p>
		We use strictly necessary cookies for authentication (session/JWT/CSRF). No advertising cookies.
	</p>

	<h2>Security</h2>
	<p>
		We use encryption in transit (HTTPS), hashed passwords, rotating refresh tokens, and other
		industry practices.
	</p>

	<h2>Your rights</h2>
	<p>
		You may access, correct, or delete your data. Contact <a href="mailto:algoduckpl@gmail.com"
			>algoduckpl@gmail.com</a
		>.
	</p>

	<h2>Changes</h2>
	<p>
		We'll update this page for material changes. Continued use means you accept the updated policy.
	</p>
</main>
