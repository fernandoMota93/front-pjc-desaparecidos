<script setup>
import { reactive, onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  mdiBallotOutline,
  mdiAccount,
  mdiCalendar,
  mdiInformation,
  mdiCheckCircle,
  mdiCloseCircle,
} from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PillTag from '@/components/PillTag.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'

//abitus services
import { useAbitusStore } from '@/stores/abitus/main.js'

//imgbb upload de fotos
import { imgbbService } from '@/services/imgbb/imgbb.js'

const route = useRoute()
const abitusStore = useAbitusStore()
const fileInput = ref(null)
const loadingDetalhe = ref(false)
const loadingUpload = ref(false)

// Status da pessoa
const statusPessoa = computed(() => {
  if (!abitusStore.pessoa) return null

  const ultimaOcorrencia = abitusStore.pessoa.ultimaOcorrencia
  if (ultimaOcorrencia?.encontradoVivo) {
    return { tipo: 'success', texto: 'LOCALIZADA COM VIDA', icone: mdiCheckCircle }
  } else if (ultimaOcorrencia?.dataLocalizacao) {
    return { tipo: 'warning', texto: 'LOCALIZADA', icone: mdiCheckCircle }
  } else {
    return { tipo: 'danger', texto: 'DESAPARECIDA', icone: mdiCloseCircle }
  }
})

// Formulário de informações
const form = reactive({
  informacao: '',
  data: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
  anexos: [],
})

// Formulário de dados básicos (não editável)
const formBasico = computed(() => {
  if (!abitusStore.pessoa) return {}

  const p = abitusStore.pessoa
  const ocorrencia = p.ultimaOcorrencia

  return {
    nome: p.nome,
    idade: p.idade,
    sexo: p.sexo,
    vivo: p.vivo ? 'Sim' : 'Não',
    dataDesaparecimento: ocorrencia?.dtDesaparecimento
      ? new Date(ocorrencia.dtDesaparecimento).toLocaleDateString('pt-BR')
      : 'Não informada',
    localDesaparecimento: ocorrencia?.localDesaparecimentoConcat || 'Não informado',
    informacoes: ocorrencia?.ocorrenciaEntrevDesapDTO?.informacao || 'Não informado',
    vestimentas: ocorrencia?.ocorrenciaEntrevDesapDTO?.vestimentasDesaparecido || 'Não informado',
    ocoId: ocorrencia?.ocoId,
  }
})

// Computed para calcular o total de anexos
const totalAnexos = computed(() => {
  if (!abitusStore.detalhePessoa) return 0
  return abitusStore.detalhePessoa.reduce((total, info) => total + (info.anexos?.length || 0), 0)
})

watch(
  () => abitusStore.pessoa,
  (novaPessoa) => {
    if (novaPessoa && novaPessoa.ultimaOcorrencia) {
      buscarDetalhes(novaPessoa.ultimaOcorrencia.ocoId)
    }
  },
)

// Função para buscar detalhes
const buscarDetalhes = async (ocoId) => {
  if (!ocoId) return

  loadingDetalhe.value = true
  try {
    await abitusStore.fetchDetalhe(ocoId)
    console.log('Detalhes carregados para ocoId:', ocoId)
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error)
  } finally {
    loadingDetalhe.value = false
  }
}

// Função para verificar se é imagem
const isImage = (url) => {
  if (!url) return false

  // Busca simples por extensões de imagem na URL
  return /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif)(\?|$)/i.test(url)
}

const getFileName = (url) => {
  if (!url) return 'arquivo'

  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.split('/').pop() || 'arquivo'
  } catch {
    const parts = url.split('/')
    return parts.pop() || 'arquivo'
  }
}
const getFileType = (url) => {
  if (!url) return 'Arquivo'

  const fileName = getFileName(url).toLowerCase()

  if (fileName.endsWith('.pdf')) return 'PDF'
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'Word'
  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return 'Excel'
  if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) return 'Arquivo Compactado'
  if (isImage(url)) return 'Imagem'

  return 'Documento'
}

