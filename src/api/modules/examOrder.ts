import request from '@/api/request'

export function getExamOrderList(params?: Record<string, unknown>) {
  return request({
    url: '/examOrder/list',
    method: 'get',
    params,
  })
}

export function getBeiJinTime() {
  return request({
    url: '/examOrder/getBeiJinTime',
    method: 'get',
  })
}

export function getExamCheckFile(params: { courseId: string | number }) {
  return request({
    url: '/examOrder/getExamCheckFile',
    method: 'get',
    params,
  })
}

export function submitOrderInfo(data: Record<string, unknown>) {
  return request({
    url: '/examOrder/submitOrderInfo',
    method: 'post',
    data,
  })
}

export function getExamInfo(params: { courseId: string | number }) {
  return request({
    url: '/examOrder/getExamInfo',
    method: 'get',
    params,
  })
}

export function uploadComplatework(data: Record<string, unknown>) {
  return request({
    url: '/examOrder/uploadComplatework',
    method: 'post',
    data,
  })
}

export function orderUpdateExam(data: Record<string, unknown>) {
  return request({
    url: '/examOrder/orderUpdateExam',
    method: 'post',
    data,
  })
}

export function orderUpdateExam1(data: Record<string, unknown>) {
  return request({
    url: '/examOrder/orderUpdateExam1',
    method: 'post',
    data,
  })
}

export function getExamDetail(params: { courseId: string | number }) {
  return request({
    url: '/examOrder/getExamDetail',
    method: 'get',
    params,
  })
}
