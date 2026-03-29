import request from '@/api/request'

export function getPreExamList(params?: Record<string, unknown>) {
  return request({
    url: '/preExam/list',
    method: 'get',
    params,
  })
}

export function checkArrearsOrder(params: { courseId: string | number }) {
  return request({
    url: '/preExam/checkArrearsOrder',
    method: 'get',
    params,
  })
}

export function getCodeByToken() {
  return request({
    url: '/preExam/getCodeByToken',
    method: 'get',
  })
}

export function getZipFilePlus(data: Array<{ fileName: string; fileUrl: string }>) {
  return request({
    url: '/preExam/getZipFilePlus',
    method: 'post',
    data,
  })
}

export function cancelClass(params: { stepTaskId: string | number }) {
  return request({
    url: '/preExam/cancelClass',
    method: 'post',
    params,
  })
}

export function getPlanningChooseArea(params: { courseId: string | number }) {
  return request({
    url: '/preExam/getPlanningChooseArea',
    method: 'get',
    params,
  })
}

export function putCatalogue(data: Record<string, unknown>) {
  return request({
    url: '/preExam/putCatalogue',
    method: 'post',
    data,
  })
}

export function editClass(data: Record<string, unknown>) {
  return request({
    url: '/preExam/editClass',
    method: 'post',
    data,
  })
}

export function getOrderTime(params: { courseId: string | number }) {
  return request({
    url: '/preExam/getOrderTime',
    method: 'get',
    params,
  })
}
