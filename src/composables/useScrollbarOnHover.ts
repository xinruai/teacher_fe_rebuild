import { ref, computed, nextTick } from 'vue'

export function useScrollbarOnHover() {
  const hasScrollbar = ref(false)
  const isHovering = ref(false)

  const scrollbarClass = computed(() =>
    hasScrollbar.value && isHovering.value ? 'show-scrollbar' : 'hide-scrollbar',
  )

  function checkScrollbar(event?: Event) {
    nextTick(() => {
      const el = event?.target as HTMLElement | undefined
      if (el) {
        hasScrollbar.value =
          el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
      }
    })
  }

  function handleMouseEnter(event: Event) {
    isHovering.value = true
    checkScrollbar(event)
  }

  function handleMouseLeave() {
    isHovering.value = false
  }

  return {
    hasScrollbar,
    isHovering,
    scrollbarClass,
    checkScrollbar,
    handleMouseEnter,
    handleMouseLeave,
  }
}
