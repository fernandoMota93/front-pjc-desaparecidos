<script setup>
import { computed } from 'vue'
import { mdiTrendingDown, mdiTrendingUp, mdiTrendingNeutral, mdiArrowRight } from '@mdi/js'
import CardBox from '@/components/CardBox.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import PillTag from '@/components/PillTag.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useRouter } from 'vue-router'

const router = useRouter()
const { formatDate } = useDateFormatter()

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  progress: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: null,
  },
  photo: {
    type: String,
    default: null,
  },
})

const formattedDate = formatDate(props.date)

const pillType = computed(() => {
  if (props.type) {
    return props.type
  }

  if (props.progress !== undefined && props.progress !== null) {
    if (props.progress === true) {
      return 'success'
    }
    if (props.progress === false) {
      return 'danger'
    }
  }

  return 'info'
})

const pillIcon = computed(() => {
  return {
    success: mdiTrendingUp,
    warning: mdiTrendingNeutral,
    danger: mdiTrendingDown,
    info: null,
  }[pillType.value]
})

const pillText = computed(() => {
  if (props.text) {
    return props.text
  }

  return props.progress === true ? 'Encontrado' : 'Desaparecido'
})

// Função para navegar para a página de detalhes
const goToDetails = () => {
  router.push({
    name: 'detalhe',
    params: { id: props.id },
  })
}
</script>

<template>
  <CardBox class="mb-6 last:mb-0">
    <BaseLevel>
      <BaseLevel type="justify-start">
        <UserAvatar class="w-12 h-12 mr-6" :username="name" :photo="photo" />
        <div class="text-center md:text-left overflow-hidden">
          <h4 class="text-xl text-ellipsis">
            {{ name }}
          </h4>
          <p class="text-gray-500 dark:text-slate-400">{{ formattedDate }}</p>
        </div>
      </BaseLevel>

      <div class="flex items-center space-x-2">
        <PillTag :color="pillType" :label="pillText" :icon="pillIcon" />

        <!-- Botão com seta -->
        <BaseButton
          @click="goToDetails"
          :icon="mdiArrowRight"
          color="info"
          small
          rounded-full
          class="ml-2"
        />
      </div>
    </BaseLevel>
  </CardBox>
</template>
