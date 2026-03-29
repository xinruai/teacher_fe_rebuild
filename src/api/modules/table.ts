import request from '@/api/request'

export function getList(params?: Record<string, unknown>) {
  return request({
    url: '/table/list',
    method: 'get',
    params,
  })
}
