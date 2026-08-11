<template>
	<header
		class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5"
	>
		<Breadcrumbs :items="breadcrumbs" />
		<router-link
			v-if="user.data?.is_moderator"
			:to="{
				name: 'CourseForm',
				params: { courseName: 'new' },
			}"
		>
			<Button variant="solid">
				<template #prefix>
					<Plus class="h-4 w-4 stroke-1.5" />
				</template>
				{{ __('New') }}
			</Button>
		</router-link>
	</header>
	<div class="p-5 pb-10">
		<div
			class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center justify-between mb-5"
		>
			<div class="text-lg text-ink-gray-9 font-semibold">
				{{ __('All Courses') }}
			</div>
			<div
				class="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4"
			>
				<FormControl
					v-model="certification"
					:label="__('Certification')"
					type="checkbox"
					@change="updateCourses()"
				/>
				<div class="grid grid-cols-3 gap-2">
					<FormControl
						v-model="title"
						:placeholder="__('Search by Title')"
						type="text"
						class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40"
						@input="updateCourses()"
					/>
					<div class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40">
						<Select
							v-model="currentCategory"
							:options="categories"
							@change="updateCourses()"
						/>
					</div>
					<div class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40">
						<Select
							v-model="currentLanguage"
							:options="languageOptions"
							@change="updateCourses()"
						/>
					</div>
				</div>
			</div>
		</div>
		<div
			v-if="courses.data?.length"
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5"
		>
			<router-link
				v-for="course in courses.data"
				:to="{ name: 'CourseDetail', params: { courseName: course.name } }"
			>
				<CourseCard :course="course" />
			</router-link>
		</div>
		<div
			v-else-if="!courses.list.loading"
			class="flex flex-col items-center justify-center text-sm text-ink-gray-5 italic mt-48"
		>
			<BookOpen class="size-10 mx-auto stroke-1 text-ink-gray-4" />
			<div class="text-lg font-medium mb-1">
				{{ __('No courses found') }}
			</div>
			<div class="leading-5 w-2/5 text-center">
				{{
					__(
						'There are no courses matching the criteria. Keep an eye out, fresh learning experiences are on the way soon!'
					)
				}}
			</div>
		</div>
		<div
			v-if="!courses.list.loading && courses.hasNextPage"
			class="flex justify-center mt-5"
		>
			<Button @click="courses.next()">
				{{ __('Load More') }}
			</Button>
		</div>
	</div>
</template>
<script setup>
import {
	Breadcrumbs,
	Button,
	createListResource,
	FormControl,
	Select,
} from 'frappe-ui'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { BookOpen, Plus } from 'lucide-vue-next'
import { updateDocumentTitle } from '@/utils'
import CourseCard from '@/components/CourseCard.vue'

const user = inject('$user')
const dayjs = inject('$dayjs')
const start = ref(0)
const pageLength = ref(30)
const categories = ref([
	{
		label: __('All Categories'),
		value: '',
	},
])
const currentCategory = ref('')
const currentLanguage = ref('')
const title = ref('')
const certification = ref(false)
const filters = ref({})

const languageOptions = [
	{
		label: __('All Languages'),
		value: '',
	},
	{
		label: __('English'),
		value: 'English',
	},
	{
		label: __('عربي'),
		value: 'عربي',
	},
]

onMounted(() => {
	setFiltersFromQuery()
	updateCourses()
	// Ensure categories are populated even when using cached data
	if (allCoursesForCategories.data) {
		updateCategories(allCoursesForCategories.data)
	}
})

const setFiltersFromQuery = () => {
	let queries = new URLSearchParams(location.search)
	title.value = queries.get('title') || ''
	currentCategory.value = queries.get('category') || ''
	currentLanguage.value = queries.get('language') || ''
	certification.value = queries.get('certification') || false
}

const courses = createListResource({
	doctype: 'LMS Course',
	url: 'lms.lms.utils.get_courses',
	cache: ['courses', user.data?.name],
	pageLength: pageLength.value,
	start: start.value,
})

// Load all categories separately without filters - this ensures all categories always show
const allCoursesForCategories = createListResource({
	doctype: 'LMS Course',
	url: 'lms.lms.utils.get_courses',
	cache: ['all_courses_categories'],
	pageLength: 1000, // Get a large number to ensure we get all categories
	start: 0,
	onSuccess(data) {
		updateCategories(data)
	},
	auto: true, // Auto-load to get all categories on mount
})

const updateCourses = () => {
	updateFilters()
	courses.update({
		filters: filters.value,
	})
	courses.reload()
}

const updateFilters = () => {
	updateCategoryFilter()
	updateLanguageFilter()
	updateTitleFilter()
	updateCertificationFilter()
	updateStudentFilter()
	setQueryParams()
}

const updateCategoryFilter = () => {
	if (currentCategory.value && currentCategory.value !== '') {
		filters.value['category'] = currentCategory.value
	} else {
		delete filters.value['category']
	}
}

const updateLanguageFilter = () => {
	if (currentLanguage.value && currentLanguage.value !== '') {
		filters.value['language'] = currentLanguage.value
	} else {
		delete filters.value['language']
	}
}

const updateTitleFilter = () => {
	if (title.value) {
		filters.value['title'] = ['like', `%${title.value}%`]
	} else {
		delete filters.value['title']
	}
}

const updateCertificationFilter = () => {
	if (certification.value) {
		filters.value['certification'] = 1
	} else {
		delete filters.value['certification']
	}
}

const updateStudentFilter = () => {
	if (!user.data || user.data?.is_student) {
		filters.value['published'] = 1
	}
}

const setQueryParams = () => {
	let queries = new URLSearchParams(location.search)
	let filterKeys = {
		title: title.value,
		category: currentCategory.value,
		language: currentLanguage.value,
		certification: certification.value,
	}

	Object.keys(filterKeys).forEach((key) => {
		if (filterKeys[key]) {
			queries.set(key, filterKeys[key])
		} else {
			queries.delete(key)
		}
	})

	let queryString = ''
	if (queries.toString()) {
		queryString = `?${queries.toString()}`
	}

	history.replaceState({}, '', `${location.pathname}${queryString}`)
}

const updateCategories = (data) => {
	if (!data || !Array.isArray(data)) return
	
	// Count courses per category
	const categoryCounts = {}
	let totalCount = 0
	
	data.forEach((course) => {
		totalCount++
		if (course.category) {
			categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1
		}
	})
	
	// Create category options with counts
	const newCategories = Object.keys(categoryCounts).map(category => ({
		label: `${category} (${categoryCounts[category]})`,
		value: category,
		count: categoryCounts[category],
	}))
	
	// Sort categories by count (highest first), then alphabetically if same count
	newCategories.sort((a, b) => {
		if (b.count !== a.count) {
			return b.count - a.count
		}
		return a.label.localeCompare(b.label)
	})
	
	// Always keep "All Categories" first with total count
	categories.value = [
		{ label: __('All Categories') + ` (${totalCount})`, value: '' },
		...newCategories
	]
}

// Watch for cached data that might not trigger onSuccess
watch(
	() => allCoursesForCategories.data,
	(data) => {
		if (data) {
			updateCategories(data)
		}
	},
	{ immediate: true }
)

const breadcrumbs = computed(() => [
	{
		label: __('Courses'),
		route: { name: 'Courses' },
	},
])

const pageMeta = computed(() => {
	return {
		title: 'Courses',
		description: 'All published courses.',
	}
})

updateDocumentTitle(pageMeta)
</script>
