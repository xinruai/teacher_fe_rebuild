import { defineStore } from 'pinia'
import { getStatus as getOrderStatus } from '@/api/modules/order'

export const useHandsUpStore = defineStore('handsup', {
  state: () => ({
    showGet: false,
  }),
  actions: {
    async getStatus() {
      const res: any = await getOrderStatus()
      if (res.status === 200) {
        this.showGet = !res.body
      }
    },
  },
})
