import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://abitus-api.geia.vip/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// interceptors opcionais (auth, logs, etc)
// instance.interceptors.request.use(config => {
//   // exemplo: injetar token JWT
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

export default instance
