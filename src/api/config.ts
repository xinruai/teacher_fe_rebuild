const baseApi = import.meta.env.VITE_APP_BASE_API || ''

// URL constants — update these per environment
export const BasicUrl = baseApi
export const RequestUrl = baseApi
export const algorithmUrl = '' // TODO: Set from env for question bank streaming
export const scheduleWebUrl = '' // TODO: Set from env for schedule web
export const coursewareUrl = '' // TODO: Set from env for courseware
export const mkClassScheme = 'wnroombox://enterclass/' // MK Class protocol
export const webBaseUrl = '' // TODO: Set from env for web base URL
export const publicOrderDetailUrl = '' // TODO: Set from env for public order detail URL

// Official accounts QR code
export const officialAccountsCode = `${baseApi}/statics/officialAccountsCode.png`

// App download URLs
export const winUrl = 'https://classbro-oss-cn.oss-accelerate.aliyuncs.com/statics/app/classroom/win/teacher/ClassbroRoom.exe'
export const macUrl = 'https://classbro-oss-cn.oss-accelerate.aliyuncs.com/statics/app/classroom/mac/teacher/ClassbroRoom.dmg'
