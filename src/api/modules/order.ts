import request from '@/api/request'

export function getStatus() {
  return request({
    url: '/order/status',
    method: 'get',
  })
}

export function getSchemenInfo(params: { courseId: string | number }) {
  return request({
    url: '/order/getSchemenInfo',
    method: 'get',
    params,
  })
}

export function getSelectlist(params: Record<string, unknown>) {
  return request({
    url: '/order/getSelectlist',
    method: 'get',
    params,
  })
}

export function cancelClassroom(data: { classroomId: number | string }) {
  return request({
    url: '/order/cancelClassroom',
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data,
  })
}

export function putClassroom(data: Record<string, unknown>) {
  return request({
    url: '/order/putClassroom',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data,
  })
}

export function updateOrderClassroom(data: Record<string, unknown>) {
  return request({
    url: '/order/updateClassroom',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data,
  })
}

export function queryClassroomsByCourseId(params: { courseId: string | number; status: number }) {
  return request({
    url: '/order/queryClassroomsByCourseId',
    method: 'get',
    params,
  })
}

export function getOrder() {
  return request({
    url: '/order/getOrder',
    method: 'post',
  })
}

export function getRushOrderList(params: Record<string, unknown>) {
  return request({
    url: '/order/getRushOrderList',
    method: 'get',
    params,
  })
}

export function handRushOrder(data: { courseId: string | number; isAutoReceiveOrder?: boolean }) {
  return request({
    url: '/order/handRushOrder',
    method: 'post',
    data,
  })
}

export function queryRushOrderError() {
  return request({
    url: '/order/queryRushOrderError',
    method: 'get',
  })
}

export function queryGrabOrderCarousel(params: { teacId: string | number }) {
  return request({
    url: '/order/queryGrabOrderCarousel',
    method: 'get',
    params,
  })
}

export function checkOrderFinishedRemind(params: { courseId: string | number }) {
  return request({
    url: '/order/checkOrderFinishedRemind',
    method: 'get',
    params,
  })
}

export function setRushOrderNotice(data: Record<string, unknown>) {
  return request({
    url: '/order/setRushOrderNotice',
    method: 'post',
    data,
  })
}

export function getRushOrderNoticeSetting(params: { teacId: string | number }) {
  return request({
    url: '/order/getRushOrderNoticeSetting',
    method: 'get',
    params,
  })
}

export function updateRegNotify(data: { regNotifyFlag: number }) {
  return request({
    url: '/order/updateRegNotify',
    method: 'post',
    data,
  })
}

export function queryEnrollmentOrders(params: { teacId: string | number }) {
  return request({
    url: '/order/queryEnrollmentOrders',
    method: 'get',
    params,
  })
}

export function getComplatedOrder(params: Record<string, unknown>) {
  return request({
    url: '/order/getComplatedOrder',
    method: 'get',
    params,
  })
}

export function doOrderListFlag() {
  return request({
    url: '/order/doOrderListFlag',
    method: 'post',
  })
}

export function getTaskList(params: { courseId: string | number }) {
  return request({
    url: '/order/getTaskList',
    method: 'get',
    params,
  })
}

export function uploadTaskfeedBack(data: { taskId: string | number; name: string; url: string }) {
  return request({
    url: '/order/uploadTaskfeedBack',
    method: 'post',
    data,
  })
}

export function deleteTaskfeedBack(data: { id: string | number }) {
  return request({
    url: '/order/deleteTaskfeedBack',
    method: 'post',
    data,
  })
}

export function createOrUpdateTaskFeedback(data: Record<string, unknown>) {
  return request({
    url: '/order/createOrUpdateTaskFeedback',
    method: 'post',
    data,
  })
}

export function getOrderTypeIntroduceVideo() {
  return request({
    url: '/order/getOrderTypeIntroduceVideo',
    method: 'get',
  })
}

export function isImportantOrder(params: { courseId: string | number }) {
  return request({
    url: '/order/isImportantOrder',
    method: 'get',
    params,
  })
}