// Função para formatar data
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Função para tratar erro de imagem
const handleImageError = (event) => {
  const parent = event.target.parentElement
  event.target.style.display = 'none'

  // Mostra fallback
  const fallback = parent.querySelector('.fallback') || createFallback()
  if (!parent.contains(fallback)) {
    parent.appendChild(fallback)
  }
  fallback.style.display = 'flex'
}
// Criar elemento fallback dinamicamente
const createFallback = () => {
  const div = document.createElement('div')
  div.className = 'fallback flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700'
  div.innerHTML = `
    <div class="text-center">
      <svg class="w-8 h-8 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
      </svg>
      <p class="text-xs text-gray-500 mt-1">Imagem não disponível</p>
    </div>
  `
  return div
}

// Função para fazer upload dos arquivos para imgBB
const handleFileUpload = async (event) => {
  const files = event.target.files
  console.log('📁 Arquivos selecionados:', files)

  if (!files || files.length === 0) {
    console.log('❌ Nenhum arquivo selecionado')
    return
  }

  loadingUpload.value = true

  try {
    console.log('🚀 Iniciando upload de', files.length, 'arquivos para imgBB')

    // Fazer upload de cada arquivo para imgBB
    const uploadPromises = Array.from(files).map((file) => {
      console.log('📤 Enviando:', file.name, '-', file.type, '-', file.size, 'bytes')
      return imgbbService.uploadImage(file)
    })

    // Aguarda todos os uploads
    const uploadedUrls = await Promise.all(uploadPromises)
    console.log('✅ Uploads concluídos:', uploadedUrls)

    // Adiciona as URLs ao array de anexos
    form.anexos = [...form.anexos, ...uploadedUrls]
    console.log('📋 Anexos atualizados:', form.anexos)

    // Limpa o input para permitir nova seleção
    event.target.value = ''
  } catch (error) {
    console.error('❌ Erro no upload:', error)
    abitusStore.errorInformacao =
      'Erro ao fazer upload das imagens: ' + (error.message || 'Erro desconhecido')
  } finally {
    loadingUpload.value = false
  }
}

// Função para limpar todos os anexos
const clearFiles = () => {
  form.anexos = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  console.log('🧹 Todos os anexos removidos')
}
const removerAnexo = (index) => {
  form.anexos.splice(index, 1)
  console.log('🗑️ Anexo removido, anexos restantes:', form.anexos)
}

onMounted(() => {
  const id = route.params.id

  // Primeiro busca a pessoa principal
  try {
    abitusStore.fetchPessoa(id).then(() => {
      // O watch vai detectar a mudança e buscar os detalhes automaticamente
      console.log('Pessoa principal carregada')
    })
  } catch (error) {
    console.error('Erro ao buscar pessoa:', error)
  }
})

// Função para enviar o formulário
const submitInformacao = async () => {
  if (!form.informacao.trim()) {
    abitusStore.errorInformacao = 'A informação é obrigatória'
    return
  }

  try {
    // Criar FormData para multipart/form-data
    const formData = new FormData()

    console.log('anexos', form.anexos)

    // Adicionar campos ao FormData
    formData.append('ocoId', abitusStore.pessoa.ultimaOcorrencia.ocoId.toString())
    formData.append('informacao', form.informacao.trim())
    formData.append('data', form.data)
    formData.append('anexos', JSON.stringify(form.anexos))

    // console.log('Enviando FormData:')
    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value)
    // }

    await abitusStore.enviarInformacaoDesaparecido(formData)

    // Limpar formulário após sucesso
    form.informacao = ''
    form.data = new Date().toISOString().split('T')[0]
    clearFiles()
  } catch (error) {
    console.error('Erro no envio:', error)
  }
}

