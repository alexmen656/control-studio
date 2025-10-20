<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TableHeader from '@/components/TableHeader.vue'
import StatusFilter from '@/components/StatusFilter.vue'
import HomeHeader from '@/components/HomeHeader.vue'

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

const videos = ref<Video[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const selectedVideos = ref<Set<string>>(new Set())
const filterStatus = ref<string>('all')
const searchQuery = ref('')
const showUploadModal = ref(false)
const uploadingFiles = ref<File[]>([])
const uploadProgress = ref<{ [key: string]: number }>({})
const isLoading = ref(false)
const showDetailsModal = ref(false)
const selectedVideoForDetails = ref<Video | null>(null)
const videoDetailsForm = ref({
  title: '',
  description: '',
  tags: '',
  platforms: [] as Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>
})

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

      videos.value.forEach(async (video) => {
        if (video.duration === '0:00' && video.filename) {
          updateVideoDuration(video)
        }
      })
    }
  } catch (error) {
    console.error('Error loading videos:', error)
  } finally {
    isLoading.value = false
  }
}

const updateVideoDuration = async (video: Video) => {
  try {
    const videoElement = document.createElement('video')
    videoElement.preload = 'metadata'

    videoElement.onloadedmetadata = async () => {
      const duration = videoElement.duration
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

      const index = videos.value.findIndex(v => v.id === video.id)
      if (index !== -1 && videos.value[index]) {
        videos.value[index].duration = formattedDuration
      }

      await fetch(`${API_URL}/videos/${video.id}/duration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: formattedDuration })
      })

      URL.revokeObjectURL(videoElement.src)
    }

    videoElement.src = `${API_URL.replace('/api', '')}/uploads/${video.filename}`
  } catch (error) {
    console.error('Error updating video duration:', error)
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
          const updatedVideo = {
            ...result.video,
            uploadDate: new Date(result.video.uploadDate),
            status: 'awaiting-details'
          }
          videos.value[index] = updatedVideo
          updateVideoDuration(updatedVideo)
        }
      } else {
        const index = videos.value.findIndex(v => v.id === tempId)
        if (index !== -1 && videos.value[index]) {
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

  const handleOpenUploadModal = () => {
    showUploadModal.value = true
  }

  window.addEventListener('open-upload-modal', handleOpenUploadModal)

  return () => {
    window.removeEventListener('open-upload-modal', handleOpenUploadModal)
  }
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
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'awaiting-details': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  }
  return colors[status as keyof typeof colors] || colors.ready
}

const getPlatformIcon = (platform: string) => {
  const icons = {
    instagram: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    tiktok: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>`,
    youtube: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    facebook: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
  }
  return icons[platform as keyof typeof icons] || ''
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

const openDetailsModal = (video: Video) => {
  selectedVideoForDetails.value = video
  videoDetailsForm.value = {
    title: video.title || '',
    description: video.description || '',
    tags: video.tags?.join(', ') || '',
    platforms: video.platforms || []
  }
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedVideoForDetails.value = null
  videoDetailsForm.value = {
    title: '',
    description: '',
    tags: '',
    platforms: []
  }
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
  if (!selectedVideoForDetails.value) return

  try {
    const response = await fetch(`${API_URL}/videos/${selectedVideoForDetails.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: videoDetailsForm.value.title,
        description: videoDetailsForm.value.description,
        tags: videoDetailsForm.value.tags.split(',').map(t => t.trim()).filter(t => t),
        platforms: videoDetailsForm.value.platforms,
        status: 'ready'
      })
    })

    if (response.ok) {
      const result = await response.json()
      const index = videos.value.findIndex(v => v.id === selectedVideoForDetails.value!.id)
      if (index !== -1) {
        videos.value[index] = {
          ...videos.value[index],
          ...result.video,
          status: 'ready'
        }
      }
      closeDetailsModal()
    }
  } catch (error) {
    console.error('Error saving video details:', error)
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
      <HomeHeader @open-upload-modal="showUploadModal = true" />
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
        <StatusFilter v-model="filterStatus" />
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
            <video v-if="video.filename" class="w-full h-full object-cover" muted preload="metadata"
              :src="`http://localhost:6709/uploads/${video.filename}#t=0.1`">
            </video>
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div
              class="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
              <button @click="router.push({ name: 'video', params: { id: video.id } })"
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
              <label class="custom-checkbox">
                <input type="checkbox" :checked="selectedVideos.has(video.id)"
                  @change="toggleVideoSelection(video.id)" />
                <span class="checkmark"></span>
              </label>
            </div>
          </div>
          <div class="p-4">
            <h3
              class="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate cursor-pointer hover:text-red-600 transition-colors"
              @click="router.push({ name: 'video', params: { id: video.id } })">{{ video.title }}</h3>
            <div class="flex items-center gap-2 mb-3">
              <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(video.status)]">
                {{ video.status.charAt(0).toUpperCase() + video.status.slice(1) }}
              </span>
              <span v-if="video.views" class="text-xs text-gray-500 dark:text-gray-400">
                👁 {{ formatViews(video.views) }}
              </span>
            </div>
            <div v-if="video.status === 'uploading' && video.progress !== undefined" class="mb-3">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="bg-red-500 h-full transition-all" :style="{ width: `${video.progress}%` }">
                </div>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ video.progress }}%</span>
            </div>
            <div class="flex items-center gap-1 mb-3">
              <span v-for="platform in video.platforms" :key="platform" class="text-gray-600 dark:text-gray-400"
                :title="platform" v-html="getPlatformIcon(platform)">
              </span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ video.size }}</span>
              <span>{{ formatDate(video.uploadDate) }}</span>
            </div>
            <div v-if="video.status === 'awaiting-details'" class="mt-3">
              <button @click="openDetailsModal(video)"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Add Details
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left">
                <label class="custom-checkbox">
                  <input type="checkbox" :checked="selectedVideos.size === filteredVideos.length"
                    @change="selectAllVideos" />
                  <span class="checkmark"></span>
                </label>
              </th>
              <TableHeader />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="video in filteredVideos" :key="video.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4">
                <label class="custom-checkbox">
                  <input type="checkbox" :checked="selectedVideos.has(video.id)"
                    @change="toggleVideoSelection(video.id)" />
                  <span class="checkmark"></span>
                </label>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <video v-if="video.filename" class="w-full h-full object-cover" muted>
                      <source :src="`http://localhost:6709/uploads/${video.filename}`" type="video/mp4">
                    </video>
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div
                      class="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-[10px]">
                      {{ video.duration }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-red-600"
                      @click="router.push({ name: 'video', params: { id: video.id } })">{{
                        video.title }}</div>
                    <div v-if="video.status === 'uploading' && video.progress !== undefined" class="mt-1">
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
                  <span v-for="platform in video.platforms" :key="platform" class="text-gray-600 dark:text-gray-400"
                    :title="platform" v-html="getPlatformIcon(platform)">
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
                  <button v-if="video.status === 'awaiting-details'" @click="openDetailsModal(video)"
                    class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded font-medium transition-colors flex items-center gap-1"
                    title="Add Details">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Add Details
                  </button>
                  <button @click="openDetailsModal(video)"
                    class="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Edit">
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
    <div v-if="showUploadModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
    <div v-if="showDetailsModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="closeDetailsModal">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop>
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Video Details</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Complete the information for your video
              </p>
            </div>
            <button @click="closeDetailsModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Title *
            </label>
            <input v-model="videoDetailsForm.title" type="text" required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter a catchy title for your video" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea v-model="videoDetailsForm.description" rows="4"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Describe your video content..."></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ videoDetailsForm.description.length }} characters
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input v-model="videoDetailsForm.tags" type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. tutorial, funny, cooking (comma separated)" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate tags with commas
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Platforms *
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button @click="togglePlatform('instagram')" type="button" :class="[
                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                videoDetailsForm.platforms.includes('instagram')
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              ]">
                <div class="text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div class="text-left flex-1">
                  <div class="font-medium text-gray-900 dark:text-gray-100">Instagram</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Reels & Posts</div>
                </div>
                <div v-if="videoDetailsForm.platforms.includes('instagram')" class="ml-auto">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
              <button @click="togglePlatform('tiktok')" type="button" :class="[
                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                videoDetailsForm.platforms.includes('tiktok')
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              ]">
                <div class="text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </div>
                <div class="text-left flex-1">
                  <div class="font-medium text-gray-900 dark:text-gray-100">TikTok</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Short Videos</div>
                </div>
                <div v-if="videoDetailsForm.platforms.includes('tiktok')" class="ml-auto">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
              <button @click="togglePlatform('youtube')" type="button" :class="[
                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                videoDetailsForm.platforms.includes('youtube')
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              ]">
                <div class="text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div class="text-left flex-1">
                  <div class="font-medium text-gray-900 dark:text-gray-100">YouTube</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Long Form</div>
                </div>
                <div v-if="videoDetailsForm.platforms.includes('youtube')" class="ml-auto">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
              <button @click="togglePlatform('facebook')" type="button" :class="[
                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                videoDetailsForm.platforms.includes('facebook')
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              ]">
                <div class="text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div class="text-left flex-1">
                  <div class="font-medium text-gray-900 dark:text-gray-100">Facebook</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Social Feed</div>
                </div>
                <div v-if="videoDetailsForm.platforms.includes('facebook')" class="ml-auto">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
            <p v-if="videoDetailsForm.platforms.length === 0" class="text-xs text-red-500 dark:text-red-400 mt-2">
              Please select at least one platform
            </p>
          </div>
        </div>
        <div
          class="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-end gap-3">
          <button @click="closeDetailsModal"
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
          <button @click="saveVideoDetails"
            :disabled="!videoDetailsForm.title || videoDetailsForm.platforms.length === 0" :class="[
              'px-6 py-2 rounded-lg font-medium transition-colors',
              !videoDetailsForm.title || videoDetailsForm.platforms.length === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
            ]">
            Save & Continue
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

.custom-checkbox {
  display: block;
  position: relative;
  cursor: pointer;
  user-select: none;
  width: 20px;
  height: 20px;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.custom-checkbox .checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.2s ease;
}

@media (prefers-color-scheme: dark) {
  .custom-checkbox .checkmark {
    background-color: #374151;
    border-color: #4b5563;
  }
}

.custom-checkbox:hover input~.checkmark {
  border-color: #ef4444;
}

.custom-checkbox input:checked~.checkmark {
  background-color: #ef4444;
  border-color: #ef4444;
}

.custom-checkbox .checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked~.checkmark:after {
  display: block;
}
</style>
