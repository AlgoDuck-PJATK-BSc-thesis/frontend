<script lang="ts">
	import { FetchFromApi } from '$lib/api/apiCall';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import landingPageBackground from '$lib/images/LandingPage/Landing_page.gif';

	type SignInDto = {
		username: String,
		password: String
	}

	let formData: SignInDto = $state({} as SignInDto)

	const login = async () => {
		let res = await FetchFromApi("Auth/login", {
			method: "POST",
			body: JSON.stringify(formData)
		}, fetch);
		console.log(res);
	}


</script>

<svelte:head>
	<title>Log in - AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-100 text-center">
	<img
		src={landingPageBackground}
		alt="landing page background"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
	/>
	<h1
		class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ocra)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
	>
		Log In
	</h1>

	<PixelFrame className="flex w-full flex-col items-center bg-black/60 px-14 pt-10 pb-14">
		<form
			method="POST"
			class="mt-2 flex w-70 flex-col gap-2 text-left text-sm text-[color:var(--color-text)]"
		>
			<label class="flex flex-col">
				<span>Username or Email</span>
				<input
					type="text"
					name="identifier"
					required
					class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
					bind:value={formData.username}
				/>
			</label>

			<label class="flex flex-col">
				<span>Password</span>
				<input
					type="password"
					name="password"
					required
					class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
					bind:value={formData.password}
				/>
			</label>
		</form>

		<p class="mt-6 text-center leading-snug">
			<a href="/signup" class="inline-flex hover:text-[color:var(--color-accent-2)]">
				<span>Don't have an account?</span>
				<span class="ml-1 font-semibold">Sign Up</span>
			</a>
		</p>

		<div class="mt-8 mb-2 flex justify-center">
			<Button
				size="medium"
				label="→"
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="2rem"
				labelFontWeight="normal"
				labelTracking="extra"
				labelClass=""
				onclick={login}
			/>
		</div>

		<div class="mt-8 flex flex-col items-center gap-3">
			<div class="flex items-center justify-center gap-4">
				<a
					href="/auth/oauth/google"
					class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/90 shadow-md hover:bg-white"
				>
					<img src="/oauth/google.png" alt="Sign up with Google" class="h-12 w-12 object-contain" />
				</a>

				<a
					href="/auth/oauth/github"
					class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/90 shadow-md hover:bg-white"
				>
					<img src="/oauth/github.png" alt="Sign up with GitHub" class="h-12 w-12 object-contain" />
				</a>

				<a
					href="/auth/oauth/facebook"
					class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/90 shadow-md hover:bg-white"
				>
					<img
						src="/oauth/facebook.png"
						alt="Sign up with Facebook"
						class="h-12 w-12 object-contain"
					/>
				</a>
			</div>
		</div>
	</PixelFrame>
</section>