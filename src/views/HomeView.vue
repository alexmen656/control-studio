<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const API_URL = 'http://localhost:6709/api'

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  size: string
  uploadDate: Date | string
  status: 'ready' | 'uploading' | 'processing' | 'scheduled' | 'published' | 'failed'
  progress?: number
  platforms: Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>
  views?: number
  filename?: string
  originalName?: string
}

const videos = ref<Video[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const selectedVideos = ref<Set<string>>(new Set())
const filterStatus = ref<string>('all')
const searchQuery = ref('')
const showUploadModal = ref(false)
const uploadingFiles = ref<File[]>([])
const uploadProgress = ref<{ [key: string]: number }>({})
const isLoading = ref(false)

const loadVideos = async () => {
  try {
    isLoading.value = true
    const response = await fetch(`${API_URL}/videos`)
    if (response.ok) {
      const data = await response.json()
      videos.value = data.map((v: any) => ({
        ...v,
        uploadDate: new Date(v.uploadDate)
      }))
    }
  } catch (error) {
    console.error('Error loading videos:', error)
  } finally {
    isLoading.value = false
  }
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const files = Array.from(input.files)
  await uploadFiles(files)
}

const uploadFiles = async (files: File[]) => {
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

      const tempId = `temp-${Date.now()}`
      videos.value.unshift({
        id: tempId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        thumbnail: 'https://via.placeholder.com/400x225',
        duration: '0:00',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date(),
        status: 'uploading',
        progress: 0,
        platforms: [],
        views: 0
      })

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const index = videos.value.findIndex(v => v.id === tempId)
        if (index !== -1) {
          videos.value[index] = {
            ...result.video,
            uploadDate: new Date(result.video.uploadDate)
          }
        }
      } else {
        const index = videos.value.findIndex(v => v.id === tempId)
        if (index !== -1) {
          videos.value[index].status = 'failed'
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  showUploadModal.value = false
}

const triggerFileUpload = () => {
  const input = document.getElementById('video-file-input') as HTMLInputElement
  if (input) input.click()
}

const deleteVideo = async (id: string) => {
  if (!confirm('Delete this video?')) return

  try {
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      videos.value = videos.value.filter(v => v.id !== id)
    }
  } catch (error) {
    console.error('Error deleting video:', error)
  }
}

const bulkDelete = async () => {
  if (!confirm(`Delete ${selectedVideos.value.size} selected videos?`)) return

  try {
    const response = await fetch(`${API_URL}/videos/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoIds: Array.from(selectedVideos.value) })
    })

    if (response.ok) {
      videos.value = videos.value.filter(v => !selectedVideos.value.has(v.id))
      selectedVideos.value.clear()
    }
  } catch (error) {
    console.error('Error bulk deleting videos:', error)
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'))
    if (videoFiles.length > 0) {
      uploadFiles(videoFiles)
    }
  }
}

onMounted(() => {
  loadVideos()
})

const filteredVideos = computed(() => {
  return videos.value.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = filterStatus.value === 'all' || video.status === filterStatus.value
    return matchesSearch && matchesFilter
  })
})

const selectAllVideos = () => {
  if (selectedVideos.value.size === filteredVideos.value.length) {
    selectedVideos.value.clear()
  } else {
    selectedVideos.value = new Set(filteredVideos.value.map(v => v.id))
  }
}

const toggleVideoSelection = (id: string) => {
  if (selectedVideos.value.has(id)) {
    selectedVideos.value.delete(id)
  } else {
    selectedVideos.value.add(id)
  }
}

const getStatusColor = (status: string) => {
  const colors = {
    ready: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    uploading: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
  return colors[status as keyof typeof colors] || colors.ready
}

const getPlatformIcon = (platform: string) => {
  const icons = {
    instagram: '📷',
    tiktok: '🎵',
    youtube: '▶️',
    facebook: '👥'
  }
  return icons[platform as keyof typeof icons] || '📱'
}

const bulkSchedule = () => {
  alert(`Schedule ${selectedVideos.value.size} videos`)
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatViews = (views?: number) => {
  if (!views) return 'N/A'
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Videos</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and upload your videos to multiple platforms
          </p>
        </div>
        <button @click="showUploadModal = true"
          class="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd" />
          </svg>
          <span class="font-medium">Upload Videos</span>
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px] max-w-md">
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search videos..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <select v-model="filterStatus"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="all">All Status</option>
          <option value="ready">Ready</option>
          <option value="uploading">Uploading</option>
          <option value="processing">Processing</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>

        <div class="flex items-center gap-2 ml-auto">
          <div v-if="selectedVideos.size > 0"
            class="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <span class="text-sm font-medium text-red-700 dark:text-red-300">
              {{ selectedVideos.size }} selected
            </span>
            <button @click="bulkSchedule"
              class="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
              title="Schedule">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="bulkDelete"
              class="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
              title="Delete">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button @click="viewMode = 'grid'" :class="[
              'p-2 rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button @click="viewMode = 'list'" :class="[
              'p-2 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto p-8">
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="video in filteredVideos" :key="video.id"
          class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
          <div class="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" />
            <div
              class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
              <button
                class="opacity-0 group-hover:opacity-100 bg-white text-gray-900 rounded-full p-3 shadow-lg hover:scale-110 transition-all">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {{ video.duration }}
            </div>
            <div class="absolute top-2 left-2">
              <input type="checkbox" :checked="selectedVideos.has(video.id)" @change="toggleVideoSelection(video.id)"
                class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">{{ video.title }}</h3>
            <div class="flex items-center gap-2 mb-3">
              <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(video.status)]">
                {{ video.status.charAt(0).toUpperCase() + video.status.slice(1) }}
              </span>
              <span v-if="video.views" class="text-xs text-gray-500 dark:text-gray-400">
                👁 {{ formatViews(video.views) }}
              </span>
            </div>
            <div v-if="video.progress !== undefined" class="mb-3">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="bg-red-500 h-full transition-all" :style="{ width: `${video.progress}%` }">
                </div>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ video.progress }}%</span>
            </div>
            <div class="flex items-center gap-1 mb-3">
              <span v-for="platform in video.platforms" :key="platform" class="text-lg" :title="platform">
                {{ getPlatformIcon(platform) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ video.size }}</span>
              <span>{{ formatDate(video.uploadDate) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left">
                <input type="checkbox" :checked="selectedVideos.size === filteredVideos.length"
                  @change="selectAllVideos"
                  class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Video
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Platforms
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="video in filteredVideos" :key="video.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4">
                <input type="checkbox" :checked="selectedVideos.has(video.id)" @change="toggleVideoSelection(video.id)"
                  class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" />
                    <div
                      class="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-[10px]">
                      {{ video.duration }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-gray-900 dark:text-gray-100 truncate">{{
                      video.title }}</div>
                    <div v-if="video.progress !== undefined" class="mt-1">
                      <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-red-500 h-full" :style="{ width: `${video.progress}%` }">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(video.status)]">
                  {{ video.status.charAt(0).toUpperCase() + video.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <span v-for="platform in video.platforms" :key="platform" class="text-lg" :title="platform">
                    {{ getPlatformIcon(platform) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatViews(video.views) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ video.size }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(video.uploadDate) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button class="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Edit">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button @click="deleteVideo(video.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredVideos.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <svg class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No videos found</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ searchQuery ? 'Try adjusting your search' : 'Get started by uploading your first video' }}
        </p>
        <button v-if="!searchQuery" @click="showUploadModal = true"
          class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
          Upload Videos
        </button>
      </div>
    </div>
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="showUploadModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-8" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Videos</h2>
          <button @click="showUploadModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center"
          @drop.prevent="handleDrop" @dragover.prevent @click="triggerFileUpload">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Drop your videos here</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
          <button @click.stop="triggerFileUpload"
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
            Choose Files
          </button>
          <input id="video-file-input" type="file" multiple accept="video/*" class="hidden"
            @change="handleFileSelect" />
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
