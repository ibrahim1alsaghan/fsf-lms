import { toast } from 'frappe-ui'
import { useTimeAgo } from '@vueuse/core'
import { Quiz } from '@/utils/quiz'
import { Assignment } from '@/utils/assignment'
import { Upload } from '@/utils/upload'
import { Markdown } from '@/utils/markdownParser'
import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import { CodeBox } from '@/utils/code'
import NestedList from '@editorjs/nested-list'
import InlineCode from '@editorjs/inline-code'
import { watch } from 'vue'
import dayjs from '@/utils/dayjs'
import Embed from '@editorjs/embed'
import SimpleImage from '@editorjs/simple-image'
import Table from '@editorjs/table'

export function createToast(options) {
	toast({
		position: 'bottom-right',
		...options,
	})
}

export function timeAgo(date) {
	const result = useTimeAgo(date, {
		messages: {
			justNow: __('just now'),
			past: (n) => {
				// n is already a formatted string like "3 hours" or "3 ساعة"
				// For Arabic "منذ %s" means "ago %s" -> "منذ 3 ساعة"
				const template = __('%s ago')
				return template.replace('%s', n)
			},
			future: (n) => {
				const template = __('in %s')
				return template.replace('%s', n)
			},
			month: (n, past) => {
				if (n === 1) {
					return past ? __('last month') : __('next month')
				}
				return __('%s months').replace('%s', String(n))
			},
			year: (n, past) => {
				if (n === 1) {
					return past ? __('last year') : __('next year')
				}
				return __('%s years').replace('%s', String(n))
			},
			day: (n, past) => {
				if (n === 1) {
					return past ? __('yesterday') : __('tomorrow')
				}
				return __('%s days').replace('%s', String(n))
			},
			week: (n, past) => {
				if (n === 1) {
					return past ? __('last week') : __('next week')
				}
				return __('%s weeks').replace('%s', String(n))
			},
			hour: (n) => __('%s hours').replace('%s', String(n)),
			minute: (n) => __('%s minutes').replace('%s', String(n)),
			second: (n) => __('%s seconds').replace('%s', String(n)),
		},
	})
	return result.value
}

export function formatTime(timeString) {
	if (!timeString) return ''
	const [hour, minute] = timeString.split(':').map(Number)

	// Create a Date object with dummy values for day, month, and year
	const dummyDate = new Date(0, 0, 0, hour, minute)

	// Use Intl.DateTimeFormat to format the time in 12-hour format
	const formattedTime = new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	}).format(dummyDate)

	return formattedTime
}

export function formatNumber(number) {
	return number.toLocaleString('en-IN', {
		maximumFractionDigits: 0,
	})
}

export function formatNumberIntoCurrency(number, currency) {
	if (number) {
		return number.toLocaleString('en-IN', {
			maximumFractionDigits: 0,
			style: 'currency',
			currency: currency,
		})
	}
	return ''
}

// create a function that formats numbers in thousands to k

export function formatAmount(amount) {
	if (amount > 999) {
		return (amount / 1000).toFixed(1) + 'k'
	}
	return amount
}

export function convertToTitleCase(str) {
	if (!str) {
		return ''
	}

	return str
		.toLowerCase()
		.split(' ')
		.map(function (word) {
			return word.charAt(0).toUpperCase().concat(word.substr(1))
		})
		.join(' ')
}
export function getFileSize(file_size) {
	let value = parseInt(file_size)
	if (value > 1048576) {
		return (value / 1048576).toFixed(2) + 'M'
	} else if (value > 1024) {
		return (value / 1024).toFixed(2) + 'K'
	}
	return value
}

export function showToast(title, text, icon) {
	if (icon === 'check') {
		toast.success(text || title)
	} else if (icon === 'alert-circle') {
		toast.warning(text || title)
	} else {
		toast.error(text || title)
	}
}


export function getImgDimensions(imgSrc) {
	return new Promise((resolve) => {
		let img = new Image()
		img.onload = function () {
			let { width, height } = img
			resolve({ width, height, ratio: width / height })
		}
		img.src = imgSrc
	})
}

export function updateDocumentTitle(meta) {
	watch(
		() => meta,
		(meta) => {
			if (!meta.value.title) return
			if (meta.value.title && meta.value.subtitle) {
				document.title = `${meta.value.title} | ${meta.value.subtitle}`
				return
			}
			if (meta.value.title) {
				document.title = `${meta.value.title}`
				return
			}
		},
		{ immediate: true, deep: true }
	)
}

