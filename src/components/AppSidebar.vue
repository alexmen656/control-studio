<template>
    <div class="w-64 h-screen bg-white dark:bg-gray-800 flex flex-col fixed left-0 top-15 sidebar">
        <div class="px-2 pb-4 pt-2 relative">
            <button @click.stop="showNewDropdown = !showNewDropdown"
                class="flex items-center space-x-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 rounded-full px-6 py-3 w-full transition-all group">
                <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">New</span>
            </button>
            <div v-if="showNewDropdown" @click.stop
                class="absolute left-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <!--top-full-->
                <button @click="createNewFolder"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">New folder</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Create a new folder</div>
                    </div>
                </button>
                <button @click="triggerFileUpload"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">File upload</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Upload files from your device</div>
                    </div>
                </button>
            </div>
            <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileUpload" />
        </div>
        <nav class="flex-1 px-2 space-y-1 overflow-y-auto">
            <router-link to="/dashboard"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
                <span class="text-sm font-medium">My Videos</span>
            </router-link>
            <router-link to="/planning"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span class="text-sm font-medium">Planning</span>
            </router-link>
            <router-link to="/schedule"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">Schedule</span>
            </router-link>
            <router-link to="/accounts"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-sm font-medium">Accounts</span>
            </router-link>
            <router-link to="/trash"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">Trash</span>
            </router-link>
            <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            <div class="px-4 pt-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Storage</span>
            </div>
            <div class="px-4 py-2">
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{{ storageUsed }} {{ unit }} of {{ storageTotal
                        }}
                            GB
                            used</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div v-if="storageUsedInGB && storageTotal"
                            class="bg-gray-600 dark:bg-gray-400 rounded-full h-2 transition-all"
                            :style="{ width: storagePercent > 3 ? storagePercent + '%' : '3%' }">
                        </div>

                    </div>
                    <!-- <button
                        class="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 font-medium hover:underline">
                        Buy storage
                    </button>-->
                </div>
            </div>
        </nav>
    </div>
</template>
<script lang="ts">
export default {
    name: 'AppSidebar',
    data() {
        return {
            storageUsed: 0,
            storageUsedInGB: 0,
            storageTotal: 0,
            unit: 'GB',
            showNewDropdown: false,
            currentDrive: 'default',
            currentFolder: ''
        };
    },
}
</script>

<style scoped>
.sidebar {
    background: #eff3f6;
}

@media (prefers-color-scheme: dark) {
    .sidebar {
        background: #1f2937;
    }
}

::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

@media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-thumb {
        background: #4b5563;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
    }
}
</style>
