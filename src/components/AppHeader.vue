<template>
    <header class="bg-white dark:bg-gray-800 fixed top-0 left-0 right-0 z-50">
        <div class="mx-auto px-3 sm:px-3 2xl:px-3 w-full">
            <div class="flex justify-between items-center h-15">
                <div class="flex items-center">
                    <div @click="router.push('/dashboard')" class="flex-shrink-0 flex items-center logo-container">
                        <img data-v-c970699f="" class="logo-image" src="../assets/logo.png" alt="Logo">
                        <span class="logo-text">
                            Control Studio</span>
                    </div>
                </div>
                <div class="hidden md:flex flex-1 max-w-2xl mx-8">
                    <div class="relative w-full search-container">
                        <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                clip-rule="evenodd" />
                        </svg>
                        <input v-model="searchQuery" @focus="isSearchFocused = true" @input="performSearch" type="text"
                            placeholder="Search files and folders..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />

                    </div>
                </div>
                <!---
                <nav class="hidden md:flex space-x-6">
                    <RouterLink to="/dashboard"
                        class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        active-class="text-primary-600 bg-primary-50">
                        Files
                    </RouterLink>
                    <RouterLink to="/recent"
                        class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        active-class="text-primary-600 bg-primary-50">
                        Recent
                    </RouterLink>
                    <RouterLink to="/shared"
                        class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        active-class="text-primary-600 bg-primary-50">
                        Shared
                    </RouterLink>
                </nav>--->
                <div class="flex items-center space-x-4">
                    <button
                        class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                        <BellIcon class="w-5 h-5" />
                    </button>
                    <!----<div class="relative">
                        <button @click="toggleUserMenu"
                            class="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors">
                            <div
                                class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                A
                            </div>
                            <span class="hidden sm:block text-md font-medium text-gray-700 dark:text-gray-200">
                                Alex </span>
                            <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                        <div v-if="userMenuOpen"
                            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                            <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Alex</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">user</p>
                            </div>
                            <button @click="handleLogout"
                                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                                        clip-rule="evenodd" />
                                </svg>
                                <span>Sign out</span>
                            </button>
                        </div>
                    </div>-->
                    <button @click="toggleMobileMenu"
                        class="md:hidden p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                        <MenuIcon v-if="!mobileMenuOpen" class="w-6 h-6" />
                        <XIcon v-else class="w-6 h-6" />
                    </button>
                </div>
            </div>
            <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-4">
                <div class="px-3 mb-4">
                    <div class="relative search-container">
                        <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                clip-rule="evenodd" />
                        </svg>
                        <input v-model="searchQuery" @focus="isSearchFocused = true" @input="performSearch" type="text"
                            placeholder="Search files and folders..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
                        <div v-if="isSearchFocused && (searchResults.length > 0 || searchQuery.length > 0)"
                            class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                            <div v-if="searchQuery.length > 0 && searchResults.length === 0"
                                class="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                                No results found for "{{ searchQuery }}"
                            </div>
                            <div v-else-if="searchQuery.length === 0"
                                class="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                                Type to search files and folders...
                            </div>
                            <div v-else>
                                <div
                                    class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                                    {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}
                                </div>
                                <div v-for="result in searchResults" :key="result.ref"
                                    @click="selectSearchResult(result)"
                                    class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                    <div class="flex items-center space-x-3">
                                        <div class="flex-shrink-0">
                                            <component :is="getFileIcon(result.type)" class="w-6 h-6"
                                                :color="getFileColor(result.type)" />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                <span v-html="highlightMatch(result.name, searchQuery)"></span>
                                            </div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {{ result.drive }} • {{ result.owner }} • {{ result.modified }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="space-y-1">
                    <RouterLink to="/dashboard"
                        class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-base font-medium"
                        @click="closeMobileMenu">
                        Files
                    </RouterLink>
                    <RouterLink to="/recent"
                        class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-base font-medium"
                        @click="closeMobileMenu">
                        Recent
                    </RouterLink>
                    <RouterLink to="/shared"
                        class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-base font-medium"
                        @click="closeMobileMenu">
                        Shared
                    </RouterLink>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue'
import { RouterLink, useRouter } from 'vue-router'


const router = useRouter()


const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchResults = ref<any[]>([])

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
}

const toggleUserMenu = () => {
    userMenuOpen.value = !userMenuOpen.value
}

const FolderIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#5F6368',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                d: 'M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'
            })
        ])
    }
})

const PDFIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#EA4335',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                fillRule: 'evenodd',
                d: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z',
                clipRule: 'evenodd'
            })
        ])
    }
})

const ImageIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#EA4335',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                fillRule: 'evenodd',
                d: 'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z',
                clipRule: 'evenodd'
            })
        ])
    }
})

const SheetIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#0F9D58',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                fillRule: 'evenodd',
                d: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z',
                clipRule: 'evenodd'
            })
        ])
    }
})

const DocIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#4285F4',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                fillRule: 'evenodd',
                d: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z',
                clipRule: 'evenodd'
            })
        ])
    }
})

const ZipIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#5F6368',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                fillRule: 'evenodd',
                d: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z',
                clipRule: 'evenodd'
            })
        ])
    }
})

const FormIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#7B1FA2',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                fillRule: 'evenodd',
                d: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z',
                clipRule: 'evenodd'
            })
        ])
    }
})

const VideoIcon = defineComponent({
    props: ['color'],
    setup(props) {
        return () => h('svg', {
            class: 'w-6 h-6',
            fill: props.color || '#FF5722',
            viewBox: '0 0 20 20'
        }, [
            h('path', {
                fillRule: 'evenodd',
                d: 'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2.5a.5.5 0 01.8-.4l5.7 4a.5.5 0 010 .8l-5.7 4A.5.5 0 017 13.5v-8z',
                clipRule: 'evenodd'
            })
        ])
    }
})

const getFileIcon = (type: string) => {
    switch (type) {
        case 'folder': return FolderIcon
        case 'pdf': return PDFIcon
        case 'image': return ImageIcon
        case 'video': return VideoIcon
        case 'sheet': return SheetIcon
        case 'doc': return DocIcon
        case 'zip': return ZipIcon
        case 'form': return FormIcon
        default: return PDFIcon
    }
}

const getFileColor = (type: string) => {
    switch (type) {
        case 'folder': return '#5F6368'
        case 'pdf': return '#EA4335'
        case 'image': return '#EA4335'
        case 'video': return '#FF5722'
        case 'sheet': return '#0F9D58'
        case 'doc': return '#4285F4'
        case 'zip': return '#5F6368'
        case 'form': return '#7B1FA2'
        default: return '#5F6368'
    }
}

const SearchIcon = {
    template: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
    </svg>
  `
}

const BellIcon = {
    template: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clip-rule="evenodd" />
    </svg>
  `
}

const UserIcon = {
    template: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  `
}

const MenuIcon = {
    template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `
}

const XIcon = {
    template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `
}
</script>

<style scoped>
.logo-text {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.8px;
    line-height: 1;
    transition: color 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #ea0e2b;
    cursor: pointer;
}

.logo-image {
    height: 34px;
    width: auto;
    transition: transform 0.2s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 100%;
    justify-content: flex-start;
    padding: 4px 0;
}

header {
    background: #eff3f6;
}

@media (prefers-color-scheme: dark) {
    header {
        background: #1f2937;
    }
}
</style>