import request from '@/api/request'

export function getTeacherInfo() {
  return request({
    url: '/teacher/info',
    method: 'get',
  })
}

export function postTimeZone(data: { id: number; coordinate: string }) {
  return request({
    url: '/teacher/postTimeZone',
    method: 'post',
    data,
  })
}

export function seeSettingTime() {
  return request({
    url: '/teacher/seeSettingTime',
    method: 'post',
  })
}

export function getHighScore() {
  return request({
    url: '/teacher/getHighScore',
    method: 'get',
  })
}

export function getAliOSSUploadSign(params: { dir: string }) {
  return request({
    url: '/teacher/oss/getAliOSSUploadSign',
    method: 'get',
    params,
  })
}

export function doFollowExtFlag(data: { filed: string }) {
  return request({
    url: '/teacher/doFollowExtFlag',
    method: 'post',
    data,
  })
}
