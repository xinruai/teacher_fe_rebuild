import axios from 'axios'
import { getToken } from '@/utils/auth'
import { Storage } from '@/constants/enums'

// Secondary request layer used by hatch/dissertation modules
// Uses raw axios with token from localStorage
const hatchAxios = axios.create({
  timeout: 10000,
})

hatchAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(Storage.TOKEN)
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

hatchAxios.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default hatchAxios
