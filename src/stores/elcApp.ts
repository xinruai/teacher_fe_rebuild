import { defineStore } from 'pinia'

export const useElcAppStore = defineStore('elcApp', {
  state: () => ({
    showElcTip: false,
  }),
  actions: {
    setShowElcTip(val: boolean) {
      this.showElcTip = val
    },
  },
})
