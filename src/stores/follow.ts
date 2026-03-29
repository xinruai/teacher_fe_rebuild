import { defineStore } from 'pinia'

export const useFollowStore = defineStore('follow', {
  state: () => ({
    showStep: false,
  }),
  actions: {
    setShowStep(val: boolean) {
      this.showStep = val
    },
  },
})
