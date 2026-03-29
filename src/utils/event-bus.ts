import mitt from 'mitt'

type Events = {
  [key: string]: unknown
}

const eventBus = mitt<Events>()

export default eventBus
