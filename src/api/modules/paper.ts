import request from '@/api/request'

export function paper_stage(params: { id: number | string }) {
  return request({
    url: '/paper/stage',
    method: 'get',
    params,
  })
}

export function paper_teacherRate(params: { courseId: number | string }) {
  return request({
    url: '/paper/teacherRate',
    method: 'get',
    params,
  })
}

export function crmStageTable(params: { courseId: number | string }) {
  return request({
    url: '/paper/crmStageTable',
    method: 'get',
    params,
  })
}

export function crmTeacherRate(params: { courseId: number | string }) {
  return request({
    url: '/paper/crmTeacherRate',
    method: 'get',
    params,
  })
}

export function getPlanningTableVersion(params: { courseId: string | number }) {
  return request({
    url: '/paper/getPlanningTableVersion',
    method: 'get',
    params,
  })
}

export function getTaskStatus(params: { courseId: string | number; taskType: number }) {
  return request({
    url: '/paper/getTaskStatus',
    method: 'get',
    params,
  })
}

export function getAliOSSUploadSign(url: string) {
  return request({
    url,
    method: 'get',
  })
}

export function readNotice(data: { id: string | number }) {
  return request({
    url: '/paper/readNotice',
    method: 'post',
    data,
  })
}

export function paper_feedback(data: { stageId: string | number; feedbackValue: string }) {
  return request({
    url: '/paper/feedback',
    method: 'post',
    data,
  })
}

export function stage_sort(data: { stageId: string | number; oldSort: number; newSort: number }) {
  return request({
    url: '/paper/stage/sort',
    method: 'post',
    data,
  })
}

export function add_class(data: Record<string, unknown>) {
  return request({
    url: '/paper/add/class',
    method: 'post',
    data,
  })
}

export function order_putClassroom(data: Record<string, unknown>) {
  return request({
    url: '/order/putClassroom',
    method: 'post',
    data,
  })
}

export function sysfile_upload(data: Record<string, unknown>) {
  return request({
    url: '/sysfile/upload',
    method: 'post',
    data,
  })
}

export function paper_rate(data: { courseId: string | number; rate: number }) {
  return request({
    url: '/paper/rate',
    method: 'post',
    data,
  })
}

export function stage_over(data: Record<string, unknown>) {
  return request({
    url: '/paper/upload/stage/over',
    method: 'post',
    data,
  })
}

export function delete_id(id: string | number) {
  return request({
    url: `/sysfile/delete/${id}`,
    method: 'post',
    data: {},
  })
}

export function delete_class(data: { courseId: string | number; stageClassId: string | number }) {
  return request({
    url: '/paper/delete/class',
    method: 'post',
    data,
  })
}

export function queryfile_stageclass(data: { courseId: string | number; stageClassId: string | number }) {
  return request({
    url: '/paper/queryfile/stageclass',
    method: 'post',
    data,
  })
}

export function dissertation_findClassroomInfo(classroomId: string | number, params?: Record<string, unknown>) {
  return request({
    url: `/classRoom/findClassroomInfo/${classroomId}`,
    method: 'get',
    params,
  })
}

export function order_updateClassroom(data: Record<string, unknown>) {
  return request({
    url: '/order/updateClassroom',
    method: 'post',
    data,
  })
}

export function sysfile_uploadList(data: Record<string, unknown>) {
  return request({
    url: '/sysfile/uploadList',
    method: 'post',
    data,
  })
}
