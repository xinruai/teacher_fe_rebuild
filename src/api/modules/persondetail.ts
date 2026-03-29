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
