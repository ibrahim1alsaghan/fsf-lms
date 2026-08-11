<template>
    <div v-if="enrolledCourses.length">
      <!-- ✅ Title and "See more" only shown if there are enrollments -->
      <div class="flex justify-between items-center mt-20 mb-6">
        <h2 class="text-xl font-bold text-gray-800">{{ currentLang === 'ar' ? 'التسجيلات' : 'Enrollments' }}</h2>
        <RouterLink
          to="/batches"
          class="text-green-700 text-sm font-medium hover:underline"
        >
          {{ currentLang === 'ar' ? 'عرض المزيد' : 'See more' }}
        </RouterLink>
      </div>
  
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-10"
      >
        <router-link
          v-for="course in enrolledCourses"
          :key="course.name"
          :to="{ name: 'CourseDetail', params: { courseName: course.name } }"
          class="block"
        >
          <CourseCard :course="course" />
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, inject } from 'vue'
  import CourseCard from '@/components/CourseCard.vue'
  
  const user = inject('$user')
  const courses = ref([])
  const loading = ref(true)
  const currentLang = ref('ar')
  
  // ✅ Filter only enrolled courses
  const enrolledCourses = computed(() => {
    return courses.value.filter(course => course.membership && course.membership.progress < 100)
  })
  
  onMounted(async () => {
    try {
      // Fetch current language
      const langRes = await fetch('/api/method/lms.lms.utils.get_current_user_language')
      const langData = await langRes.json()
      currentLang.value = langData.message.language || 'ar'

      // Fetch courses
      const res = await fetch('/api/method/lms.lms.utils.get_courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            published: 1,
            upcoming: 0,
            disable_self_learning: 0
          },
          start: 0,
          page_length: 4
        })
      })
      
      const json = await res.json()
      courses.value = json.message || []
    } catch (err) {
      console.error('Failed to load courses', err)
    } finally {
      loading.value = false
    }
  })
  </script>
  