export function htmlToText(html) {
	const div = document.createElement('div')
	div.innerHTML = html
	return div.textContent || div.innerText || ''
}

const t = (s) => (window.__ ? window.__(s) : s)

export function getEditorTools() {
	return {
		header: {
			class: Header,
			config: { placeholder: t('Header') },
			toolbox: { title: t('Heading') },   //picker label
		},
		quiz: Quiz,
		assignment: Assignment,
		upload: Upload,
		markdown: {
			class: Markdown,
			inlineToolbar: true,
			toolbox: { title: t('Markdown') },
		},
		image: SimpleImage,
		table: {
			class: Table,
			inlineToolbar: true,
			toolbox: { title: t('Table') },
		},
		paragraph: {
			class: Paragraph,
			inlineToolbar: true,
			config: { preserveBlank: true },
			toolbox: { title: t('Text') },
		},
		codeBox: {
			class: CodeBox,
			config: { useDefaultTheme: 'dark' },
			toolbox: { title: t('CodeBox') },
		},
		list: {
			class: NestedList,
			inlineToolbar: true,
			config: { defaultStyle: 'ordered' },
			toolbox: { title: t('List') },
		},
		inlineCode: {
			class: InlineCode,
			shortcut: 'CMD+SHIFT+M',
		},
		embed: {
			class: Embed,
			inlineToolbar: false,
			config: {
				services: {
					youtube: {
						regex: /(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be\/)|(?:youtube\.com)\/(?:v\/|u\/\w\/|embed\/|watch))(?:(?:\?v=)?([^#&?=]*))?((?:[?&]\w*=\w*)*)/,
						embedUrl:
							'https://www.youtube.com/embed/<%= remote_id %>',
						html: '<iframe style="width:100%; height: 30rem;" frameborder="0" allowfullscreen></iframe>',
						height: 320,
						width: 580,
						id: ([id, params]) => {
							if (!params && id) {
								return id
							}

							const paramsMap = {
								start: 'start',
								end: 'end',
								t: 'start',
								// eslint-disable-next-line camelcase
								time_continue: 'start',
								list: 'list',
							}

							let newParams = params
								.slice(1)
								.split('&')
								.map((param) => {
									const [name, value] = param.split('=')

									if (!id && name === 'v') {
										id = value

										return null
									}

									if (!paramsMap[name]) {
										return null
									}

									if (
										value === 'LL' ||
										value.startsWith('RDMM') ||
										value.startsWith('FL')
									) {
										return null
									}

									return `${paramsMap[name]}=${value}`
								})
								.filter((param) => !!param)

							return id + '?' + newParams.join('&')
						},
					},
					vimeo: true,
					codepen: true,
					aparat: {
						regex: /(?:http[s]?:\/\/)?(?:www.)?aparat\.com\/v\/([^\/\?\&]+)\/?/,
						embedUrl:
							'https://www.aparat.com/video/video/embed/videohash/<%= remote_id %>/vt/frame',
						html: '<iframe style="margin: 0 auto; width: 100%; height: 25rem;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
						height: 300,
						width: 600,
					},
					github: true,
					slides: {
						regex: /https:\/\/docs\.google\.com\/presentation\/d\/([A-Za-z0-9_-]+)\/pub/,
						embedUrl:
							'https://docs.google.com/presentation/d/<%= remote_id %>/embed',
						html: "<iframe style='width: 100%; height: 30rem; border: 1px solid #D3D3D3; border-radius: 12px; margin: 1rem 0' frameborder='0' allowfullscreen='true'></iframe>",
					},
					drive: {
						regex: /https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)\/view(\?.+)?/,
						embedUrl:
							'https://drive.google.com/file/d/<%= remote_id %>/preview',
						html: "<iframe style='width: 100%; height: 25rem; border: 1px solid #D3D3D3; border-radius: 12px;' frameborder='0' allowfullscreen='true'></iframe>",
					},
					docsPublic: {
						regex: /https:\/\/docs\.google\.com\/document\/d\/([A-Za-z0-9_-]+)\/edit(\?.+)?/,
						embedUrl:
							'https://docs.google.com/document/d/<%= remote_id %>/preview',
						html: "<iframe style='width: 100%; height: 40rem; border: 1px solid #D3D3D3; border-radius: 12px;' frameborder='0' allowfullscreen='true'></iframe>",
					},
					sheetsPublic: {
						regex: /https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]+)\/edit(\?.+)?/,
						embedUrl:
							'https://docs.google.com/spreadsheets/d/<%= remote_id %>/preview',
						html: "<iframe style='width: 100%; height: 40rem; border: 1px solid #D3D3D3; border-radius: 12px;' frameborder='0' allowfullscreen='true'></iframe>",
					},
					slidesPublic: {
						regex: /https:\/\/docs\.google\.com\/presentation\/d\/([A-Za-z0-9_-]+)\/edit(\?.+)?/,
						embedUrl:
							'https://docs.google.com/presentation/d/<%= remote_id %>/embed',
						html: "<iframe style='width: 100%; height: 30rem; border: 1px solid #D3D3D3; border-radius: 12px; margin: 1rem 0;' frameborder='0' allowfullscreen='true'></iframe>",
					},
					codesandbox: {
						regex: /^https:\/\/codesandbox\.io\/(?:embed\/)?([A-Za-z0-9_-]+)(?:\?[^\/]*)?$/,
						embedUrl:
							'https://codesandbox.io/embed/<%= remote_id %>?view=editor+%2B+preview&module=%2Findex.html',
						html: "<iframe style='width: 100%; height: 500px; border: 0; border-radius: 4px; overflow: hidden;' sandbox='allow-mods allow-forms allow-popups allow-scripts allow-same-origin' frameborder='0' allowfullscreen='true'></iframe>",
					},
				},
			},
		},
	}
}

