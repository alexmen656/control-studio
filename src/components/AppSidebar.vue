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
                <!--<button @click="createNewFolder"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">New Post</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Create a new post (coming soon)</div>
                    </div>
                </button>-->
                <button @click="triggerFileUpload"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">Video upload</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Upload video files from your device</div>
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
                    <path
                        d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span class="text-sm font-medium">My Videos</span>
            </router-link>

            <!--<router-link to="/planning"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.001a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.001a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">Planning</span>
            </router-link>-->

            <router-link to="/schedule"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">Schedule</span>
            </router-link>

            <router-link to="/accounts"
                class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                active-class="bg-red-100 dark:bg-red-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-red-900/40">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">Accounts</span>
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
                        <div v-if="usedBytes" class="bg-gray-600 dark:bg-gray-400 rounded-full h-2 transition-all"
                            :style="{ width: storagePercent > 3 ? storagePercent + '%' : '3%' }">
                        </div>

                    </div>
                    <!-- <button
                        class="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 font-medium hover:underline">
                        Upgrade to Pro
                    </button>-->
                </div>
            </div>
        </nav>
    </div>
</template>
<script lang="ts">
import axios from 'axios';

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
            currentFolder: '',
            usedBytes: 0,
            totalBytes: 0,
            storagePercent: 0
        };
    },
    created() {
        this.fetchUsedStorage();
    },
    methods: {
        fetchUsedStorage() {
            axios.get('http://localhost:6709/api/used-storage').then(res => {
                this.usedBytes = Number(res.data.used_storage);
                this.totalBytes = Number(res.data.total_storage);
                this.storagePercent = this.totalBytes
                    ? Number(((this.usedBytes / this.totalBytes) * 100).toFixed(2))
                    : 0;

                this.storageTotal = this.totalBytes ? Number((this.totalBytes / (1024 * 1024 * 1024)).toFixed(2)) : 0;
                this.storageUsed = Number(this.getSizeInUnit(this.usedBytes, this.getStorageUnit(this.usedBytes)));
                this.unit = this.getStorageUnit(this.usedBytes);
            })
        },
        getStorageUnit(bytes: number) {
            if (bytes < 1024) return 'Bytes';
            else if (bytes < 1024 * 1024) return 'KB';
            else if (bytes < 1024 * 1024 * 1024) return 'MB';
            else return 'GB';
        },
        getSizeInUnit(bytes: number, unit: string) {
            switch (unit) {
                case 'Bytes':
                    return bytes;
                case 'KB':
                    return (bytes / 1024).toFixed(2);
                case 'MB':
                    return (bytes / (1024 * 1024)).toFixed(2);
                case 'GB':
                    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
                default:
                    return bytes;
            }
        },
    }
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
