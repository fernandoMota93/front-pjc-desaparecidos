<script setup>
import { computed } from 'vue'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  photo: {
    type: String,
    default: null,
  },
  api: {
    type: String,
    default: 'avataaars',
  },
})

console.log('sddsadasdsadsa', props.photo)

const avatar = computed(
  () =>
    props.photo ??

    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(props.username)}`
)

const username = computed(() => props.username)
</script>

<template>
  <div>
    <img :src="avatar" :alt="username"
      class="rounded-full block h-auto w-full max-w-full bg-gray-100 dark:bg-slate-800" />
    <slot />
  </div>
</template>
