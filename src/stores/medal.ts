import { defineStore } from 'pinia'
import {
  getNewMedal as apiGetNewMedal,
  getTeacMedalInfo as apiGetTeacMedalInfo,
  getHangMedal as apiGetHangMedal,
} from '@/api/modules/medal'
import { Storage } from '@/constants/enums'

export const useMedalStore = defineStore('medal', {
  state: () => ({
    showglobal: false,
    currentObj: {} as Record<string, unknown>,
    medalInfo: [] as unknown[],
    hangMedalList: [] as unknown[],
  }),
  actions: {
    async getNewMedal() {
      const info = JSON.parse(localStorage.getItem(Storage.TEACHER_INFO) || '{}')
      const res: any = await apiGetNewMedal(info.id)
      if (res.body) {
        this.showglobal = true
        this.currentObj = res.body || {}
      }
    },
    async getTeacMedalInfo() {
      const info = JSON.parse(localStorage.getItem(Storage.TEACHER_INFO) || '{}')
      const res: any = await apiGetTeacMedalInfo({ teacId: info.id })
      if (res.status === 200) {
        this.medalInfo = res.body || []
      }
    },
    async getHangMedal() {
      const info = JSON.parse(localStorage.getItem(Storage.TEACHER_INFO) || '{}')
      const res: any = await apiGetHangMedal({ teacId: info.id })
      if (res.status === 200) {
        this.hangMedalList = res.body || []
      }
    },
    closeShowglobal() {
      this.showglobal = false
    },
  },
})
