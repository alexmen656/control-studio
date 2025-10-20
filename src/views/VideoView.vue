<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const API_URL = 'http://localhost:6709/api'

interface Video {
    id: string
    title: string
    thumbnail: string
    duration: string
    size: string
    uploadDate: Date | string
    status: 'ready' | 'uploading' | 'processing' | 'scheduled' | 'published' | 'failed' | 'awaiting-details'
    progress?: number
    platforms: Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>
    views?: number
    filename?: string
    originalName?: string
    description?: string
    tags?: string[]
    scheduledDate?: Date | string
}

interface PlatformAnalytics {
    platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook'
    views: number
    likes: number
    comments: number
    shares: number
    engagement: number
    publishDate?: Date | string
    status: 'published' | 'scheduled' | 'pending'
}

const currentVideo = ref<Video | null>(null)
const isLoading = ref(true)
const showScheduleModal = ref(false)
const showEditModal = ref(false)
const selectedPlatforms = ref<Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>>([])
const scheduleDate = ref('')
const scheduleTime = ref('')

const platformAnalytics = ref<PlatformAnalytics[]>([])

const videoDetailsForm = ref({
    title: '',
    description: '',
    tags: '',
    platforms: [] as Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>
})

const loadVideo = async () => {
    try {
        isLoading.value = true
        const response = await axios.get(`${API_URL}/videos/${route.params.id}`)
        currentVideo.value = {
            ...response.data,
            uploadDate: new Date(response.data.uploadDate),
            scheduledDate: response.data.scheduledDate ? new Date(response.data.scheduledDate) : undefined
        }

        if (currentVideo.value.status === 'published' || currentVideo.value.status === 'scheduled') {
            generateMockAnalytics()
        }

        if (currentVideo.value) {
            videoDetailsForm.value = {
                title: currentVideo.value.title,
                description: currentVideo.value.description || '',
                tags: currentVideo.value.tags?.join(', ') || '',
                platforms: currentVideo.value.platforms || []
            }
        }
    } catch (error) {
        console.error('Error loading video:', error)
    } finally {
        isLoading.value = false
    }
}

const publishVideo = async () => {
    if (!currentVideo.value) return

    try {
        const response = await axios.post(`${API_URL}/publish`, {
            videoId: currentVideo.value.id,
            platform: currentVideo.value.platforms
        })

        if (response.data) {
            console.log('Video published successfully', response.data)
        }
    } catch (error) {
        console.error('Error publishing video:', error)
    }
}

const generateMockAnalytics = () => {
    if (!currentVideo.value) return

    platformAnalytics.value = currentVideo.value.platforms.map(platform => {
        const baseViews = Math.floor(Math.random() * 100000) + 5000
        const status = currentVideo.value!.status === 'published' ? 'published' : 'scheduled'

        return {
            platform,
            views: baseViews,
            likes: Math.floor(baseViews * (Math.random() * 0.1 + 0.02)),
            comments: Math.floor(baseViews * (Math.random() * 0.02 + 0.005)),
            shares: Math.floor(baseViews * (Math.random() * 0.05 + 0.01)),
            engagement: Math.random() * 8 + 2,
            publishDate: status === 'published'
                ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                : currentVideo.value!.scheduledDate,
            status
        }
    })
}

const togglePlatform = (platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook') => {
    const index = videoDetailsForm.value.platforms.indexOf(platform)
    if (index > -1) {
        videoDetailsForm.value.platforms.splice(index, 1)
    } else {
        videoDetailsForm.value.platforms.push(platform)
    }
}

const saveVideoDetails = async () => {
    if (!currentVideo.value) return

    try {
        const response = await axios.patch(`${API_URL}/videos/${currentVideo.value.id}`, {
            title: videoDetailsForm.value.title,
            description: videoDetailsForm.value.description,
            tags: videoDetailsForm.value.tags.split(',').map(t => t.trim()).filter(t => t),
            platforms: videoDetailsForm.value.platforms
        })

        if (response.data) {
            currentVideo.value = {
                ...currentVideo.value,
                ...response.data.video
            }
            showEditModal.value = false
        }
    } catch (error) {
        console.error('Error saving video details:', error)
    }
}

