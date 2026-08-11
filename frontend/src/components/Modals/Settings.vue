<template>
	<Dialog v-model="show" :options="{ size: '4xl' }">
		<template #body>
			<div class="flex h-[calc(100vh_-_8rem)]">
				<div class="flex w-52 shrink-0 flex-col bg-surface-gray-2 p-2">
					<h1 class="mb-3 px-2 pt-2 text-lg font-semibold text-ink-gray-9">
						{{ __('Settings') }}
					</h1>
					<div v-for="tab in tabs" :key="tab.label">
						<div
							v-if="!tab.hideLabel"
							class="mb-2 mt-3 flex cursor-pointer gap-1.5 px-1 text-base font-medium text-ink-gray-5 transition-all duration-300 ease-in-out"
						>
							<span>{{ __(tab.label) }}</span>
						</div>
						<nav class="space-y-1">
							<SidebarLink
								v-for="item in tab.items"
								:link="item"
								:key="item.label"
								class="w-full"
								:class="
									activeTab?.label == item.label
										? 'bg-surface-selected shadow-sm'
										: 'hover:bg-surface-gray-2'
								"
								@click="activeTab = item"
							/>
						</nav>
					</div>
				</div>
				<div
					v-if="activeTab && data.doc"
					:key="activeTab.label"
					class="flex flex-1 flex-col px-10 py-8 bg-surface-modal"
				>
					<Members
						v-if="activeTab.label === __('Members')"
						:label="activeTab.label"
						:description="activeTab.description"
						v-model:show="show"
					/>
					<Evaluators
						v-else-if="activeTab.label === __('Evaluators')"
						:label="activeTab.label"
						:description="activeTab.description"
						v-model:show="show"
					/>
					<Categories
						v-else-if="activeTab.label === __('Categories')"
						:label="activeTab.label"
						:description="activeTab.description"
					/>
					<PaymentSettings
						v-else-if="activeTab.label === __('Payment Gateway')"
						:label="activeTab.label"
						:description="activeTab.description"
						:data="data"
						:fields="activeTab.fields"
					/>
					<BrandSettings
						v-else-if="activeTab.label === __('Branding')"
						:label="activeTab.label"
						:description="activeTab.description"
						:fields="activeTab.fields"
						:data="branding"
					/>
					<SettingDetails
						v-else
						:fields="activeTab.fields"
						:label="activeTab.label"
						:description="activeTab.description"
						:data="data"
					/>
				</div>
			</div>
		</template>
	</Dialog>
</template>
<script setup>
import { Dialog, createDocumentResource, createResource } from 'frappe-ui'
import { ref, computed, watch } from 'vue'
import { useSettings } from '@/stores/settings'
import SettingDetails from '../SettingDetails.vue'
import SidebarLink from '@/components/SidebarLink.vue'
import Members from '@/components/Members.vue'
import Evaluators from '@/components/Evaluators.vue'
import Categories from '@/components/Categories.vue'
import BrandSettings from '@/components/BrandSettings.vue'
import PaymentSettings from '@/components/PaymentSettings.vue'

const show = defineModel()
const doctype = ref('LMS Settings')
const activeTab = ref(null)
const settingsStore = useSettings()

const data = createDocumentResource({
	doctype: doctype.value,
	name: doctype.value,
	fields: ['*'],
	cache: doctype.value,
	auto: true,
})

const branding = createResource({
	url: 'lms.lms.api.get_branding',
	auto: true,
	cache: 'brand',
})

