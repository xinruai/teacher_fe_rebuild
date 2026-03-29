import request from '@/api/request'

export function getClassInLink(params: { roomId: string | number }) {
  return request({
    url: '/classIn/link',
    method: 'get',
    params,
  })
}

export function getMKClassInLink(params: { roomId: string | number }) {
  return request({
    url: '/classIn/mkLink',
    method: 'get',
    params,
  })
}

export function getMKClassInLinkByCode(params: { code: string; teacId?: string | number }) {
  return request({
    url: '/classIn/mkLinkByCode',
    method: 'get',
    params,
  })
}

export function queryCourseByRoomId(params: { roomId: string | number }) {
  return request({
    url: '/classIn/queryCourse',
    method: 'get',
    params,
  })
}

export function queryLateClassroom(params?: Record<string, unknown>) {
  return request({
    url: '/classIn/queryLateClassroom',
    method: 'get',
    params,
  })
}

export function queryTeacherUrl(params: { roomId: string | number; lateFlag?: number }) {
  return request({
    url: '/classIn/queryTeacherUrl',
    method: 'get',
    params,
  })
}

export function creatClass(data: Record<string, unknown>) {
  return request({
    url: '/classIn/creatClass',
    method: 'post',
    data,
  })
}

export function judgeComeIn(params: { teacId: string | number }) {
  return request({
    url: '/classIn/judgeComeIn',
    method: 'get',
    params,
  })
}

export function queryUserDetails(params: { teacId: string | number }) {
  return request({
    url: '/classIn/queryUserDetails',
    method: 'get',
    params,
  })
}

export function queryClassRoom(params: { teacId: string | number }) {
  return request({
    url: '/classIn/queryClassRoom',
    method: 'get',
    params,
  })
}
