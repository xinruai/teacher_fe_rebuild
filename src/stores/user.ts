import { defineStore } from 'pinia'
import { login, getInfo, logout } from '@/api/modules/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    name: '',
    avatar: '',
    ordernum: 0,
    regNotifyFlag: 0,
  }),
  actions: {
    async login(userInfo: { username: string; password: string }) {
      const { username, password } = userInfo
      const response: any = await login({ username: username.trim(), password })
      const { data } = response
      this.token = data.token
      setToken(data.token)
    },

    async getInfo() {
      const response: any = await getInfo(this.token)
      const { data } = response

      if (!data) {
        throw new Error('Verification failed, please Login again.')
      }

      const { name, avatar } = data
      this.name = name
      this.avatar = avatar
      return data
    },

    async logout() {
      await logout()
      this.token = ''
      removeToken()
      // resetRouter() — handled by router guard redirecting to login
    },

    async resetToken() {
      this.token = ''
      removeToken()
    },

    changeOrderNum(ordernum: number) {
      this.ordernum = ordernum
    },

    changeRegNotifyFlag(regNotifyFlag: number) {
      this.regNotifyFlag = regNotifyFlag
    },
  },
})
