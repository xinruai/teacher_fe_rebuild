import { defineStore } from 'pinia'

export const usePaperStore = defineStore('paper', {
  state: () => ({
    type: 3 as number | boolean,
  }),
  actions: {
    setType(val: number | boolean) {
      this.type = val
    },
    getType() {
      this.type = false
    },
  },
})
