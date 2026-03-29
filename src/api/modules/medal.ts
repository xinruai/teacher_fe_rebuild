import request from '@/api/request'

export function getNewMedal(tecId: number | string) {
  return request({
    url: '/medal/new',
    method: 'get',
    params: { tecId },
  })
}

export function getTeacMedalInfo(params: { teacId: number | string }) {
  return request({
    url: '/medal/info',
    method: 'get',
    params,
  })
}

export function getHangMedal(params: { teacId: number | string }) {
  return request({
    url: '/medal/hang',
    method: 'get',
    params,
  })
}
