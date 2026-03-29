import request from '@/api/request'

// TODO: Add smallQuestionBank API endpoints as discovered from views
export function getQuestionBankList(params?: Record<string, unknown>) {
  return request({
    url: '/smallQuestionBank/list',
    method: 'get',
    params,
  })
}
