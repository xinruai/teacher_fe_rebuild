import axios, { type AxiosRequestConfig } from 'axios'

export interface ApiResponse<T = any> {
  code?: number
  status?: number
  body: T
  message?: string
  msg?: string
  data?: T
}
import { ElMessageBox, ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 5000,
})

// Request interceptor
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['X-Token'] = token
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  },
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res.code !== 20000) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 3000,
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        ElMessageBox.confirm(
          'You have been logged out, you can cancel to stay on this page, or log in again',
          'Confirm logout',
          {
            confirmButtonText: 'Re-Login',
            cancelButtonText: 'Cancel',
            type: 'warning',
          },
        ).then(() => {
          // Dynamic import to avoid circular dependency
          import('@/stores/user').then(({ useUserStore }) => {
            const userStore = useUserStore()
            userStore.resetToken().then(() => {
              location.reload()
            })
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res as any
    }
  },
  (error) => {
    console.log('err' + error)
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 3000,
    })
    return Promise.reject(error)
  },
)

function request(config: AxiosRequestConfig): Promise<ApiResponse> {
  return service(config) as any
}

export default request
