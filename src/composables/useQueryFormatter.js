export function useQueryFormatter() {
  function formatQueryParams(params = {}) {
    const query = Object.entries(params)
      // eslint-disable-next-line no-unused-vars
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')

    return query ? `?${query}` : ''
  }

  return { formatQueryParams }
}
