<template>
    <select v-model="modelValue"
        class="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-no-repeat bg-[length:1.5em_1.5em] bg-[right_0.5rem_center]"
        style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E');">
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
