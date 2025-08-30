<script setup>

import { containerMaxW } from '@/config.js'

import NavBarMenuList from '@/components/NavBarMenuList.vue'


defineProps({
  menu: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['menu-click'])

const menuClick = (event, item) => {
  emit('menu-click', event, item)
}


</script>

<template>
  <nav class="top-0 inset-x-0 fixed bg-gray-50 h-14 z-30 transition-position w-screen lg:w-auto dark:bg-slate-800">
    <div class="flex lg:items-stretch" :class="containerMaxW">
      <div class="flex flex-1 items-stretch h-14">
        <slot />
      </div>
      <div class="flex-none items-stretch flex h-14 lg:hidden">

      </div>
      <div
        class="max-h-screen-menu overflow-y-auto lg:overflow-visible absolute w-screen top-14 left-0 bg-gray-50 shadow-lg lg:w-auto lg:flex lg:static lg:shadow-none dark:bg-slate-800">
        <NavBarMenuList :menu="menu" @menu-click="menuClick" />
      </div>
    </div>
  </nav>
</template>
