import request from '@/api/request'

export function findClassroomInfo(params: Record<string, unknown>) {
  return request({
    url: '/classtable/classroomInfo',
    method: 'get',
    params,
  })
}

export function changeTimeSwitch(data: { timeState: number; id: number | string }) {
  return request({
    url: '/teacher/changeTimeSwitch',
    method: 'post',
    data,
  })
}

export function queryClassroomForDate(data: Record<string, unknown>) {
  return request({
    url: '/classRoom/queryClassroomForDate',
    method: 'post',
    data,
  })
}

export function queryClassroomObject(id: number | string) {
  return request({
    url: `/classRoom/queryObject/${id}`,
    method: 'post',
  })
}

export function updateClassroom(data: Record<string, unknown>) {
  return request({
    url: '/classRoom/update/classroom',
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data,
  })
}

export function getOrderStageList(params: { courseId: string | number }) {
  return request({
    url: '/studPaperSpreeStageInstance/v1/getOrderStageList',
    method: 'get',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params,
  })
}

export function classRoomList(params: Record<string, unknown>) {
  return request({
    url: '/classRoom/list',
    method: 'get',
    params,
  })
}

export function finishClassroom(data: { classroomId: number | string }) {
  return request({
    url: '/order/finishClassroom',
    method: 'post',
    data,
  })
}

export function presenterTime(data: { classroomId: number | string; time: number | string; explain: string }) {
  return request({
    url: '/account/presenterTime',
    method: 'post',
    data,
  })
}
