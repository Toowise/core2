import axios from 'axios'

let BASE_URL
if (import.meta.env.VITE_DEPLOYMENT_TYPE === 'local') {
  BASE_URL = import.meta.env.VITE_BASE_URL_LOCAL
} else if (import.meta.env.VITE_DEPLOYMENT_TYPE === 'production') {
  BASE_URL = import.meta.env.VITE_BASE_URL_PRODUCTION
}

export default axios.create({
  baseURL: BASE_URL,
})

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  //withCredentials: true
})
