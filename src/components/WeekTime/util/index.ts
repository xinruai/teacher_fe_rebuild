export default {
  /** Group consecutive numbers into sub-arrays */
  numberArrayGroup(arr: number[]): number[][] {
    const result: number[][] = []
    let item: number | undefined
    let temp: number[] = []
    arr.forEach((v) => {
      if (item === v) {
        temp.push(item)
        item++
        return
      }
      temp = [v]
      item = v + 1
      result.push(temp)
    })
    return result
  },

  /** Get indices of equal-value elements grouped together */
  getEqualValueIndex(arr: string[]): number[][] {
    const result: number[][] = []
    const read = new Array(arr.length)
    const len = arr.length
    for (let i = 0; i < len; i++) {
      const item: number[] = []
      for (let j = i; j < len; j++) {
        if (arr[i] === arr[j] && !read[j]) {
          item.push(j)
          read[j] = true
        }
      }
      if (item.length > 0) result.push(item)
    }
    return result
  },
}
