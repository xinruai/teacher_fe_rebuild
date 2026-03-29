import { defineStore } from 'pinia'
import defaultSettings from '@/settings'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    showSettings: false,
    fixedHeader: defaultSettings.fixedHeader,
    sidebarLogo: defaultSettings.sidebarLogo,
  }),
  actions: {
    changeSetting({ key, value }: { key: string; value: unknown }) {
      if (Object.prototype.hasOwnProperty.call(this.$state, key)) {
        ;(this as Record<string, unknown>)[key] = value
      }
    },
  },
})
