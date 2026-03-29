import defaultSettings from '@/settings'

const title = defaultSettings.title || '万能讲师'

export default function getPageTitle(pageTitle?: string): string {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return title
}
