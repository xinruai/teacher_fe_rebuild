import { storeToRefs } from 'pinia'
import { useHatchStore } from '@/stores/hatch'

export function useCountDown() {
  const hatchStore = useHatchStore()
  const { countdown, countTime } = storeToRefs(hatchStore)
  const process = storeToRefs(hatchStore).process

  async function initCurrentLine() {
    await hatchStore.currentLine()
  }

  return { countdown, process, countTime, initCurrentLine }
}
