<template>
    <div class="h-full flex flex-col bg-white dark:bg-gray-900">
        <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div class="mb-4">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Connected Accounts</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Connect your social media accounts to start publishing
                </p>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto p-8">
            <div class="max-w-4xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">YouTube</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Video platform</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.youtube"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Upload and share videos with millions of viewers worldwide
                            </p>
                            <button v-if="!connectedAccounts.youtube" @click="connectYouTube"
                                class="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect YouTube
                            </button>
                            <button v-else @click="disconnectYouTube"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Instagram
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Photos & Reels</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.instagram"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Share your moments and short videos with your followers
                            </p>
                            <button v-if="!connectedAccounts.instagram" @click="connectInstagram"
                                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Instagram
                            </button>
                            <button v-else @click="disconnectInstagram"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-gray-900 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">TikTok</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Short-form videos</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.tiktok"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Create and discover entertaining short videos
                            </p>
                            <button v-if="!connectedAccounts.tiktok" @click="connectTiktok"
                                class="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect TikTok
                            </button>
                            <button v-else @click="disconnectTiktok"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-blue-600 dark:bg-blue-700 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Facebook</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Social network</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.facebook"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Connect with friends and share your content
                            </p>
                            <button v-if="!connectedAccounts.facebook" @click="connectFacebook"
                                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Facebook
                            </button>
                            <button v-else @click="disconnectFacebook"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div class="flex gap-3">
                        <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">Why connect accounts?</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                By connecting your social media accounts, you can upload and publish videos to multiple
                                platforms simultaneously, schedule posts, and track performance all in one place.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const baseurl = 'http://localhost:6709/api/'

const connectedAccounts = ref({
    youtube: false,
    instagram: false,
    tiktok: false,
    facebook: false
})

const connectYouTube = () => {
    axios.post(`${baseurl}connect/youtube`)
        .then(response => {
            console.log('YouTube connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.youtube = true
        })
        .catch(error => {
            console.error('Error connecting to YouTube:', error)
        })
}

const connectInstagram = () => {
    axios.post(`${baseurl}connect/instagram`)
        .then(response => {
            console.log('Instagram connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.instagram = true
        })
        .catch(error => {
            console.error('Error connecting to Instagram:', error)
        })
}

const connectTiktok = () => {
    axios.post(`${baseurl}connect/tiktok`)
        .then(response => {
            console.log('TikTok connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.tiktok = true
        })
        .catch(error => {
            console.error('Error connecting to TikTok:', error)
        })
}

const connectFacebook = () => {
    axios.post(`${baseurl}connect/facebook`)
        .then(response => {
            console.log('Facebook connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.facebook = true
        })
        .catch(error => {
            console.error('Error connecting to Facebook:', error)
        })
}

const disconnectYouTube = () => {
    if (confirm('Disconnect YouTube account?')) {
        connectedAccounts.value.youtube = false
        console.log('YouTube disconnected')
    }
}

const disconnectInstagram = () => {
    if (confirm('Disconnect Instagram account?')) {
        connectedAccounts.value.instagram = false
        console.log('Instagram disconnected')
    }
}

const disconnectTiktok = () => {
    if (confirm('Disconnect TikTok account?')) {
        connectedAccounts.value.tiktok = false
        console.log('TikTok disconnected')
    }
}

const disconnectFacebook = () => {
    if (confirm('Disconnect Facebook account?')) {
        connectedAccounts.value.facebook = false
        console.log('Facebook disconnected')
    }
}
</script>