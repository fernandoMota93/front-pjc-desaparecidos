<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  mdiChartTimelineVariant,
  mdiChevronLeft,
  mdiChevronRight,
  mdiSkipBackward,
  mdiSkipForward,
  mdiAccountSearch,
  mdiAccountCheck,
  mdiMagnify,
  mdiFilter,
  mdiReload
} from '@mdi/js'
import * as chartConfig from '@/components/Charts/chart.config.js'
import SectionMain from '@/components/SectionMain.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBoxClient from '@/components/CardBoxClient.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'

//abitus services
import { useAbitusStore } from '@/stores/abitus/main.js'

const abitusStore = useAbitusStore()

const chartData = ref(null)
const page = ref(0)

// Filtros reativos
const filters = ref({
  nome: '',
  faixaIdadeInicial: '',
  faixaIdadeFinal: '',
  status: '' // Valor padrão
})

const fillChartData = () => {
  chartData.value = chartConfig.sampleChartData()
}

const handleStyleChange = (slug) => {
  document.documentElement.classList.forEach((token) => {
    if (token.indexOf('style') === 0) {
      document.documentElement.classList.replace(token, `style-${slug}`)
    }
  })
}

// Computed para verificar se há dados
const hasPessoas = computed(() => abitusStore?.pessoas?.length > 0)
const isLoading = computed(() => abitusStore.loading)

// Função para aplicar filtros
const aplicarFiltros = () => {
  page.value = 0 // Reset para primeira página
  buscarPessoas()
}

// Função para limpar filtros
const limparFiltros = () => {
  filters.value = {
    nome: '',
    faixaIdadeInicial: '',
    faixaIdadeFinal: '',
    status: ''
  }
  page.value = 0
  buscarPessoas()
}

// Função principal de busca
const buscarPessoas = () => {
  console.log('busca', filters.value)

  let statusCorrigido = filters.value.status
  if (typeof filters.value.status === 'object' && filters.value.status !== null) {
    statusCorrigido = filters.value.status.value
  }

  const params = {
    porPagina: 10,
    pagina: page.value,
    ...filters.value,
    status: statusCorrigido
  }

  // Remove campos vazios
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete params[key]
    }
  })

  try {
    abitusStore.fetchPessoas(params)
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error)
  }
}

const goToPage = (newPage) => {
  page.value = newPage
  buscarPessoas()
}

