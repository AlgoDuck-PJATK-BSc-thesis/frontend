<script lang="ts">
	import { FetchFromApi } from '$lib/api/apiCall';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import LandingPage from '$lib/Components/LandingPage.svelte';

	type SignInDto = {
		username: String;
		password: String;
	};

	let formData: SignInDto = $state({} as SignInDto);

	const login = async () => {
		let res = await FetchFromApi(
			'Auth/login',
			{
				method: 'POST',
				body: JSON.stringify(formData)
			},
			fetch
		);
		console.log(res);
	};
</script>

<svelte:head>
	<title>Log in - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-100 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Log In
		</h1>

		<div
			class="relative z-10 flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-left text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
		>
			<form
				method="POST"
				class="mt-2 flex w-70 flex-col gap-2 text-left text-sm text-[color:var(--color-input-text)]"
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
				<a
					href="/signup"
					class="inline-flex text-[color:var(--color-input-text)] hover:text-[color:var(--color-header-guest)]"
				>
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
						<img
							src="/oauth/google.png"
							alt="Sign up with Google"
							class="h-12 w-12 object-contain"
						/>
					</a>

					<a
						href="/auth/oauth/github"
						class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/90 shadow-md hover:bg-white"
					>
						<img
							src="/oauth/github.png"
							alt="Sign up with GitHub"
							class="h-12 w-12 object-contain"
						/>
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
		</div>
	</div>
</section>
