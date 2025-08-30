import { defineStore } from 'pinia'
import { abitusService } from '@/services/abitus/main.js'

export const useAbitusStore = defineStore('abitus', {
  state: () => ({
    pessoas: [],
    pessoa: [],
    detalhePessoa: [],
    statistics: {
      desaparecidos: 0,
      encontrados: 0,
    },
    loading: false,
    error: null,
    totalPessoas: 0,
    totalPages: 0,

    loadingInformacao: false,
    errorInformacao: null,
    successInformacao: null,
  }),

  actions: {
    async fetchPessoas(params) {
      this.loading = true
      this.error = null
      try {
        const { data } = await abitusService.getAll(params)
        console.log(data)
        if (data && data.content) {
          this.pessoas = data.content
          this.totalPessoas = data.totalElements || 0
          this.totalPages = data.totalPages || 0
        } else {
          throw new Error('Estrutura de dados inválida')
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async fetchPessoa(id) {
      this.loading = true
      this.error = null

      try {
        const { data } = await abitusService.getOne(id)
        console.log('PESSSOA', data)

        if (data) {
          this.pessoa = data
        } else {
          throw new Error('Estrutura de dados inválida')
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchStatistic() {
      this.loading = true
      this.error = null

      try {
        const { data } = await abitusService.getStatistic()
        console.log('ESTATISTICA', data)

        if (data) {
          this.statistics.desaparecidos = data.quantPessoasDesaparecidas || 0
          this.statistics.encontrados = data.quantPessoasEncontradas || 0
        } else {
          throw new Error('Estrutura de dados inválida')
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async enviarInformacaoDesaparecido(formData) {
      this.loadingInformacao = true
      this.errorInformacao = null
      this.successInformacao = null

      try {
        const response = await abitusService.enviarInformacaoDesaparecido(formData)
        this.successInformacao = 'Informação enviada com sucesso!'
        return response.data
      } catch (err) {
        this.errorInformacao =
          err.response?.data?.message || err.message || 'Erro ao enviar informação'
        throw err
      } finally {
        this.loadingInformacao = false
      }
    },

    async fetchDetalhe(id) {
      this.loading = true
      this.error = null

      try {
        const { data } = await abitusService.getPessoaInfo(id)
        console.log('DETALHES', data)

        if (data) {
          this.detalhePessoa = data
        } else {
          throw new Error('Estrutura de dados inválida')
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
  },
})
