<template>
    <header
        class="sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
    >
        <Breadcrumbs :items="breadcrumbs" />
        <div class="flex items-center space-x-2">
            <Button
                @click="markAllAsRead.submit"
                :loading="markAllAsRead.loading"
                v-if="activeTab === 'Unread' && unReadNotifications.data?.length > 0"
            >
                {{ __('Mark all as read') }}
            </Button>
            <Button
                v-if="user.data?.is_system_manager"
                @click="showModal = true"
            >
                {{ __("+ make a New Announcement") }}
            </Button>
            <TabButtons
                class="inline-block"
                :buttons="[
                    { label: __('Unread'), value: 'Unread' },
                    { label: __('Read'), value: 'Read' }
                ]"
                v-model="activeTab"
                />
        </div>
    </header>

    <div class="w-3/4 mx-auto px-5 pt-6 divide-y">
        <div
            v-if="notifications?.length"
            v-for="log in notifications"
            :key="log.name"
            class="flex items-center py-2 justify-between"
        >
            <div class="flex items-center">
                <Avatar :image="log.user_image" :label="log.full_name" class="mr-2" />
                <div class="notification text-ink-gray-7" v-html="log.subject"></div>
            </div>
            <div class="flex items-center space-x-2">
                <router-link
                    v-if="log.link"
                    :to="log.link"
                    @click="markAsRead.submit({ name: log.name })"
                    class="text-ink-gray-5 font-medium text-sm hover:text-ink-gray-7"
                >
                    {{ __('View') }}
                </router-link>
                <Tooltip :text="__('Mark as read')">
                    <Button
                        variant="ghost"
                        v-if="!log.read"
                        @click="markAsRead.submit({ name: log.name })"
                    >
                        <template #icon>
                            <X class="h-4 w-4 text-ink-gray-7 stroke-1.5" />
                        </template>
                    </Button>
                </Tooltip>
            </div>
        </div>
        <div v-else class="text-ink-gray-5">
            {{ __('Nothing to see here.') }}
        </div>
    </div>

    <div v-if="showModal" class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
  <div class="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
    <h2 class="text-lg font-bold mb-4">{{ __('New Announcement') }}</h2>
    <Input v-model="announcementTitle" :placeholder="__('Title')" class="mb-2" />
    <div class="flex justify-end space-x-2">
      <Button @click="showModal = false" variant="ghost">{{__('Cancel')}}</Button>
      <Button @click="sendAnnouncement" :loading="sending">{{ __('Send') }}</Button>
    </div>
  </div>
</div>

</template>

<script setup>
// FIXED: Removed 'Link' from imports
import {
    Avatar,
    createListResource,
    createResource,
    Breadcrumbs,
    TabButtons,
    Button,
    Tooltip,
    Input,
    Textarea,
    usePageMeta,
} from 'frappe-ui'
import { showToast } from '@/utils/'

import { sessionStore } from '@/stores/session'
import { computed, inject, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'

const { brand } = sessionStore()
const user = inject('$user')
const socket = inject('$socket')
const activeTab = ref('Unread')
const router = useRouter()

const showModal = ref(false)
const announcementTitle = ref('')
const sending = ref(false)


onMounted(() => {
    if (!user.data) router.push({ name: 'Courses' })

    socket.on('publish_lms_notifications', () => {
        unReadNotifications.reload()
    })
})

const notifications = computed(() => {
    return activeTab.value === 'Unread'
        ? unReadNotifications.data
        : readNotifications.data
})

const unReadNotifications = createListResource({
    doctype: 'Notification Log',
    url: 'lms.lms.api.get_notifications',
    filters: {
        for_user: user.data?.name,
        read: 0,
    },
    auto: true,
    cache: 'Unread Notifications',
})

const readNotifications = createListResource({
    doctype: 'Notification Log',
    url: 'lms.lms.api.get_notifications',
    filters: {
        for_user: user.data?.name,
        read: 1,
    },
    auto: true,
    cache: 'Read Notifications',
})

const markAsRead = createResource({
    url: 'lms.lms.api.mark_as_read',
    makeParams(values) {
        return {
            name: values.name,
        }
    },
    onSuccess() {
        unReadNotifications.reload()
        readNotifications.reload()
    },
})

const markAllAsRead = createResource({
    url: 'lms.lms.api.mark_all_as_read',
    onSuccess() {
        unReadNotifications.reload()
        readNotifications.reload()
    },
})

const sendAnnouncement = async () => {
  sending.value = true
  try {
    await fetch('/api/method/lms.lms.utils.send_global_notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': window.csrf_token ,
      },
      body: JSON.stringify({
        subject: announcementTitle.value,
      }),
    })
    showToast('Success', 'Announcement sent!', 'check')
    showModal.value = false
    announcementTitle.value = ''
    unReadNotifications.reload()
  } catch (err) {
    console.error(err)
    showToast('Error', err.message || 'Something went wrong', 'alert-circle')
  } finally {
    sending.value = false
  }
}

const breadcrumbs = computed(() => {
    return [
        {
            label: __('Notifications'),
            route: { name: 'Notifications' },
        },
    ]
})

usePageMeta(() => ({
    title: 'Notifications',
    icon: brand.favicon,
}))

</script>

<style>
.notification strong {
    font-weight: 400;
}
.notification b {
    font-weight: 400;
}
</style>