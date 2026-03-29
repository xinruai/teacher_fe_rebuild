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
