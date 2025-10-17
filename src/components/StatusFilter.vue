<template>
    <select v-model="modelValue"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
        <option value="all">All Status</option>
        <option value="awaiting-details">Awaiting Details</option>
        <option value="ready">Ready</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="scheduled">Scheduled</option>
        <option value="published">Published</option>
        <option value="failed">Failed</option>
    </select>
</template>

<script setup lang="ts">
const modelValue = defineModel<string>({ default: 'all' })
</script>
