import { onMounted } from 'vue'

export function useAutoScrollTop() {
  /** Auto-scroll calendar week view to current time */
  function autoScrollTop() {
    const childDom = document.getElementsByClassName('ds-day-today')[1]
    if (childDom) {
      const nodes = childDom.childNodes as NodeListOf<HTMLElement>
      const target = nodes[nodes.length - 3]
      const topPx = target?.style?.top
      if (topPx) {
        const top = parseInt(topPx)
        const resultTop = top > 400 ? top - 200 : undefined
        if (resultTop !== undefined) {
          setTimeout(() => {
            const el = document.getElementsByClassName('ds-week-view-scrollable')[0]
            if (el) el.scrollTop = resultTop
          }, 400)
        }
      }
    }
  }

  onMounted(() => autoScrollTop())

  return { autoScrollTop }
}
