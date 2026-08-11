<template>
	<div class="flex flex-col items-center justify-center py-20 text-center">
		<div class="text-ink-gray-7 text-lg font-medium mb-2">
			{{ __('No {0} found').format(__(type)) }}
		</div>
		<div class="text-ink-gray-5 text-sm">
			{{ __('Get started by creating your first {0}').format(__(type).toLowerCase()) }}
		</div>
	</div>
</template>

<script setup>
defineProps({
	type: {
		type: String,
		required: true,
	},
})
</script>

