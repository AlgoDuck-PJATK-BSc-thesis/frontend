<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	const lastUpdated = new Date().toISOString().slice(0, 10);
</script>

<svelte:head>
	<title>Privacy Policy - AlgoDuck</title>
	<meta name="description" content="How AlgoDuck collects, uses, and protects your data." />
	<meta name="robots" content="index,follow" />
	<link rel="canonical" href="https://algoduck.pl/privacy" />
</svelte:head>

<section
	class="font-body mx-auto flex w-full max-w-5xl flex-col items-center pt-12 pr-8 pb-16 pl-8"
>
	<h1
		class="ocr-outline ocr-title mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-bold tracking-widest text-[var(--color-landingpage-title)]"
	>
		Privacy Policy
	</h1>

	<PixelFrameSimple
		className="flex h-max w-full max-w-4xl flex-col gap-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-6 pb-8 pl-6 text-[color:var(--color-landingpage-subtitle)]"
	>
		<p class="text-base">
			Last updated:
			<time datetime={lastUpdated}>{lastUpdated}</time>
		</p>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Who we are</h2>
			<p class="text-base leading-relaxed">
				AlgoDuck (we, us) provides programming practice services at
				<a class="underline" href="https://algoduck.pl" rel="noopener noreferrer" target="_blank"
					>algoduck.pl</a
				>. Contact:
				<a class="underline" href="mailto:algoduckpl@gmail.com">algoduckpl@gmail.com</a>.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Data we collect</h2>
			<ul class="ml-6 list-disc space-y-2 text-base leading-relaxed">
				<li>
					Account data:
					<span class="font-bold">&nbsp;&nbsp;username, email, password hash</span>, or data from
					OAuth providers (Google, GitHub, Microsoft).
				</li>
				<li>
					Service data:
					<span class="font-bold">&nbsp;&nbsp;submissions, progress, messages, preferences</span>.
				</li>
				<li>
					Technical data:
					<span class="font-bold">&nbsp;&nbsp; cookies for session and security. </span>
				</li>
			</ul>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">How we use data</h2>
			<ul class="ml-6 list-disc space-y-2 text-base leading-relaxed">
				<li>
					<span class="font-bold">&nbsp;&nbsp;Authenticate</span> you and keep your sessions secure.
				</li>
				<li>
					<span class="font-bold">&nbsp;&nbsp;Provide core features</span> (practice, cohorts, leaderboards,
					messaging).
				</li>
				<li>
					<span class="font-bold">&nbsp;&nbsp;Send transactional emails</span> (for example login, security,
					2FA).
				</li>
				<li>
					<span class="font-bold">&nbsp;&nbsp;Prevent abuse</span> and improve the service.
				</li>
			</ul>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Legal bases</h2>
			<p class="text-base leading-relaxed">
				We process data to perform the contract (provide the service), for legitimate interests
				(security, improvement), and with consent where required.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Sharing</h2>
			<p class="text-base leading-relaxed">
				We do not sell personal data. We use processors to run the service:
			</p>
			<ul class="ml-6 list-disc space-y-2 text-base leading-relaxed">
				<li>
					<span class="font-bold">&nbsp;&nbsp;AWS</span> (hosting and S3 storage)
				</li>
				<li>
					<span class="font-bold">&nbsp;&nbsp;OAuth providers</span> you choose (Google, GitHub, Microsoft)
					for sign-in
				</li>
			</ul>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Retention</h2>
			<p class="text-base leading-relaxed">
				We keep account data while your account is active. You can delete your account at any time;
				see <a class="underline" href="/delete-account">Delete Account</a>.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Cookies</h2>
			<p class="text-base leading-relaxed">
				We use strictly necessary cookies for authentication (<span class="font-bold"
					>&nbsp;&nbsp;session, JWT, CSRF</span
				>). No advertising cookies.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Security</h2>
			<p class="text-base leading-relaxed">
				We use encryption in transit (HTTPS), hashed passwords, rotating refresh tokens, and other
				industry practices.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Your rights</h2>
			<p class="text-base leading-relaxed">
				You may access, correct, or delete your data. Contact
				<a class="underline" href="mailto:algoduckpl@gmail.com">algoduckpl@gmail.com</a>.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Changes</h2>
			<p class="text-base leading-relaxed">
				We will update this page for material changes. Continued use means you accept the updated
				policy.
			</p>
		</div>
	</PixelFrameSimple>
</section>
