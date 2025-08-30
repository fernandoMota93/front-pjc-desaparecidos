// services/imgbb.js
import axios from 'axios'

const IMGBB_API_KEY = '1e45457cfb5e708f184c75f5635b8193'
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

export const imgbbService = {
  async uploadImage(file) {
    console.log('📤 Iniciando upload para imgBB:', file.name, file.type, file.size)

    const formData = new FormData()
    formData.append('image', file)

    try {
      console.log('🔄 Enviando para imgBB...')
      const response = await axios.post(IMGBB_UPLOAD_URL, formData, {
        params: {
          key: IMGBB_API_KEY,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('✅ Upload bem-sucedido:', response.data)
      return response.data.data.url // Retorna a URL da imagem
    } catch (error) {
      console.error('❌ Erro no upload para imgBB:', error)
      console.error('Resposta de erro:', error.response?.data)
      throw new Error(error.response?.data?.error?.message || 'Falha no upload da imagem')
    }
  },

  async uploadMultipleImages(files) {
    console.log('📤 Upload múltiplo de', files.length, 'imagens')
    const uploadPromises = files.map((file) => this.uploadImage(file))
    return Promise.all(uploadPromises)
  },
}
