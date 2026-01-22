<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import SettingsCard from '../_cards/SettingsCard.svelte';
	import type { ThemeName } from '$lib/Themes';
	import type { Notice } from '../utils';

	let {
		theme,
		highContrastChoice,
		savingTheme = false,
		savingContrast = false,
		noticeTheme = null,
		noticeContrast = null,
		onTheme,
		onContrast,
		onSaveTheme,
		onSaveContrast
	} = $props<{
		theme: ThemeName;
		highContrastChoice: 'enabled' | 'disabled';
		savingTheme?: boolean;
		savingContrast?: boolean;
		noticeTheme?: Notice | null;
		noticeContrast?: Notice | null;
		onTheme: (t: ThemeName) => void;
		onContrast: (c: 'enabled' | 'disabled') => void;
		onSaveTheme: () => void;
		onSaveContrast: () => void;
	}>();
</script>

<SettingsCard
	id="preferences"
	title="Preferences"
	className="bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Theme and accessibility.
	</p>

	<div
		class="flex flex-col gap-8 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
	>
		<div class="flex flex-col gap-2">
			<span>Theme</span>
			<div class="flex gap-4">
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="theme"
						value="dark"
						checked={theme === 'dark'}
						class="peer hidden"
						onchange={() => onTheme('dark')}
					/>
					<div
						class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
					></div>
					Dark
				</label>

				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="theme"
						value="light"
						checked={theme === 'light'}
						class="peer hidden"
						onchange={() => onTheme('light')}
					/>
					<div
						class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
					></div>
					Light
				</label>
			</div>

			<div class={`mt-6 ${savingTheme ? 'pointer-events-none opacity-60' : ''}`}>
				<Button
					size="small"
					label={savingTheme ? 'Saving' : 'Save'}
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="1.2rem"
					labelFontWeight="normal"
					labelTracking="normal"
					labelClass=""
					onclick={onSaveTheme}
				/>
			</div>

			{#if noticeTheme}
				<p
					class={`mt-3 text-sm font-semibold ${
						noticeTheme.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'
					}`}
				>
					{noticeTheme.message}
				</p>
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			<span>High contrast</span>
			<div class="flex gap-4">
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="contrast"
						value="enabled"
						checked={highContrastChoice === 'enabled'}
						class="peer hidden"
						onchange={() => onContrast('enabled')}
					/>
					<div
						class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
					></div>
					On
				</label>

				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="contrast"
						value="disabled"
						checked={highContrastChoice === 'disabled'}
						class="peer hidden"
						onchange={() => onContrast('disabled')}
					/>
					<div
						class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
					></div>
					Off
				</label>
			</div>

			<div class={`mt-6 ${savingContrast ? 'pointer-events-none opacity-60' : ''}`}>
				<Button
					size="small"
					label={savingContrast ? 'Saving' : 'Save'}
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="1.2rem"
					labelFontWeight="normal"
					labelTracking="normal"
					labelClass=""
					onclick={onSaveContrast}
				/>
			</div>

			{#if noticeContrast}
				<p
					class={`mt-3 text-sm font-semibold ${
						noticeContrast.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'
					}`}
				>
					{noticeContrast.message}
				</p>
			{/if}
		</div>
	</div>
</SettingsCard>
