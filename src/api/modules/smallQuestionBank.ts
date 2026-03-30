import request from '@/api/request'

// Task management
export function createTask(data: Record<string, unknown>) {
  return request({
    url: '/questionBank/createTask',
    method: 'post',
    data,
  })
}

export function getTaskList(params: { page: number; size: number }) {
  return request({
    url: '/questionBank/getTaskList',
    method: 'get',
    params,
  })
}

export function getTaskInfo(params: { taskId: number | string }) {
  return request({
    url: '/questionBank/getTaskInfo',
    method: 'get',
    params,
  })
}

export function getTaskStatus(params: { taskIds: string }) {
  return request({
    url: '/questionBank/getTaskStatus',
    method: 'get',
    params,
  })
}

export function viewTask(params: { taskId: number | string }) {
  return request({
    url: '/questionBank/viewTask',
    method: 'get',
    params,
  })
}

// Question operations
export function getQuestionList(params: { taskId: number | string }) {
  return request({
    url: '/questionBank/getQuestionList',
    method: 'get',
    params,
  })
}

export function reWrittenQuestion(data: { questionId: number | string; rewrittenPrompt: string }) {
  return request({
    url: '/questionBank/reWrittenQuestion',
    method: 'post',
    data,
  })
}

export function getRewrittenResult(params: { questionIds: number | string }) {
  return request({
    url: '/questionBank/getRewrittenResult',
    method: 'get',
    params,
  })
}

export function copyAnswer(params: Record<string, unknown>) {
  return request({
    url: '/questionBank/copyAnswer',
    method: 'post',
    data: params,
  })
}

export function screenshot(params: Record<string, unknown>) {
  return request({
    url: '/questionBank/screenshot',
    method: 'post',
    data: params,
  })
}

export function analyzing(params: { questionId: number | string }) {
  return request({
    url: '/questionBank/analyzing',
    method: 'post',
    data: params,
  })
}

// Feedback
export function meet(params: Record<string, unknown>) {
  return request({
    url: '/questionBank/meet',
    method: 'post',
    data: params,
  })
}

export function notMeet(params: Record<string, unknown>) {
  return request({
    url: '/questionBank/notMeet',
    method: 'post',
    data: params,
  })
}

export function getNotMeetReasons() {
  return request({
    url: '/questionBank/getNotMeetReasons',
    method: 'get',
  })
}

export function getMeetReasons() {
  return request({
    url: '/questionBank/getMeetReasons',
    method: 'get',
  })
}

// Order & knowledge points
export function getOrderInfo(params: Record<string, unknown>) {
  return request({
    url: '/questionBank/getOrderInfo',
    method: 'get',
    params,
  })
}

export function getKps(params: { courseId: string | number }) {
  return request({
    url: '/questionBank/getKps',
    method: 'get',
    params,
  })
}

// Tracking
export function setTrackingPoint(data: Record<string, unknown>) {
  return request({
    url: '/questionBank/setTrackingPoint',
    method: 'post',
    data,
  })
}

export function updateSecondBatchWatchFlag(data: { taskId: number | string }) {
  return request({
    url: '/questionBank/updateSecondBatchWatchFlag',
    method: 'post',
    data,
  })
}

// Ranking
export function getNewRankingList() {
  return request({
    url: '/questionBank/getNewRankingList',
    method: 'get',
  })
}

export function getRankingList() {
  return request({
    url: '/questionBank/getRankingList',
    method: 'get',
  })
}
