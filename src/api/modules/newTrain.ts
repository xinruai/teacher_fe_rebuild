import request from '@/api/request'
import axios from 'axios'

export function getTrainInfo(params?: Record<string, unknown>) {
  return request({
    url: '/newTrain/info',
    method: 'get',
    params,
  })
}

export function getTrainProcess(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/getTrainProcess',
    method: 'get',
    params,
  })
}

export function completeProcess(data: Record<string, unknown>) {
  return request({
    url: '/newTrain/completeProcess',
    method: 'post',
    data,
  })
}

export function saveTeacCanWorkTime(data: Record<string, unknown>) {
  return request({
    url: '/newTrain/saveTeacCanWorkTime',
    method: 'post',
    data,
  })
}

export function complateUploadIntroduce() {
  return request({
    url: '/newTrain/complateUploadIntroduce',
    method: 'post',
  })
}

export function getTeacCanWorkTime(params: { teacUserId: string | number }) {
  return request({
    url: '/newTrain/getTeacCanWorkTime',
    method: 'get',
    params,
  })
}

export function saveTestInfo(data: Record<string, unknown>) {
  return request({
    url: '/newTrain/saveTestInfo',
    method: 'post',
    data,
  })
}

export function uploadToOss(data: FormData, onUploadProgress?: (progressEvent: any) => void) {
  return axios.request({
    url: 'https://classbro-oss.oss-accelerate.aliyuncs.com/',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
}

export function getInterviewResult(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/getInterviewResult',
    method: 'get',
    params,
  })
}

export function getInterviewResultDetail(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/getInterviewResultDetail',
    method: 'get',
    params,
  })
}

export function getBindingStatus(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/getBindingStatus',
    method: 'get',
    params,
  })
}

export function getTestInfo(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/getTestInfo',
    method: 'get',
    params,
  })
}

export function getTeacSurveyData(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/getTeacSurveyData',
    method: 'get',
    params,
  })
}

export function insertOrUpdateAnswer(data: Record<string, unknown>) {
  return request({
    url: '/newTrain/insertOrUpdateAnswer',
    method: 'post',
    data,
  })
}

export function queryAnswerById(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/queryAnswerById',
    method: 'get',
    params,
  })
}

export function queryQuestions(params: Record<string, unknown>) {
  return request({
    url: '/newTrain/queryQuestions',
    method: 'get',
    params,
  })
}

export function teacCompleteMandatoryStep(data: Record<string, unknown>) {
  return request({
    url: '/newTrain/teacCompleteMandatoryStep',
    method: 'post',
    data,
  })
}

export function getFileList(params?: Record<string, unknown>) {
  return request({
    url: '/newTrain/getFileList',
    method: 'get',
    params,
  })
}
