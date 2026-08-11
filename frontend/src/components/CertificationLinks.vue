<template>
  <div class="flex flex-col space-y-2">
    <Button
      v-if="certification.data && certification.data.certificate"
      @click="downloadCertificate"
      class="w-full"
    >
      <template #prefix>
        <GraduationCap class="size-4 stroke-1.5" />
      </template>
      {{ __('View Certificate') }}
    </Button>

    <!-- Get Certified flow if certificate doesn't exist yet -->
    <div
      v-else-if="
        certification.data &&
        certification.data.membership &&
        certification.data.paid_certificate &&
        user.data?.is_student
      "
      class="space-y-2"
    >
      <router-link
        v-if="!certification.data.membership.purchased_certificate"
        :to="{
          name: 'Billing',
          params: {
            type: 'certificate',
            name: courseName,
          },
        }"
      >
        <Button class="w-full">
          <template #prefix>
            <GraduationCap class="size-4 stroke-1.5" />
          </template>
          {{ __('Get Certified') }}
        </Button>
      </router-link>

      <router-link
        v-else-if="!certification.data.membership.certificate"
        :to="{
          name: 'CourseCertification',
          params: {
            courseName: courseName,
          },
        }"
      >
        <Button class="w-full">
          <template #prefix>
            <GraduationCap class="size-4 stroke-1.5" />
          </template>
          {{ __('Get Certified') }}
        </Button>
      </router-link>
    </div>

    <!-- Sharing buttons -->
    <Button
      v-if="certification.data && certification.data.certificate"
      @click="shareOnLinkedIn"
      variant="solid"
      class="w-full flex items-center justify-center gap-2 text-white font-semibold rounded-md py-2 transition-colors"
      style="background-color: #0A66C2 !important ; border-color: #0A66C2 !important;"
    >
      <template #prefix>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="h-5 w-5 fill-white">
          <path
            d="M100.28 448H7.4V148.9h92.88zm-46.44-341C24.24 107 0 82.8 0 53.7 0 24 24.24 0 53.84 0s53.84 24 53.84 53.7c0 29.1-24.24 53.3-53.84 53.3zM447.9 448h-92.68V302.4c0-34.7-12.4-58.4-43.4-58.4-23.7 0-37.8 15.9-44 31.2-2.3 5.6-2.8 13.5-2.8 21.4V448h-92.8s1.2-270.8 0-298.9h92.8v42.4c-.2.3-.5.7-.7 1h.7v-1c12.3-19 34.3-46.2 83.7-46.2 61.1 0 106.9 39.8 106.9 125.2V448z"
          />
        </svg>
      </template>
      {{ __('Share it on LinkedIn') }}
    </Button>

    <Button
      v-if="certification.data && certification.data.certificate"
      @click="shareViaEmail"
      variant="subtle"
      class="w-full"
    >
      📧 {{ __('Share via Email') }}
    </Button>
  </div>
</template>
  <script setup>
  import { Button, createResource } from 'frappe-ui'
  import { inject } from 'vue'
  import { GraduationCap } from 'lucide-vue-next'
  
  const user = inject('$user')
  
  const props = defineProps({
      courseName: {
          type: String,
          required: true,
      },
  })
  
  const certification = createResource({
      url: 'lms.lms.api.get_certification_details',
      params: {
          course: props.courseName,
      },
      auto: user.data ? true : false,
      cache: ['certificationData', user.data?.name, props.courseName],
  })
  
  const downloadCertificate = () => {
      window.open(
          `/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${
              certification.data.certificate.name
          }&format=${encodeURIComponent(certification.data.certificate.template)}`
      )
  }
  
  const shareOnLinkedIn = () => {
    const certificate_url = `${window.location.origin}/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${certification.data.certificate.name}&format=${encodeURIComponent(certification.data.certificate.template)}`
    
    const courseName = certification.data.course_name || 'an amazing course'
    const title = `I'm proud to announce I have completed "${courseName}"!`
    const summary = `Excited to earn my new certificate for "${courseName}" and share my achievement with you all.`
  
    const linkedin_share_url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(certificate_url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
  
    window.open(linkedin_share_url, '_blank')
  }
  
  const shareViaEmail = () => {
    const courseName = certification.data.course_name || 'an amazing course'
    const subject = `I just completed ${props.courseName}! 🎓`
    const body = `Hey there,
  
  I just completed the course ${props.courseName} and earned a certificate !
  
  Check it out `
  
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
  }
  
  </script>
  