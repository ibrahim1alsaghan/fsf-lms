<template>
	<Dialog
		v-model="show"
		:options="{
			size: 'xl',
		}"
	>
		<template #body>
			<div class="p-5 space-y-4">
				<div v-if="type == 'quiz'" class="text-lg font-semibold">
					{{ __('Add a quiz to your lesson') }}
				</div>
				<div v-else class="text-lg font-semibold">
					{{ __('Add an assignment to your lesson') }}
				</div>
				<div>
					<Link
						v-if="type == 'quiz'"
						v-model="quiz"
						doctype="LMS Quiz"
						:label="__('Select a quiz')"
						:onCreate="(value, close) => redirectToForm()"
					/>
					<Link
						v-else
						v-model="assignment"
						doctype="LMS Assignment"
						:label="__('Select an assignment')"
						:onCreate="(value, close) => redirectToForm()"
					/>
				</div>
				<!-- Recommended Quiz Section -->
				<div
					v-if="type == 'quiz' && recommendedQuiz && !quiz"
					class="mt-4 pt-4 border-t border-outline-gray-2"
				>
					<div class="text-sm font-medium text-ink-gray-5 mb-3">
						{{ __('Recommended Quiz') }}
					</div>
					<div
						@click="selectRecommendedQuiz"
						class="recommended-quiz-box cursor-pointer rounded-lg p-4 border-2 transition-all hover:shadow-lg hover:scale-[1.01]"
						:class="{
							'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100': true,
						}"
					>
						<div class="flex items-center justify-between">
							<div class="flex-1">
								<div class="font-semibold text-ink-gray-8 mb-1 text-base">
									{{ recommendedQuiz.title }}
								</div>
								<div class="text-sm text-ink-gray-6">
									{{ __('Click to select this quiz') }}
								</div>
							</div>
							<div
								class="ml-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm"
							>
								{{ __('Recommended') }}
							</div>
						</div>
					</div>
				</div>
				<div class="flex justify-end space-x-2">
					<Button variant="solid" @click="addAssessment()">
						{{ __('Save') }}
					</Button>
				</div>
			</div>
		</template>
	</Dialog>
</template>
<script setup>
import { Dialog, Button, createResource } from 'frappe-ui'
import { onMounted, ref, nextTick, watch } from 'vue'
import Link from '@/components/Controls/Link.vue'

const show = ref(false)
const quiz = ref(null)
const assignment = ref(null)
const recommendedQuiz = ref(null)

const props = defineProps({
	type: {
		type: String,
		required: true,
	},
	onAddition: {
		type: Function,
		required: true,
	},
	// course_chapter matches the LMS Quiz doctype field name (course_chapter)
	course_chapter: {
		type: String,
		default: null,
	},
})

const recommendedQuizResource = createResource({
	url: 'lms.lms.utils.get_recommended_quiz_for_chapter',
	makeParams() {
		return {
			chapter: props.course_chapter,
		}
	},
	auto: false,
	onSuccess(data) {
		if (data) {
			recommendedQuiz.value = data
		}
	},
})

onMounted(async () => {
	await nextTick()
	show.value = true
	
	// Fetch recommended quiz if course_chapter is provided
	if (props.course_chapter && props.type === 'quiz') {
		recommendedQuizResource.reload()
	}
})

watch(
	() => props.course_chapter,
	(newChapter) => {
		if (newChapter && props.type === 'quiz') {
			recommendedQuizResource.reload()
		}
	}
)

const selectRecommendedQuiz = () => {
	if (recommendedQuiz.value) {
		quiz.value = recommendedQuiz.value.name
	}
}

const addAssessment = () => {
	props.onAddition(props.type == 'quiz' ? quiz.value : assignment.value)
	show.value = false
}

const redirectToForm = () => {
	if (props.type == 'quiz') window.open('/lms/quizzes/new', '_blank')
	else window.open('/lms/assignments/new', '_blank')
}
</script>
