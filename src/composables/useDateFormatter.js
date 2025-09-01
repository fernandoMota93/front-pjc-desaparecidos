// composables/useDateFormatter.js
import { computed } from 'vue'

export function useDateFormatter() {
  /**
   * Formata uma data para o padrão DD/MM/YYYY HH:MM
   * @param {Date|string} date - Data a ser formatada
   * @returns {string} Data formatada
   */
  const formatDate = (date) => {
    if (!date) return 'Data inválida'

    try {
      const dateObj = new Date(date)

      // Verifica se a data é válida
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida'
      }

      const day = String(dateObj.getDate()).padStart(2, '0')
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const year = dateObj.getFullYear()
      const hours = String(dateObj.getHours()).padStart(2, '0')
      const minutes = String(dateObj.getMinutes()).padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Data inválida'
    }
  }

  /**
   * Formata uma data de forma reativa (computed)
   * @param {Date|string} date - Data a ser formatada
   * @returns {import('vue').ComputedRef<string>} Data formatada reativa
   */
  const useFormattedDate = (date) => {
    return computed(() => formatDate(date))
  }

  return {
    formatDate,
    useFormattedDate,
  }
}
