import request from '@/api/request'

// TODO: Add newTrain API endpoints as discovered from views
export function getTrainInfo(params?: Record<string, unknown>) {
  return request({
    url: '/newTrain/info',
    method: 'get',
    params,
  })
}

export function complateUploadIntroduce() {
  return request({
    url: '/newTrain/complateUploadIntroduce',
    method: 'post',
  })
}

export function getTeacCanWorkTime(params: { teacUserId: string | number }) {
  return request({
    url: '/newTrain/getTeacCanWorkTime',
    method: 'get',
    params,
  })
}
