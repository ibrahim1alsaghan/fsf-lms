<template>
  <!-- <div class="bg-white font-inter text-[#212529] min-h-screen"> -->


    <header
		class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5"
	>
		<Breadcrumbs :items="breadcrumbs" />

	</header>


    <div class="p-5 pb-10">
      <HeroSection />
      <Enrollments />
      <!-- <Batches />         -->
      <CourseGrid />
      <!-- <section>
        <div class="flex justify-between items-center mt-20 mb-6">
          <h2 class="text-xl font-bold text-gray-800">Popular Podcasts</h2>
          <RouterLink
            to="/podcats"
            class="text-green-700 text-sm font-medium hover:underline"
          >
            See more
          </RouterLink>
        </div>
      </section> -->
    </div>
  <!-- </div> -->
</template>

<script setup>
import HeroSection from '@/components/HeroSection_fsf.vue'
// import Batches from '@/components/Batches_fsf.vue'
import CourseGrid from '@/components/CourseGrid_fsf.vue'
// import Enrollments from '@/components/Enrollments_fsf.vue'

import { computed, ref, onMounted } from 'vue'
import { Breadcrumbs } from 'frappe-ui'

const breadcrumbs = computed(() => [
	{
		label: currentLang.value === 'ar' ? 'الرئيسية' : 'Home',
		route: { name: 'Home' },
	},
])

// Language switching functionality
const currentLang = ref('ar')

onMounted(async () => {
  try {
    const res = await fetch('/api/method/lms.lms.utils.get_current_user_language')
    const data = await res.json()
    currentLang.value = data.message.language || 'ar'

    const isRTL = currentLang.value === 'ar'
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    document.body.classList.toggle('rtl', isRTL)
  } catch (err) {
    console.error("Failed to fetch language", err)
  }
})

const switchLang = async () => {
  const newLang = currentLang.value === 'ar' ? 'en' : 'ar'

  await fetch('/api/method/lms.lms.utils.update_user_language', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': window.csrf_token,
    },
    body: JSON.stringify({ language: newLang }),
  })

  location.reload()
}

</script>

