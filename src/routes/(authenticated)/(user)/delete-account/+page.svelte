<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
</script>

<svelte:head>
	<title>Delete Your Account - AlgoDuck</title>
	<meta name="description" content="How to delete your AlgoDuck account and data." />
	<meta name="robots" content="index,follow" />
	<link rel="canonical" href="https://algoduck.pl/delete-account" />
</svelte:head>

<section
	class="font-body mx-auto flex w-full max-w-5xl flex-col items-center pt-12 pr-8 pb-16 pl-8"
>
	<h1
		class="ocr-outline ocr-title mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-bold tracking-widest text-[var(--color-landingpage-title)]"
	>
		Delete Your Account
	</h1>

	<PixelFrameSimple
		className="flex h-max w-full max-w-4xl flex-col gap-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-6 pb-8 pl-6 text-[color:var(--color-landingpage-subtitle)]"
	>
		<p class="text-base leading-relaxed">
			We are sorry to see you go. Deleting your account removes your personal data and is
			irreversible.
		</p>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Delete in the app</h2>
			<ol class="ml-6 list-decimal space-y-2 text-base leading-relaxed">
				<li>
					Open <span class="font-bold">&nbsp;&nbsp;Account &gt; Settings</span>.
				</li>
				<li>
					Choose <span class="font-bold">&nbsp;&nbsp;Delete account</span> and confirm.
				</li>
			</ol>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">Request deletion by email</h2>
			<p class="text-base leading-relaxed">
				Send an email from your account email to
				<a class="underline" href="mailto:algoduckpl@gmail.com">algoduckpl@gmail.com</a>
				with the subject <span class="font-bold">&nbsp;&nbsp;Delete my account</span>.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<h2 class="pt-4 text-2xl font-bold tracking-wide">What happens</h2>
			<ul class="ml-6 list-disc space-y-2 text-base leading-relaxed">
				<li>We revoke active sessions and begin deletion within 30 days.</li>
				<li>We may retain minimal records required for security or legal obligations.</li>
			</ul>
		</div>

		<p class="text-base leading-relaxed">
			If you need help, contact
			<a class="underline" href="mailto:algoduckpl@gmail.com">algoduckpl@gmail.com</a>.
		</p>
	</PixelFrameSimple>
</section>