onMounted(() => {
  fillChartData()
  handleStyleChange('basic')

  // Busca inicial
  buscarPessoas()

  //GET ESTATÍSTICAS
  try {
    abitusStore.fetchStatistic({})
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
  }
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiChartTimelineVariant" title="Overview" main>

      </SectionTitleLineWithButton>

      <!-- Cards de Estatísticas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CardBoxWidget color="text-orange-500" :icon="mdiAccountSearch" :number="abitusStore.statistics.desaparecidos"
          label="Desaparecidos" :trend="abitusStore.statistics.desaparecidos > 0 ? 'up' : 'neutral'" />

        <CardBoxWidget color="text-emerald-500" :icon="mdiAccountCheck" :number="abitusStore.statistics.encontrados"
          label="Encontrados" :trend="abitusStore.statistics.encontrados > 0 ? 'up' : 'neutral'" />
      </div>

      <!-- Card de Filtros -->
      <CardBox class="mb-6">
        <SectionTitleLineWithButton :icon="mdiFilter" title="Filtros de Busca" class="mb-4" />

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Nome -->
          <FormField label="Nome">
            <FormControl v-model="filters.nome" :icon="mdiAccountSearch" placeholder="Digite o nome"
              @keyup.enter="aplicarFiltros" />
          </FormField>

          <!-- Idade Mínima -->
          <FormField label="Idade Mínima">
            <FormControl v-model="filters.faixaIdadeInicial" type="number" min="0" max="120" placeholder="0" />
          </FormField>

          <!-- Idade Máxima -->
          <FormField label="Idade Máxima">
            <FormControl v-model="filters.faixaIdadeFinal" type="number" min="0" max="120" placeholder="120" />
          </FormField>

          <!-- Status -->
          <FormField label="Status">
            <select v-model="filters.status"
              class="px-3 py-2 max-w-full border-gray-300 rounded w-full dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-gray-600">
              <option value="">Todos</option>
              <option value="DESAPARECIDO">Desaparecido</option>
              <option value="LOCALIZADO">Localizado</option>
            </select>
          </FormField>
        </div>

        <!-- Botões de Ação -->
        <div class="flex justify-end space-x-3 mt-4">
          <BaseButton @click="limparFiltros" :icon="mdiReload" label="Limpar Filtros" color="info" outline small />
          <BaseButton @click="aplicarFiltros" :icon="mdiMagnify" label="Buscar" color="info" small />
        </div>
      </CardBox>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        Carregando dados...
      </div>

      <!-- Error state -->
      <div v-else-if="abitusStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        Erro: {{ abitusStore.error }}
      </div>

      <!-- Success state -->
      <div v-else>
        <SectionTitleLineWithButton :icon="mdiAccountSearch" title="Base de Pessoas" class="mb-6" />

        <!-- Informações da Busca -->
        <div v-if="hasPessoas" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex flex-wrap items-center justify-between">
            <div class="text-sm text-blue-800">
              <span class="font-semibold">{{ abitusStore.totalPessoas }}</span> pessoa(s) encontrada(s)
              <span v-if="filters.nome"> com nome "{{ filters.nome }}"</span>
              <span v-if="filters.faixaIdadeInicial || filters.faixaIdadeFinal">
                na faixa etária
                <span v-if="filters.faixaIdadeInicial">de {{ filters.faixaIdadeInicial }}</span>
                <span v-if="filters.faixaIdadeInicial && filters.faixaIdadeFinal"> a </span>
                <span v-if="filters.faixaIdadeFinal">{{ filters.faixaIdadeFinal }} anos</span>
              </span>
            </div>
            <div class="text-xs text-blue-600">
              Página {{ page + 1 }} de {{ abitusStore.totalPages }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Coluna 1 -->
          <div class="space-y-6">
            <CardBoxClient v-for="(pessoa, index) in abitusStore.pessoas.filter((_, i) => i % 2 === 0)" :key="pessoa.id"
              :name="pessoa.nome" :date="pessoa.ultimaOcorrencia.dtDesaparecimento || 'Data não informada'"
              :progress="pessoa.ultimaOcorrencia.encontradoVivo || false" :photo="pessoa.urlFoto" :id="pessoa.id"
              :index="index * 2" />
          </div>

          <!-- Coluna 2 -->
          <div class="space-y-6">
            <CardBoxClient v-for="(pessoa, index) in abitusStore.pessoas.filter((_, i) => i % 2 === 1)" :key="pessoa.id"
              :name="pessoa.nome" :date="pessoa.ultimaOcorrencia.dtDesaparecimento || 'Data não informada'"
              :progress="pessoa.ultimaOcorrencia.encontradoVivo || false" :id="pessoa.id" :index="index * 2 + 1" />
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="hasPessoas" class="flex flex-col items-center mt-8 space-y-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {{ abitusStore.pessoas.length }} de {{ abitusStore.totalPessoas }} registros
          </div>

          <div class="flex items-center space-x-2">
            <BaseButton v-if="page > 1" @click="goToPage(0)" :icon="mdiSkipBackward" label="Primeira" x-small
              :disabled="page === 0" />

            <BaseButton v-if="page > 0" @click="goToPage(page - 1)" :icon="mdiChevronLeft" x-small
              :disabled="page === 0" />

            <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              {{ page + 1 }}
            </span>

            <BaseButton v-if="page < abitusStore.totalPages - 1" @click="goToPage(page + 1)" :icon="mdiChevronRight"
              x-small :disabled="page >= abitusStore.totalPages - 1" />

            <BaseButton v-if="page < abitusStore.totalPages - 2" @click="goToPage(abitusStore.totalPages - 1)"
              :icon="mdiSkipForward" label="Última" x-small :disabled="page >= abitusStore.totalPages - 1" />
          </div>

          <div class="text-xs text-gray-500 dark:text-gray-500">
            Página {{ page + 1 }} de {{ abitusStore.totalPages }}
          </div>
        </div>

        <!-- Estado vazio -->
        <div v-if="!hasPessoas && !isLoading" class="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold mb-2">Nenhuma pessoa encontrada</h3>
          <p>Não há pessoas que correspondam aos critérios de busca.</p>
          <BaseButton @click="limparFiltros" :icon="mdiReload" label="Limpar Filtros" color="info" outline
            class="mt-4" />
        </div>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
