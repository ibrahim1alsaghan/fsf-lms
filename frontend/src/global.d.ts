declare global {
	interface Window {
		__: (message: string) => string | { format: (...args: any[]) => string }
		translatedMessages?: Record<string, string>
		read_only_mode?: boolean
	}
}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		__: (message: string) => string | { format: (...args: any[]) => string }
	}
}

export {}