const scheduleVideo = async () => {
    if (!currentVideo.value || !scheduleDate.value || !scheduleTime.value) return

    try {
        const scheduledDateTime = new Date(`${scheduleDate.value}T${scheduleTime.value}`)

        const response = await axios.patch(`${API_URL}/videos/${currentVideo.value.id}`, {
            status: 'scheduled',
            scheduledDate: scheduledDateTime.toISOString(),
            platforms: selectedPlatforms.value
        })

        if (response.data) {
            currentVideo.value = {
                ...currentVideo.value,
                status: 'scheduled',
                scheduledDate: scheduledDateTime,
                platforms: selectedPlatforms.value
            }
            showScheduleModal.value = false
            generateMockAnalytics()
        }
    } catch (error) {
        console.error('Error scheduling video:', error)
    }
}

const deleteVideo = async () => {
    if (!currentVideo.value || !confirm('Delete this video permanently?')) return

    try {
        await axios.delete(`${API_URL}/videos/${currentVideo.value.id}`)
        router.push({ name: 'home' })
    } catch (error) {
        console.error('Error deleting video:', error)
    }
}

const openScheduleModal = () => {
    selectedPlatforms.value = currentVideo.value?.platforms || []
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    scheduleDate.value = tomorrow.toISOString().split('T')[0]
    scheduleTime.value = '12:00'
    showScheduleModal.value = true
}

onMounted(() => {
    loadVideo()
})

