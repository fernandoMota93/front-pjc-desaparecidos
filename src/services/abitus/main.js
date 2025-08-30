import axios from '@/plugins/axios'

import { useQueryFormatter } from '@/composables/useQueryFormatter'

export const abitusService = {
  getAll: (params) => {
    const { formatQueryParams } = useQueryFormatter()
    const query = formatQueryParams(params)
    return axios.get(`pessoas/aberto/filtro${query}`)
  },

  getOne: (id) => {
    return axios.get(`pessoas/${id}`)
  },

  getStatistic: () => {
    return axios.get('pessoas/aberto/estatistico')
  },

  enviarInformacaoDesaparecido: (formData) => {
    return axios.post('ocorrencias/informacoes-desaparecido', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  //Especifico da pessoa
  getPessoaInfo: (id) => {
    return axios.get(`ocorrencias/informacoes-desaparecido?ocorrenciaId=${id}`)
  },
}
