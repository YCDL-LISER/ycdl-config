import request from '@/utils/request'
import { authorization } from '@/utils/auth'
import Qs from 'qs'

export function loginByUsername(param) {
  console.log('参数：' + Qs.stringify(param))
  // const data = {
  //   username,
  //   password
  // }
  // return request({
  //   url: '/login/login',
  //   method: 'post',
  //   data
  // })
  return request({
    url: '/ycdl-auth/oauth/token',
    method: 'post',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: Qs.stringify(param)
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

/**
 * 通过AuthorizationCode获取Access Token
 * @param param 必传参数
 */
export function getQqAccessToken(param) {
  return request({
    url: '/graph/oauth2.0/token',
    method: 'get',
    params: param
  })
}

/**
 * 通过AccessToken获取openId
 * @param param 必传参数
 */
export function getQqOpenid(param) {
  return request({
    url: '/graph/oauth2.0/me',
    method: 'get',
    params: param
  })
}

export function loginByOpenId(param) {
  return request({
    url: '/ycdl-auth/oauth/token',
    method: 'post',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: Qs.stringify(param)
  })
}

