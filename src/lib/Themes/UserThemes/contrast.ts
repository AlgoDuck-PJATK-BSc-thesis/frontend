export const contrast = {
	'1': {
		'--color-bg-a11y': '#000000',
		'--color-text-a11y': '#f2b500',

		'--color-bg': '#000000',
		'--color-bg-2': '#000000',
		'--color-text': '#f2b500',
		'--color-primary': '#f2b500',

		'--color-landingpage-title': '#f2b500',
		'--color-landingpage-description': '#f2b500',

		'--color-tile': '#000000',
		'--color-accent-1': '#f2b500',
		'--color-accent-2': '#f2b500',
		'--color-accent-3': '#000000',
		'--color-accent-4': '#000000',

		'--color-text-button': '#000000',
		'--color-grass-green': '#000000',

		'--color-chat-left': '#000000',
		'--color-chat-right': '#000000',
		'--color-chat-border-left': '#f2b500',
		'--color-chat-border-right': '#f2b500'
	},
	'2': {
		'--color-bg-a11y': '#f2b500',
		'--color-text-a11y': '#000000',

		'--color-bg': '#f2b500',
		'--color-bg-2': '#f2b500',
		'--color-text': '#000000',
		'--color-primary': '#000000',

		'--color-landingpage-title': '#f2b500',
		'--color-landingpage-description': '#f2b500',

		'--color-tile': '#f2b500',
		'--color-accent-1': '#000000',
		'--color-accent-2': '#000000',
		'--color-accent-3': '#f2b500',
		'--color-accent-4': '#f2b500',

		'--color-text-button': '#000000',
		'--color-grass-green': '#f2b500',

		'--color-chat-left': '#f2b500',
		'--color-chat-right': '#f2b500',
		'--color-chat-border-left': '#000000',
		'--color-chat-border-right': '#000000'
	}
} as const;

export type ContrastLevel = keyof typeof contrast;
