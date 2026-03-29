import { defineStore } from 'pinia'

export const useUserChangeStore = defineStore('userchange', {
  state: () => ({
    userphoto: null as string | null,
  }),
  actions: {
    changePhoto(photo: string | null) {
      this.userphoto = photo
    },
  },
})
