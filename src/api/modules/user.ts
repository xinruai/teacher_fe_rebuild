import request from '@/api/request'
import axios from 'axios'
import { BasicUrl } from '@/api/config'

/**
 * Login — uses raw axios (not the intercepted `request`) because the original
 * endpoint expects query-string params and a blank Content-Type header.
 */
export function loginByMobile(mobile: string, password: string) {
  return axios({
    url: `${BasicUrl}/login`,
    method: 'post',
    headers: { 'Content-Type': ' ' },
    params: { mobile, password, loginSource: 1, platform: 'web' },
  })
}

/** Generic wrapper kept for store compatibility */
export function login(data: { username: string; password: string }) {
  return loginByMobile(data.username, data.password)
}

export function getInfo(token: string) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token },
  })
}

export function getMyInfo() {
  return request({
    url: '/user/getMyInfo',
    method: 'get',
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post',
  })
}
