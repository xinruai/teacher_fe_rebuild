import request from '@/api/request'

export function getTotalMoney(params: { teacId: string }) {
  return request({
    url: '/newSalary/getTotalMoney',
    method: 'get',
    params,
  })
}

export function getSalaryList(params: Record<string, unknown>) {
  return request({
    url: '/newSalary/getSalaryList',
    method: 'get',
    params,
  })
}

export function queryTeacPayrollListCount(params: { status: string; teacId: string }) {
  return request({
    url: '/newSalary/queryTeacPayrollListCount',
    method: 'get',
    params,
  })
}

export function queryTeacPayrollView(params: Record<string, unknown>) {
  return request({
    url: '/newSalary/queryTeacPayrollView',
    method: 'get',
    params,
  })
}

export function getWeekSalaryDetail(params: Record<string, unknown>) {
  return request({
    url: '/newSalary/getWeekSalaryDetail',
    method: 'get',
    params,
  })
}

export function getMonthSalaryDetail(params: Record<string, unknown>) {
  return request({
    url: '/newSalary/getMonthSalaryDetail',
    method: 'get',
    params,
  })
}

export function cashWithdrawal(params: Record<string, unknown>) {
  return request({
    url: '/newSalary/cashWithdrawal',
    method: 'post',
    data: params,
  })
}

export function getBankcardList(params: Record<string, unknown>) {
  return request({
    url: '/newSalary/getBankcardList',
    method: 'get',
    params,
  })
}

export function queryNoNextWeekClassOrder(params: { teacId: string }) {
  return request({
    url: '/newSalary/queryNoNextWeekClassOrder',
    method: 'get',
    params,
  })
}

export function facialVerification() {
  return request({
    url: '/newSalary/facialVerification',
    method: 'get',
  })
}

export function updateTeacherFaceVerify() {
  return request({
    url: '/newSalary/updateTeacherFaceVerify',
    method: 'post',
  })
}

export function getAppealList(params: Record<string, unknown>) {
  return request({
    url: '/newSalary/getAppealList',
    method: 'get',
    params,
  })
}

export function postAppeal(data: Record<string, unknown>) {
  return request({
    url: '/newSalary/postAppeal',
    method: 'post',
    data,
  })
}