const getStatusColor = (status: string) => {
    const colors = {
        ready: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        uploading: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        'awaiting-details': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
    return colors[status as keyof typeof colors] || colors.ready
}

const getPlatformIcon = (platform: string) => {
    const icons = {
        instagram: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        tiktok: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>`,
        youtube: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        facebook: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    }
    return icons[platform as keyof typeof icons] || ''
}

const getPlatformColor = (platform: string) => {
    const colors = {
        instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
        tiktok: 'bg-black',
        youtube: 'bg-red-600',
        facebook: 'bg-blue-600'
    }
    return colors[platform as keyof typeof colors] || 'bg-gray-600'
}

const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatViews = (views?: number) => {
    if (!views) return '0'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
}

const totalAnalytics = computed(() => {
    return platformAnalytics.value.reduce((acc, platform) => ({
        views: acc.views + platform.views,
        likes: acc.likes + platform.likes,
        comments: acc.comments + platform.comments,
        shares: acc.shares + platform.shares
    }), { views: 0, likes: 0, comments: 0, shares: 0 })
})

const averageEngagement = computed(() => {
    if (platformAnalytics.value.length === 0) return 0
    const total = platformAnalytics.value.reduce((sum, p) => sum + p.engagement, 0)
    return (total / platformAnalytics.value.length).toFixed(1)
})

</script>

<template>
    <div class="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Loading video...</p>
            </div>
        </div>
        <div v-else-if="!currentVideo" class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <svg class="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Video Not Found</h2>
                <p class="text-gray-600 dark:text-gray-400 mb-6">The video you're looking for doesn't exist.</p>
                <button @click="router.push({ name: 'home' })"
                    class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                    Back to Videos
                </button>
            </div>
        </div>
        <div v-else class="flex-1 overflow-y-auto">
            <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex-1 mr-6">
                        <div class="flex items-center gap-3 mb-2">
                            <button @click="router.push({ name: 'home' })"
                                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ currentVideo.title }}
                            </h1>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Uploaded {{ formatDate(currentVideo.uploadDate) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span v-if="currentVideo.status === 'ready'"
                            class="px-4 py-2 rounded-full font-medium text-smbg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            @click="publishVideo()">
                            Publish
                        </span>
                        <span
                            :class="['px-4 py-2 rounded-full font-medium text-sm', getStatusColor(currentVideo.status)]">
                            {{ currentVideo.status.charAt(0).toUpperCase() + currentVideo.status.slice(1).replace('-',
                                '') }}
                        </span>
                        <button @click="showEditModal = true"
                            class="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            title="Edit">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button @click="deleteVideo"
                            class="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            title="Delete">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-6">
                        <div
                            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="aspect-video bg-gray-900 flex items-center justify-center">
                                <video v-if="currentVideo.filename" controls class="w-full h-full">
                                    <source :src="`http://localhost:6709/uploads/${currentVideo.filename}`"
                                        type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                                <div v-else class="text-center">
                                    <svg class="w-24 h-24 text-gray-600 mx-auto mb-4" fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <p class="text-gray-400">Video preview not available</p>
                                </div>
                            </div>
                        </div>
                        <div
                            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h3>
                            <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {{ currentVideo.description || 'No description provided.' }}
                            </p>
                            <div v-if="currentVideo.tags && currentVideo.tags.length > 0"
                                class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="tag in currentVideo.tags" :key="tag"
                                        class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                                        #{{ tag }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-if="platformAnalytics.length > 0 && '1' == '2'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
                            dark:border-gray-700 p-6"><!-- Temporarily disable analytics
                            display because I had no time to finish it-->
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Performance
                                Analytics</h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                                        formatViews(totalAnalytics.views) }}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Views</div>
                                </div>
                                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                                        formatViews(totalAnalytics.likes) }}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Likes</div>
                                </div>
                                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                                        formatViews(totalAnalytics.comments) }}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Comments</div>
                                </div>
                                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                                        averageEngagement }}%</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Engagement</div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Breakdown</h4>
                                <div v-for="analytics in platformAnalytics" :key="analytics.platform"
                                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            <div
                                                :class="['w-10 h-10 rounded-lg flex items-center justify-center text-white', getPlatformColor(analytics.platform)]">
                                                <div v-html="getPlatformIcon(analytics.platform)"></div>
                                            </div>
                                            <div>
                                                <div class="font-medium text-gray-900 dark:text-gray-100 capitalize">{{
                                                    analytics.platform }}</div>
                                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                                    {{ analytics.status === 'published' ? `Published
                                                    ${formatDate(analytics.publishDate!)}` : `Scheduled for
                                                    ${formatDate(analytics.publishDate!)}` }}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            :class="['px-3 py-1 rounded-full text-xs font-medium', analytics.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300']">
                                            {{ analytics.status }}
                                        </span>
                                    </div>
                                    <div class="grid grid-cols-4 gap-3 text-center">
                                        <div>
                                            <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                                formatViews(analytics.views) }}</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">Views</div>
                                        </div>
                                        <div>
                                            <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                                formatViews(analytics.likes) }}</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                                        </div>
                                        <div>
                                            <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                                formatViews(analytics.comments) }}</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">Comments</div>
                                        </div>
                                        <div>
                                            <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                                analytics.engagement.toFixed(1) }}%</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div
                            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                            <div class="space-y-3">
                                <button @click="openScheduleModal"
                                    :disabled="currentVideo.status === 'scheduled' || currentVideo.status === 'published'"
                                    :class="[
                                        'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors',
                                        currentVideo.status === 'scheduled' || currentVideo.status === 'published'
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
                                    ]">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Schedule Post
                                </button>
                                <button @click="showEditModal = true"
                                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit Details
                                </button>
                                <button @click="deleteVideo"
                                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Delete Video
                                </button>
                            </div>
                        </div>

                        <div
                            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Target Platforms
                            </h3>
                            <div v-if="currentVideo.platforms && currentVideo.platforms.length > 0" class="space-y-3">
                                <div v-for="platform in currentVideo.platforms" :key="platform"
                                    class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div
                                        :class="['w-10 h-10 rounded-lg flex items-center justify-center text-white', getPlatformColor(platform)]">
                                        <div v-html="getPlatformIcon(platform)"></div>
                                    </div>
                                    <span class="font-medium text-gray-900 dark:text-gray-100 capitalize">{{ platform
                                    }}</span>
                                </div>
                            </div>
                            <p v-else class="text-sm text-gray-500 dark:text-gray-400">No platforms selected</p>
                        </div>
                        <div
                            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Video Info</h3>
                            <dl class="space-y-3 text-sm">
                                <div class="flex justify-between">
                                    <dt class="text-gray-500 dark:text-gray-400">Duration</dt>
                                    <dd class="font-medium text-gray-900 dark:text-gray-100">{{ currentVideo.duration }}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-gray-500 dark:text-gray-400">File Size</dt>
                                    <dd class="font-medium text-gray-900 dark:text-gray-100">{{ currentVideo.size }}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-gray-500 dark:text-gray-400">Format</dt>
                                    <dd class="font-medium text-gray-900 dark:text-gray-100">{{
                                        currentVideo.filename?.split('.').pop()?.toUpperCase() || 'MP4' }}</dd>
                                </div>
                                <div v-if="currentVideo.scheduledDate" class="flex justify-between">
                                    <dt class="text-gray-500 dark:text-gray-400">Scheduled For</dt>
                                    <dd class="font-medium text-purple-600 dark:text-purple-400">{{
                                        formatDate(currentVideo.scheduledDate) }}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showScheduleModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="showScheduleModal = false">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                @click.stop>
                <div
                    class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Schedule Video</h2>
                        <button @click="showScheduleModal = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="px-8 py-6 space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                            <input v-model="scheduleDate" type="date" required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                            <input v-model="scheduleTime" type="time" required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select
                            Platforms</label>
                        <div class="grid grid-cols-2 gap-3">
                            <button v-for="platform in ['instagram', 'tiktok', 'youtube', 'facebook']" :key="platform"
                                @click="() => {
                                    const idx = selectedPlatforms.indexOf(platform as any)
                                    if (idx > -1) selectedPlatforms.splice(idx, 1)
                                    else selectedPlatforms.push(platform as any)
                                }" :class="[
                                    'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                                    selectedPlatforms.includes(platform as any)
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                ]">
                                <div
                                    :class="['w-10 h-10 rounded-lg flex items-center justify-center text-white', getPlatformColor(platform)]">
                                    <div v-html="getPlatformIcon(platform)"></div>
                                </div>
                                <span class="font-medium text-gray-900 dark:text-gray-100 capitalize">{{ platform
                                }}</span>
                                <div v-if="selectedPlatforms.includes(platform as any)" class="ml-auto">
                                    <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    class="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-end gap-3">
                    <button @click="showScheduleModal = false"
                        class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                        Cancel
                    </button>
                    <button @click="scheduleVideo"
                        :disabled="!scheduleDate || !scheduleTime || selectedPlatforms.length === 0" :class="[
                            'px-6 py-2 rounded-lg font-medium transition-colors',
                            !scheduleDate || !scheduleTime || selectedPlatforms.length === 0
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
                        ]">
                        Schedule Post
                    </button>
                </div>
            </div>
        </div>
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="showEditModal = false">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                @click.stop>
                <div
                    class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Video Details</h2>
                        <button @click="showEditModal = false"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="px-8 py-6 space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video Title
                            *</label>
                        <input v-model="videoDetailsForm.title" type="text" required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Enter video title" />
                    </div>
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea v-model="videoDetailsForm.description" rows="4"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                            placeholder="Describe your video..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                        <input v-model="videoDetailsForm.tags" type="text"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="tutorial, cooking, funny (comma separated)" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Target
                            Platforms</label>
                        <div class="grid grid-cols-2 gap-3">
                            <button v-for="platform in ['instagram', 'tiktok', 'youtube', 'facebook']" :key="platform"
                                @click="togglePlatform(platform as any)" :class="[
                                    'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                                    videoDetailsForm.platforms.includes(platform as any)
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                ]">
                                <div
                                    :class="['w-10 h-10 rounded-lg flex items-center justify-center text-white', getPlatformColor(platform)]">
                                    <div v-html="getPlatformIcon(platform)"></div>
                                </div>
                                <span class="font-medium text-gray-900 dark:text-gray-100 capitalize">{{ platform
                                }}</span>
                                <div v-if="videoDetailsForm.platforms.includes(platform as any)" class="ml-auto">
                                    <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    class="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-end gap-3">
                    <button @click="showEditModal = false"
                        class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                        Cancel
                    </button>
                    <button @click="saveVideoDetails" :disabled="!videoDetailsForm.title" :class="[
                        'px-6 py-2 rounded-lg font-medium transition-colors',
                        !videoDetailsForm.title
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
                    ]">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
}

@media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-thumb {
        background: #4a5568;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #718096;
    }
}
</style>