export function getTimezones() {
	return [
		'Pacific/Midway',
		'Pacific/Pago_Pago',
		'Pacific/Honolulu',
		'America/Anchorage',
		'America/Vancouver',
		'America/Los_Angeles',
		'America/Tijuana',
		'America/Edmonton',
		'America/Denver',
		'America/Phoenix',
		'America/Mazatlan',
		'America/Winnipeg',
		'America/Regina',
		'America/Chicago',
		'America/Mexico_City',
		'America/Guatemala',
		'America/El_Salvador',
		'America/Managua',
		'America/Costa_Rica',
		'America/Montreal',
		'America/New_York',
		'America/Indianapolis',
		'America/Panama',
		'America/Bogota',
		'America/Lima',
		'America/Halifax',
		'America/Puerto_Rico',
		'America/Caracas',
		'America/Santiago',
		'America/St_Johns',
		'America/Montevideo',
		'America/Araguaina',
		'America/Argentina/Buenos_Aires',
		'America/Godthab',
		'America/Sao_Paulo',
		'Atlantic/Azores',
		'Canada/Atlantic',
		'Atlantic/Cape_Verde',
		'UTC',
		'Etc/Greenwich',
		'Europe/Belgrade',
		'CET',
		'Atlantic/Reykjavik',
		'Europe/Dublin',
		'Europe/London',
		'Europe/Lisbon',
		'Africa/Casablanca',
		'Africa/Nouakchott',
		'Europe/Oslo',
		'Europe/Copenhagen',
		'Europe/Brussels',
		'Europe/Berlin',
		'Europe/Helsinki',
		'Europe/Amsterdam',
		'Europe/Rome',
		'Europe/Stockholm',
		'Europe/Vienna',
		'Europe/Luxembourg',
		'Europe/Paris',
		'Europe/Zurich',
		'Europe/Madrid',
		'Africa/Bangui',
		'Africa/Algiers',
		'Africa/Tunis',
		'Africa/Harare',
		'Africa/Nairobi',
		'Europe/Warsaw',
		'Europe/Prague',
		'Europe/Budapest',
		'Europe/Sofia',
		'Europe/Istanbul',
		'Europe/Athens',
		'Europe/Bucharest',
		'Asia/Nicosia',
		'Asia/Beirut',
		'Asia/Damascus',
		'Asia/Jerusalem',
		'Asia/Amman',
		'Africa/Tripoli',
		'Africa/Cairo',
		'Africa/Johannesburg',
		'Europe/Moscow',
		'Asia/Baghdad',
		'Asia/Kuwait',
		'Asia/Riyadh',
		'Asia/Bahrain',
		'Asia/Qatar',
		'Asia/Aden',
		'Asia/Tehran',
		'Africa/Khartoum',
		'Africa/Djibouti',
		'Africa/Mogadishu',
		'Asia/Dubai',
		'Asia/Muscat',
		'Asia/Baku',
		'Asia/Kabul',
		'Asia/Yekaterinburg',
		'Asia/Tashkent',
		'Asia/Calcutta',
		'Asia/Kathmandu',
		'Asia/Novosibirsk',
		'Asia/Almaty',
		'Asia/Dacca',
		'Asia/Krasnoyarsk',
		'Asia/Dhaka',
		'Asia/Bangkok',
		'Asia/Saigon',
		'Asia/Jakarta',
		'Asia/Irkutsk',
		'Asia/Shanghai',
		'Asia/Hong_Kong',
		'Asia/Taipei',
		'Asia/Kuala_Lumpur',
		'Asia/Singapore',
		'Australia/Perth',
		'Asia/Yakutsk',
		'Asia/Seoul',
		'Asia/Tokyo',
		'Australia/Darwin',
		'Australia/Adelaide',
		'Asia/Vladivostok',
		'Pacific/Port_Moresby',
		'Australia/Brisbane',
		'Australia/Sydney',
		'Australia/Hobart',
		'Asia/Magadan',
		'SST',
		'Pacific/Noumea',
		'Asia/Kamchatka',
		'Pacific/Fiji',
		'Pacific/Auckland',
		'Asia/Kolkata',
		'Europe/Kiev',
		'America/Tegucigalpa',
		'Pacific/Apia',
	]
}

