/**
 * Round a number to a given precision, but only if it has decimals.
 */
export const fixed = (num: number, precision: number): number => {
  const dot = String(num).split('.')[1]
  return dot ? Number(num.toFixed(precision)) : Number(num)
}

/**
 * Download a file by URL using a temporary anchor element.
 */
/**
 * Check if a desktop protocol handler (exe) is available via Chrome's protocolCheck.
 * Falls back to callback immediately on non-Chrome browsers.
 */
export const checkexe = (key: string, callback: () => void): void => {
  const isChrome = navigator.userAgent.indexOf('Chrome') > -1
  if (isChrome && typeof (window as any).protocolCheck === 'function') {
    ;(window as any).protocolCheck(
      `${(window as any).electronUrl}${key}`,
      () => { callback() },
      () => { /* success — app opened */ },
    )
  } else {
    callback()
  }
}

/**
 * Copy text to clipboard using legacy execCommand.
 */
export const copyText = (text: string, successText?: string): void => {
  import('element-plus').then(({ ElNotification }) => {
    const oInput = document.createElement('input')
    oInput.value = text
    document.body.appendChild(oInput)
    oInput.select()
    document.execCommand('Copy')
    oInput.style.display = 'none'
    ElNotification.success({ title: successText || '复制成功' })
  })
}

/**
 * Download a file by URL using a temporary anchor element.
 */
export function download(url: string, filename?: string): void {
  const a = document.createElement('a')
  a.href = url
  if (filename) a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
