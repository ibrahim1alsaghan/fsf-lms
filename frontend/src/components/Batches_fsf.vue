<template>
    <div>
      <!-- ✅ Loading state -->
      <div class="flex justify-between items-center mt-20 mb-6">

<h2 class="text-xl font-bold text-gray-800">{{ currentLang === 'ar' ? 'الدفعات' : 'Batches' }}</h2>
<RouterLink
  to="/batches"
  class="text-green-700 text-sm font-medium hover:underline"
>
  {{ currentLang === 'ar' ? 'عرض المزيد' : 'See more' }}
</RouterLink>
</div>
      <!-- ✅ Loading state -->
      <div v-if="loading" class="text-center text-sm text-gray-400 mt-24">
        {{ currentLang === 'ar' ? 'جاري تحميل الدفعات...' : 'Loading batches...' }}
      </div>
  
      <!-- ✅ Batches grid -->
      <div
        v-else-if="batches.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-10"
      >
        <router-link
          v-for="batch in batches.slice(0, 4)"
          :key="batch.name"
          :to="{ name: 'BatchDetail', params: { batchName: batch.name } }"
          class="block"
        >
          <BatchCard :batch="batch" />
        </router-link>
      </div>
  
      <!-- ✅ No batches fallback -->
      <div v-else class="text-center text-sm italic text-gray-400 mt-24">
        {{ currentLang === 'ar' ? 'لم يتم العثور على دفعات' : 'No batches found' }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, inject } from 'vue'
  import BatchCard from '@/components/BatchCard.vue'
  
  const user = inject('$user')
  const batches = ref([])
  const loading = ref(true)
  const currentLang = ref('ar')

  onMounted(async () => {
    try {
      // Fetch current language
      const langRes = await fetch('/api/method/lms.lms.utils.get_current_user_language')
      const langData = await langRes.json()
      currentLang.value = langData.message.language || 'ar'

      // Fetch batches
      const res = await fetch('/api/method/lms.lms.utils.get_batches')
      const json = await res.json()
      console.log("Fetched batches:", json.message)
      batches.value = json.message || []
    } catch (err) {
      console.error('Failed to load batches', err)
    } finally {
      loading.value = false
    }
  })
  </script>
  