export function getUserTimezone() {
	try {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		const supportedTimezones = getTimezones()

		if (supportedTimezones.includes(timezone)) {
			return timezone // e.g., 'Asia/Calcutta', 'America/New_York', etc.
		} else {
			throw Error('unsupported timezone')
		}
	} catch (error) {
		console.error('Error getting timezone:', error)
		return null
	}
}

export function getSidebarLinks() {
	return [
		// {
		// 	label: 'Home',
		// 	icon: 'Home',
		// 	to: 'Home',
		// 	activeFor: ['Home'],
		// },
		{
			label: 'Courses',
			icon: 'BookOpen',
			to: 'Courses',
			activeFor: [
				'Courses',
				'CourseDetail',
				'Lesson',
				'CourseForm',
				'LessonForm',
			],
		},
		{
			label: 'Batches',
			icon: 'Users',
			to: 'Batches',
			activeFor: ['Batches', 'BatchDetail', 'Batch', 'BatchForm'],
		},
		{
			label: 'Certified Participants',
			icon: 'GraduationCap',
			to: 'CertifiedParticipants',
			activeFor: ['CertifiedParticipants'],
		},
		{
			label: 'Jobs',
			icon: 'Briefcase',
			to: 'Jobs',
			activeFor: ['Jobs', 'JobDetail'],
		},
		{
			label: 'Statistics',
			icon: 'TrendingUp',
			to: 'Statistics',
			activeFor: ['Statistics'],
		},
	]
}

export function getFormattedDateRange(
	startDate,
	endDate,
	format = 'DD MMM YYYY'
) {
	if (startDate === endDate) {
		return dayjs(startDate).format(format)
	}
	return `${dayjs(startDate).format(format)} - ${dayjs(endDate).format(
		format
	)}`
}

export function getLineStartPosition(string, position) {
	const charLength = 1
	let char = ''

	while (char !== '\n' && position > 0) {
		position = position - charLength
		char = string.substr(position, charLength)
	}

	if (char === '\n') {
		position += 1
	}

	return position
}

export function singularize(word) {
	const endings = {
		ves: 'fe',
		ies: 'y',
		i: 'us',
		zes: 'ze',
		ses: 's',
		es: 'e',
		s: '',
	}
	return word.replace(
		new RegExp(`(${Object.keys(endings).join('|')})$`),
		(r) => endings[r]
	)
}

export const validateFile = (file) => {
	let extension = file.name.split('.').pop().toLowerCase()
	if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
		return __('Only image file is allowed.')
	}
}

export const escapeHTML = (text) => {
	if (!text) return ''
	let escape_html_mapping = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'`': '&#x60;',
		'=': '&#x3D;',
	}

	return String(text).replace(
		/[&<>"'`=]/g,
		(char) => escape_html_mapping[char] || char
	)
}

export function getColor(colorName, shade) {
	const style = getComputedStyle(document.documentElement)
	const colorVar = `--${colorName}-${shade}`
	const color = style.getPropertyValue(colorVar).trim()
	return color || `var(${colorVar})`
}