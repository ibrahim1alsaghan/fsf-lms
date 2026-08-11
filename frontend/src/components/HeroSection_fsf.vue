<template>
  <section class="w-full overflow-hidden rounded-2xl mt-1 relative">
    <!-- Image -->
    <div class="relative w-full h-[400px] rounded-2xl overflow-hidden">
      <!-- ✅ Entire image is a router-link -->
      <router-link
        v-if="currentImage"
        :to="links[currentIndex]"
        class="w-full h-full block"
      >
        <img 
          :src="currentImage" 
          alt="Hero Banner" 
          class="w-full h-full object-contain rounded-2xl transition-all duration-700"
        />
      </router-link>
    </div>

    <!-- Dots -->
    <div class="flex justify-center mt-4 space-x-2">
      <div
        v-for="(_, index) in images"
        :key="index"
        @click="goToImage(index)"
        class="rounded-full cursor-pointer transition-all duration-300"
        :class="currentIndex === index ? 'dot-active' : 'dot-inactive'"
      ></div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import heroPodcastImage from '@/assets/Podcast.png'
import heroCourseImage from '@/assets/Courses.png'

// ✅ Images List
const images = [heroPodcastImage, heroCourseImage]

// ✅ Router links
const links = ['/Podcasts', '/Courses']

const currentIndex = ref(0)

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

const goToImage = (index) => {
  currentIndex.value = index
}

let intervalId = null

onMounted(() => {
  intervalId = setInterval(nextImage, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

const currentImage = computed(() => images[currentIndex.value])
</script>

<style scoped>
.dot-active {
  background-color: #3A7C40; 
  width: 1.5rem;
  height: 0.75rem;
  transition: all 0.3s ease;
  border-radius: 9999px;
}

.dot-inactive {
  background-color: #98B98C; 
  width: 0.75rem;
  height: 0.75rem;
  transition: all 0.3s ease;
  border-radius: 9999px;
}

.dot-active, .dot-inactive {
  transition: background-color 0.3s, transform 0.3s;
}
</style>
