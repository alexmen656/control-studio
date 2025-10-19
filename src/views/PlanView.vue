<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface VideoIdea {
    id: string
    title: string
    description: string
    status: 'idea' | 'filming' | 'editing' | 'publishing' | 'completed'
    createdAt: Date
    priority: 'low' | 'medium' | 'high'
    notes?: string
    targetPlatforms?: Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>
    dueDate?: Date | null
}

const columns = [
    { id: 'idea', title: '💡 Ideas', color: 'bg-blue-500' },
    { id: 'filming', title: '🎬 Filming', color: 'bg-purple-500' },
    { id: 'editing', title: '✂️ Editing', color: 'bg-yellow-500' },
    { id: 'publishing', title: '📤 Publishing', color: 'bg-orange-500' },
    { id: 'completed', title: '✅ Completed', color: 'bg-green-500' }
]

const ideas = ref<VideoIdea[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedIdea = ref<VideoIdea | null>(null)
const draggedItem = ref<VideoIdea | null>(null)

const newIdea = ref({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetPlatforms: [] as Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>,
    notes: '',
    dueDate: null as Date | null
})

onMounted(() => {
    loadIdeas()
})

const loadIdeas = () => {
    const stored = localStorage.getItem('videoIdeas')
    if (stored) {
        ideas.value = JSON.parse(stored).map((idea: any) => ({
            ...idea,
            createdAt: new Date(idea.createdAt),
            dueDate: idea.dueDate ? new Date(idea.dueDate) : null
        }))
    } else {
        ideas.value = [
            {
                id: '1',
                title: 'Tutorial: Vue 3 Composition API',
                description: 'Introduction to the Composition API with practical examples',
                status: 'idea',
                createdAt: new Date(),
                priority: 'high',
                targetPlatforms: ['youtube'],
                dueDate: null
            },
            {
                id: '2',
                title: 'Behind the Scenes',
                description: 'A day in the life of a content creator',
                status: 'filming',
                createdAt: new Date(),
                priority: 'medium',
                targetPlatforms: ['instagram', 'tiktok'],
                dueDate: null
            },
            {
                id: '3',
                title: 'Quick Tips: Productivity',
                description: '5 tips for better time management',
                status: 'editing',
                createdAt: new Date(),
                priority: 'high',
                targetPlatforms: ['instagram', 'tiktok', 'youtube'],
                dueDate: null
            }
        ]
        saveIdeas()
    }
}

const saveIdeas = () => {
    localStorage.setItem('videoIdeas', JSON.stringify(ideas.value))
}

const addIdea = () => {
    if (!newIdea.value.title.trim()) return

    const idea: VideoIdea = {
        id: Date.now().toString(),
        title: newIdea.value.title,
        description: newIdea.value.description,
        status: 'idea',
        createdAt: new Date(),
        priority: newIdea.value.priority,
        targetPlatforms: newIdea.value.targetPlatforms,
        notes: newIdea.value.notes,
        dueDate: newIdea.value.dueDate
    }

    ideas.value.push(idea)
    saveIdeas()
    closeAddModal()
}

const closeAddModal = () => {
    showAddModal.value = false
    newIdea.value = {
        title: '',
        description: '',
        priority: 'medium',
        targetPlatforms: [],
        notes: '',
        dueDate: null
    }
}

const openEditModal = (idea: VideoIdea) => {
    selectedIdea.value = { ...idea }
    showEditModal.value = true
}

const updateIdea = () => {
    if (!selectedIdea.value) return

    const index = ideas.value.findIndex(i => i.id === selectedIdea.value!.id)
    if (index !== -1) {
        ideas.value[index] = { ...selectedIdea.value }
        saveIdeas()
    }
    closeEditModal()
}

const closeEditModal = () => {
    showEditModal.value = false
    selectedIdea.value = null
}

const deleteIdea = (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return
    ideas.value = ideas.value.filter(i => i.id !== id)
    saveIdeas()
}

const getIdeasByStatus = (status: string) => {
    return ideas.value.filter(idea => idea.status === status)
}

const onDragStart = (idea: VideoIdea) => {
    draggedItem.value = idea
}

const onDragOver = (event: DragEvent) => {
    event.preventDefault()
}

const onDrop = (status: string) => {
    if (!draggedItem.value) return

    const idea = ideas.value.find(i => i.id === draggedItem.value!.id)
    if (idea) {
        idea.status = status as VideoIdea['status']
        saveIdeas()
    }
    draggedItem.value = null
}

const getPriorityColor = (priority: string) => {
    const colors = {
        low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
    return colors[priority as keyof typeof colors]
}

const getPlatformIcon = (platform: string) => {
    const icons = {
        instagram: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        tiktok: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>`,
        youtube: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        facebook: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    }
    return icons[platform as keyof typeof icons] || ''
}

const togglePlatform = (platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook') => {
    const platforms = showAddModal.value ? newIdea.value.targetPlatforms : selectedIdea.value!.targetPlatforms || []
    const index = platforms.indexOf(platform)

    if (index > -1) {
        platforms.splice(index, 1)
    } else {
        platforms.push(platform)
    }
}

const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
    <div class="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div class="px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Video Planning</h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">Collect ideas and manage your video projects</p>
                </div>
                <button @click="showAddModal = true"
                    class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    New Idea
                </button>
            </div>
        </div>
        <div class="flex-1 overflow-x-auto overflow-y-hidden p-8">
            <div class="flex gap-6 h-full min-w-max">
                <div v-for="column in columns" :key="column.id" class="flex-shrink-0 w-80 flex flex-col">
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-3">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ column.title }}</h2>
                            <span
                                class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                {{ getIdeasByStatus(column.id).length }}
                            </span>
                        </div>
                        <div :class="['h-1 rounded-full', column.color]"></div>
                    </div>
                    <div @dragover="onDragOver" @drop="onDrop(column.id)"
                        class="flex-1 overflow-y-auto space-y-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[500px]">
                        <div v-for="idea in getIdeasByStatus(column.id)" :key="idea.id" draggable="true"
                            @dragstart="onDragStart(idea)"
                            class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-move border border-gray-200 dark:border-gray-600 group">
                            <div class="flex items-start justify-between mb-2">
                                <h3 class="font-semibold text-gray-900 dark:text-gray-100 flex-1 pr-2">{{ idea.title }}
                                </h3>
                                <div
                                    class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="openEditModal(idea)"
                                        class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button @click="deleteIdea(idea.id)"
                                        class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p v-if="idea.description"
                                class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {{ idea.description }}
                            </p>
                            <div class="flex items-center flex-wrap gap-2 mb-3">
                                <span
                                    :class="['text-xs px-2 py-1 rounded-full font-medium', getPriorityColor(idea.priority)]">
                                    {{ idea.priority === 'high' ? 'High' : idea.priority === 'medium' ? 'Medium' :
                                        'Low' }}
                                </span>
                                <div v-if="idea.targetPlatforms && idea.targetPlatforms.length > 0"
                                    class="flex items-center gap-1">
                                    <span v-for="platform in idea.targetPlatforms" :key="platform"
                                        class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon(platform)">
                                    </span>
                                </div>
                            </div>
                            <div v-if="idea.dueDate"
                                class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ formatDate(idea.dueDate) }}
                            </div>
                        </div>
                        <div v-if="getIdeasByStatus(column.id).length === 0"
                            class="flex flex-col items-center justify-center py-12 text-center">
                            <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p class="text-sm text-gray-500 dark:text-gray-400">No videos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="closeAddModal">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                @click.stop>
                <div
                    class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">New Video Idea</h2>
                        <button @click="closeAddModal"
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
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title *
                        </label>
                        <input v-model="newIdea.title" type="text" required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="e.g. Tutorial: How to..." />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea v-model="newIdea.description" rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                            placeholder="Describe your video idea..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Priority
                        </label>
                        <div class="flex gap-3">
                            <button @click="newIdea.priority = 'low'" type="button" :class="[
                                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                                newIdea.priority === 'low'
                                    ? 'border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                            ]">
                                Low
                            </button>
                            <button @click="newIdea.priority = 'medium'" type="button" :class="[
                                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                                newIdea.priority === 'medium'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                            ]">
                                Medium
                            </button>
                            <button @click="newIdea.priority = 'high'" type="button" :class="[
                                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                                newIdea.priority === 'high'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                            ]">
                                High
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Ziel-Plattformen
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <button @click="togglePlatform('instagram')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                newIdea.targetPlatforms.includes('instagram')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('instagram')">
                                </div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">Instagram</span>
                            </button>
                            <button @click="togglePlatform('tiktok')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                newIdea.targetPlatforms.includes('tiktok')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('tiktok')"></div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">TikTok</span>
                            </button>
                            <button @click="togglePlatform('youtube')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                newIdea.targetPlatforms.includes('youtube')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('youtube')"></div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">YouTube</span>
                            </button>
                            <button @click="togglePlatform('facebook')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                newIdea.targetPlatforms.includes('facebook')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('facebook')">
                                </div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">Facebook</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Due Date (optional)
                        </label>
                        <input v-model="newIdea.dueDate" type="date"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea v-model="newIdea.notes" rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                            placeholder="Additional notes..."></textarea>
                    </div>
                </div>
                <div
                    class="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-end gap-3">
                    <button @click="closeAddModal"
                        class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                        Cancel
                    </button>
                    <button @click="addIdea" :disabled="!newIdea.title.trim()" :class="[
                        'px-6 py-2 rounded-lg font-medium transition-colors',
                        !newIdea.title.trim()
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
                    ]">
                        Add Idea
                    </button>
                </div>
            </div>
        </div>
        <div v-if="showEditModal && selectedIdea"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="closeEditModal">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                @click.stop>
                <div
                    class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Idea</h2>
                        <button @click="closeEditModal"
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
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title *
                        </label>
                        <input v-model="selectedIdea.title" type="text" required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea v-model="selectedIdea.description" rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Priority
                        </label>
                        <div class="flex gap-3">
                            <button @click="selectedIdea.priority = 'low'" type="button" :class="[
                                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                                selectedIdea.priority === 'low'
                                    ? 'border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                            ]">
                                Low
                            </button>
                            <button @click="selectedIdea.priority = 'medium'" type="button" :class="[
                                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                                selectedIdea.priority === 'medium'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                            ]">
                                Medium
                            </button>
                            <button @click="selectedIdea.priority = 'high'" type="button" :class="[
                                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                                selectedIdea.priority === 'high'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                            ]">
                                High
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Ziel-Plattformen
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <button @click="togglePlatform('instagram')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                selectedIdea.targetPlatforms?.includes('instagram')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('instagram')">
                                </div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">Instagram</span>
                            </button>
                            <button @click="togglePlatform('tiktok')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                selectedIdea.targetPlatforms?.includes('tiktok')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('tiktok')"></div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">TikTok</span>
                            </button>
                            <button @click="togglePlatform('youtube')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                selectedIdea.targetPlatforms?.includes('youtube')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('youtube')"></div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">YouTube</span>
                            </button>
                            <button @click="togglePlatform('facebook')" type="button" :class="[
                                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                selectedIdea.targetPlatforms?.includes('facebook')
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            ]">
                                <div class="text-gray-600 dark:text-gray-400" v-html="getPlatformIcon('facebook')">
                                </div>
                                <span class="font-medium text-gray-900 dark:text-gray-100">Facebook</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Due Date
                        </label>
                        <input v-model="selectedIdea.dueDate" type="date"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea v-model="selectedIdea.notes" rows="2"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"></textarea>
                    </div>
                </div>
                <div
                    class="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-end gap-3">
                    <button @click="closeEditModal"
                        class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                        Cancel
                    </button>
                    <button @click="updateIdea" :class="[
                        'px-6 py-2 rounded-lg font-medium transition-colors',
                        'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
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
    height: 8px;
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

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>