const resetForm = () => {
  form.informacao = ''
  form.data = new Date().toISOString().split('T')[0]
  clearFiles()
  abitusStore.errorInformacao = null
  abitusStore.successInformacao = null
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBallotOutline" title="Detalhes da Pessoa" main>
      </SectionTitleLineWithButton>

      <!-- Status da Pessoa -->
      <div v-if="statusPessoa" class="mb-6">
        <CardBox>
          <div class="text-center">
            <PillTag
              :color="statusPessoa.tipo"
              :label="statusPessoa.texto"
              :icon="statusPessoa.icone"
              class="text-lg font-bold"
            />
          </div>
        </CardBox>
      </div>

      <!-- Informações Básicas (Não Editável) -->
      <CardBox class="mb-6">
        <SectionTitleLineWithButton :icon="mdiAccount" title="Informações Básicas" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Foto -->
          <div class="flex justify-center md:justify-start">
            <UserAvatar
              class="w-32 h-32"
              :username="formBasico.nome"
              :photo="abitusStore.pessoa?.urlFoto"
            />
          </div>

          <!-- Dados Pessoais -->
          <div class="col-span-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nome">
                <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded">
                  {{ formBasico.nome || 'Não informado' }}
                </div>
              </FormField>

              <FormField label="Idade">
                <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded">
                  {{ formBasico.idade || 'Não informada' }}
                </div>
              </FormField>

              <FormField label="Sexo">
                <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded">
                  {{ formBasico.sexo || 'Não informado' }}
                </div>
              </FormField>

              <FormField label="Vivo">
                <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded">
                  {{ formBasico.vivo || 'Não informado' }}
                </div>
              </FormField>

              <FormField label="Data Desaparecimento">
                <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded">
                  {{ formBasico.dataDesaparecimento || 'Não informada' }}
                </div>
              </FormField>

              <FormField label="Local Desaparecimento">
                <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded">
                  {{ formBasico.localDesaparecimento || 'Não informado' }}
                </div>
              </FormField>
            </div>
          </div>
        </div>

        <BaseDivider />

        <!-- Informações Adicionais -->
        <div class="grid grid-cols-1 gap-4">
          <FormField label="Informações">
            <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded min-h-[80px]">
              {{ formBasico.informacoes || 'Não informado' }}
            </div>
          </FormField>

          <FormField label="Vestimentas">
            <div class="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded min-h-[60px]">
              {{ formBasico.vestimentas || 'Não informado' }}
            </div>
          </FormField>
        </div>
      </CardBox>

      <!-- Detalhes da Ocorrência (se disponível) -->
      <!-- Seção de Detalhes das Informações -->
      <CardBox class="mb-6" style="max-height: 60vh; overflow-y: auto">
        <SectionTitleLineWithButton
          :icon="mdiInformation"
          title="Informações e Acontecimentos"
          class="mb-4"
        />

        <!-- Loading state -->
        <div v-if="loadingDetalhe" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-600">Carregando informações...</p>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!abitusStore.detalhePessoa || abitusStore.detalhePessoa.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <div class="text-6xl mb-4">📝</div>
          <h3 class="text-xl font-semibold mb-2">Nenhuma informação registrada</h3>
          <p>Seja o primeiro a compartilhar informações sobre esta pessoa.</p>
        </div>

        <!-- Lista de Informações -->
        <div v-else class="space-y-4">
          <div
            v-for="(info, index) in abitusStore.detalhePessoa"
            :key="info.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <!-- Cabeçalho da Informação -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <h4 class="font-semibold text-gray-800 dark:text-gray-200">
                  Informação #{{ abitusStore.detalhePessoa.length - index }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Registrada em {{ formatDate(info.data) }}
                </p>
              </div>
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                ID: {{ info.id }}
              </span>
            </div>

            <!-- Conteúdo da Informação -->
            <div class="mb-3">
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ info.informacao }}
              </p>
            </div>

            <!-- Anexos -->
            <!-- Anexos -->
            <div v-if="info.anexos && info.anexos.length > 0" class="mt-3">
              <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                Anexos ({{ info.anexos.length }})
              </h5>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div
                  v-for="(anexo, anexoIndex) in info.anexos"
                  :key="anexoIndex"
                  class="group relative"
                >
                  <!-- Preview com fallback -->
                  <a
                    :href="anexo"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div class="aspect-w-16 aspect-h-9">
                      <!-- Tenta mostrar imagem -->
                      <img
                        v-if="isImage(anexo)"
                        :src="anexo"
                        :alt="`Anexo ${anexoIndex + 1}`"
                        class=""
                        @error="handleImageError"
                      />

                      <!-- Fallback para não-imagem ou imagem quebrada -->
                      <div
                        v-else
                        class="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700"
                      >
                        <div class="text-center">
                          <svg
                            class="w-8 h-8 text-gray-400 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          <p class="text-xs text-gray-500 mt-1">
                            {{ getFileType(anexo) }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class=""></div>
                  </a>

                  <!-- Overlay com ícone de download -->
                  <a
                    :href="anexo"
                    download
                    class="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Download"
                  >
                    <svg
                      class="w-4 h-4 text-gray-600 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </a>

                  <!-- Nome do arquivo -->
                  <div class="mt-1">
                    <p class="text-xs text-gray-500 truncate" :title="getFileName(anexo)">
                      {{ getFileName(anexo) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sem anexos -->
            <div v-else class="text-sm text-gray-400 italic">Nenhum anexo disponível</div>
          </div>
        </div>

        <!-- Estatísticas -->
        <div
          v-if="abitusStore.detalhePessoa && abitusStore.detalhePessoa.length > 0"
          class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
              Total: {{ abitusStore.detalhePessoa.length }} informações
            </span>
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clip-rule="evenodd"
                />
              </svg>
              Anexos: {{ totalAnexos }} arquivos
            </span>
          </div>
        </div>
      </CardBox>
      <!-- Formulário de Edição - Informações do Desaparecido -->
      <CardBox v-if="!abitusStore?.pessoa?.ultimaOcorrencia?.encontradoVivo" form>
        {{}}
        <SectionTitleLineWithButton :icon="mdiInformation" title="Adicionar Informação" />

        <!-- Mensagens de Status -->
        <div
          v-if="abitusStore.errorInformacao"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          {{ abitusStore.errorInformacao }}
        </div>

        <div
          v-if="abitusStore.successInformacao"
          class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
        >
          {{ abitusStore.successInformacao }}
        </div>

        <FormField label="Informação" required>
          <FormControl
            v-model="form.informacao"
            :icon="mdiInformation"
            type="textarea"
            placeholder="Digite informações relevantes sobre o desaparecido..."
            required
          />
        </FormField>

        <FormField label="Data da Informação">
          <FormControl v-model="form.data" :icon="mdiCalendar" type="date" />
        </FormField>

        <FormField label="Anexos">
          <div class="flex flex-col space-y-3">
            <!-- Input file nativo -->
            <div class="flex items-center space-x-2">
              <input
                type="file"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition file:duration-200 file:cursor-pointer border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:file:bg-blue-700 dark:hover:file:bg-blue-600 dark:border-gray-600 dark:text-gray-400 max-w-md"
                multiple
                accept="image/*"
                @change="handleFileUpload"
                id="file-upload"
                ref="fileInput"
              />
            </div>

            <!-- Lista de URLs dos anexos -->
            <div v-if="form.anexos.length > 0" class="space-y-2">
              <div
                v-for="(url, index) in form.anexos"
                :key="index"
                class="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div class="flex items-center space-x-2">
                  <img :src="url" class="w-10 h-10 object-cover rounded" />
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-600"> Imagem {{ index + 1 }} </span>
                    <span class="text-xs text-gray-400 truncate max-w-xs">
                      {{ url.substring(0, 30) }}...
                    </span>
                  </div>
                </div>
                <button
                  @click="removerAnexo(index)"
                  class="text-red-500 hover:text-red-700 p-1"
                  type="button"
                  title="Remover imagem"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <span v-if="form.anexos.length > 0" class="text-sm text-gray-600">
              {{ form.anexos.length }} imagem(ns) preparada(s) para envio
            </span>

            <div v-if="loadingUpload" class="text-sm text-blue-600">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block mr-2"
              ></div>
              Fazendo upload das imagens...
            </div>
          </div>
        </FormField>

        <template #footer>
          <BaseButtons>
            <BaseButton
              type="button"
              @click="submitInformacao"
              color="info"
              label="Enviar Informação"
              :loading="abitusStore.loadingInformacao"
              :disabled="!form.informacao"
            />
            <BaseButton type="button" color="info" outline label="Limpar" @click="resetForm" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
<style scoped>
.aspect-w-16 {
  position: relative;
}

.aspect-w-16::before {
  content: '';
  display: block;
  padding-bottom: 56.25%;
  /* 16:9 aspect ratio */
}

.aspect-w-16 > * {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
