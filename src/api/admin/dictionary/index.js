import request from '@/utils/request'

export function loadDictionaryCode() {
  return request({
    url: '/dictionary/code',
    method: 'get'
  })
}

export function loadDictionaryList() {
  return request({
    url: '/dictionary/list',
    method: 'get'
  })
}
