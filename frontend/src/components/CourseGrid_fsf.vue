<template>
  <div>
    <!-- ✅ Show loading state -->
    <div class="flex justify-between items-center mt-20 mb-6">
      <h2 class="text-xl font-bold text-gray-800">{{ currentLang === 'ar' ? 'الدورات المميزة' : 'Featured Courses' }}</h2>
      <RouterLink
        to="/courses"
        class="text-green-700 text-sm font-medium hover:underline"
      >
        {{ currentLang === 'ar' ? 'عرض المزيد' : 'See more' }}
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center text-sm text-gray-400 mt-24">
      {{ currentLang === 'ar' ? 'جاري تحميل الدورات...' : 'Loading courses...' }}
    </div>

    <!-- ✅ Show courses if any -->
    <div
      v-else-if="courses.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-10"
    >
      <router-link
        v-for="course in courses"
        :key="course.name"
        :to="{ name: 'CourseDetail', params: { courseName: course.name } }"
        class="block"
      >
        <CourseCard :course="course" />
      </router-link>
    </div>

    <!-- ✅ Show fallback if no courses -->
    <div v-else class="text-center text-sm italic text-gray-400 mt-24">
      {{ currentLang === 'ar' ? 'لم يتم العثور على دورات' : 'No courses found' }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import CourseCard from '@/components/CourseCard.vue'

const user = inject('$user')
const courses = ref([])
const loading = ref(true)
const currentLang = ref('ar')

onMounted(async () => {
  try {
    // Fetch current language
    const langRes = await fetch('/api/method/lms.lms.utils.get_current_user_language')
    const langData = await langRes.json()
    currentLang.value = langData.message.language || 'ar'

    // Fetch courses
    const res = await fetch('/api/method/lms.lms.utils.fetch_featured_courses')
    
    const json = await res.json()
    console.log("Fetched courses:", json.message) // ✅ check that message is an array
    courses.value = json.message || []
  } catch (err) {
    console.error('Failed to load courses', err)
  } finally {
    loading.value = false
  }
})
</script>