const tabsStructure = computed(() => {
	return [
		{
			label: __('Settings'),
			hideLabel: true,
			items: [
				{
					label: __('General'),
					icon: 'Wrench',
					fields: [
						{
							label: __('Enable Learning Paths'),
							name: 'enable_learning_paths',
							description:
								__('This will enforce students to go through programs assigned to them in the correct order.'),
							type: 'checkbox',
						},
						{
							label: __('Allow Guest Access'),
							name: 'allow_guest_access',
							description:
								__('If enabled, users can access the course and batch lists without logging in.'),
							type: 'checkbox',
						},
						{
							label: __('Send calendar invite for evaluations'),
							name: 'send_calendar_invite_for_evaluations',
							description:
								__('If enabled, it sends google calendar invite to the student for evaluations.'),
							type: 'checkbox',
						},
						{
							label: __('Unsplash Access Key'),
							name: 'unsplash_access_key',
							description:
								__('Optional. If this is set, students can pick a cover image from the unsplash library for their profile page. https://unsplash.com/documentation#getting-started.'),
							type: 'password',
						},
					],
				},
			],
		},
		{
			label: __('Settings'),
			hideLabel: true,
			items: [
				{
					label: __('Payment Gateway'),
					icon: 'DollarSign',
					description:
						__('Configure the payment gateway and other payment related settings'),
					fields: [
						{
							label: __('Payment Gateway'),
							name: 'payment_gateway',
							type: 'Link',
							doctype: 'Payment Gateway',
						},
						{
							label: __('Default Currency'),
							name: 'default_currency',
							type: 'Link',
							doctype: 'Currency',
						},
						{
							label: __('Apply GST for India'),
							name: 'apply_gst',
							type: 'checkbox',
						},
						{
							label: __('Show USD equivalent amount'),
							name: 'show_usd_equivalent',
							type: 'checkbox',
						},
						{
							label: __('Apply rounding on equivalent'),
							name: 'apply_rounding',
							type: 'checkbox',
						},
					],
				},
			],
		},
		{
			label: __('Lists'),
			hideLabel: false,
			items: [
				{
					label: __('Members'),
					description: __('Manage the members of your learning system'),
					icon: 'UserRoundPlus',
				},
				{
					label: __('Evaluators'),
					description: __('Manage the evaluators of your learning system'),
					icon: 'UserCheck',
				},
				{
					label: __('Categories'),
					description: __('Manage the members of your learning system'),
					icon: 'Network',
				},
			],
		},
		{
			label: __('Customise'),
			hideLabel: false,
			items: [
				{
					label: __('Branding'),
					icon: 'Blocks',
					fields: [
						{
							label: __('Brand Name'),
							name: 'app_name',
							type: 'text',
						},
						{
							label: __('Logo'),
							name: 'banner_image',
							type: 'Upload',
						},
						{
							label: __('Favicon'),
							name: 'favicon',
							type: 'Upload',
						},
						{
							label: __('Footer Logo'),
							name: 'footer_logo',
							type: 'Upload',
						},
						{
							label: __('Address'),
							name: 'address',
							type: 'textarea',
							rows: 2,
						},
						{
							label: __('Footer "Powered By"'),
							name: 'footer_powered',
							type: 'textarea',
							rows: 4,
						},
						{
							label: __('Copyright'),
							name: 'copyright',
							type: 'text',
						},
					],
				},
				{
					label: __('Sidebar'),
					icon: 'PanelLeftIcon',
					description: __('Choose the items you want to show in the sidebar'),
					fields: [
						{
							label: __('Courses'),
							name: 'courses',
							type: 'checkbox',
						},
						{
							label: __('Batches'),
							name: 'batches',
							type: 'checkbox',
						},
						{
							label: __('Certified Participants'),
							name: 'certified_participants',
							type: 'checkbox',
						},
						{
							type: 'Column Break',
						},
						{
							label: __('Jobs'),
							name: 'jobs',
							type: 'checkbox',
						},
						{
							label: __('Statistics'),
							name: 'statistics',
							type: 'checkbox',
						},
						{
							label: __('Notifications'),
							name: 'notifications',
							type: 'checkbox',
						},
					],
				},
				{
					label: __('Email Templates'),
					icon: 'MailPlus',
					fields: [
						{
							label: __('Batch Confirmation Template'),
							name: 'batch_confirmation_template',
							doctype: 'Email Template',
							type: 'Link',
						},
						{
							label: __('Certification Template'),
							name: 'certification_template',
							doctype: 'Email Template',
							type: 'Link',
						},
						{
							label: __('Assignment Submission Template'),
							name: 'assignment_submission_template',
							doctype: 'Email Template',
							type: 'Link',
						},
					],
				},
				{
					label: __('Signup'),
					icon: 'LogIn',
					fields: [
						{
							label: __('Custom Content'),
							name: 'custom_signup_content',
							type: 'Code',
							mode: 'htmlmixed',
							rows: 10,
						},
						{
							label: __('Ask for Occupation'),
							name: 'user_category',
							type: 'checkbox',
							description:
								__('Enable this option to ask users to select their occupation during the signup process.'),
						},
					],
				},
			],
		},
	]
})

const tabs = computed(() => {
	return tabsStructure.value.map((tab) => {
		return {
			...tab,
			items: tab.items.filter((item) => {
				return !item.condition || item.condition()
			}),
		}
	})
})

watch(show, async () => {
	if (show.value) {
		const currentTab = await tabs.value
			.flatMap((tab) => tab.items)
			.find((item) => item.label === settingsStore.activeTab)
		activeTab.value = currentTab || tabs.value[0].items[0]
	} else {
		activeTab.value = null
		settingsStore.isSettingsOpen = false
	}
})
</script>
