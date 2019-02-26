import Cookies from 'js-cookie'
import Base64JS from 'js-base64'
import { getQqAccessToken, getQqOpenid } from '@/api/login'

const TokenKey = 'Admin-Token'
const Base64 = Base64JS.Base64

export const oauth2 = {
  client_id: 'webApp',
  client_secret: 'webApp'
}
export const authorization = 'Basic ' + Base64.encode(oauth2.client_id + ':' + oauth2.client_secret)

export const social = {
  dispatchUrl: '/auth/',
  clientId: '101534681',
  clientSecret: '68f0c763d514df2deb47820d1258e54f',
  grantType: 'authorization_code',
  redirectUri: 'http://www.youchedongli.cn/auth/qq',
  test: 'access_token=194E46CFF59D321671C1EC17FEC99243&expires_in=7776000&refresh_token=7D89E9ABDE2FCA2FFD3C3018633D14A9'
}

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

/**
 * 获取qq的AccessToken
 * @param code
 */
export function getAccessToken(code, type) {
  console.log('code值' + code)
  console.log('type值' + type)
  const param = {
    grant_type: social.grantType,
    client_id: social.clientId,
    client_secret: social.clientSecret,
    code: code,
    redirect_uri: social.redirectUri
  }
  getQqAccessToken(param).then(response => {
    const data = response.data
    const result = data.split('&')
    const pos = result[0].lastIndexOf('=')
    const token = result[0].substring(pos + '='.length, result[0].length)
    console.log('AccessToken', token)
  })
}

/**
 * 获取qq的AccessToken
 * @param token
 */
export function getOpenId(token, type) {
  console.log('token值' + token)
  console.log('type值' + type)
  const param = {
    access_token: token
  }
  getQqOpenid(param).then(response => {
    const data = response.data
    console.log('openId', data)
  })
}

export function substringBetween(str, open, close) {
  if (str == null || open == null || close == null) {
    return null
  }
  const start = str.indexOf(open)
  if (start !== -1) {
    const end = str.indexOf(close, start + open.length)
    if (end !== -1) {
      return str.substring(start + open.length, end)
    }
  }
  return null
}
