import request from '@/utils/request'

export function tree() {
  return request({
    url: '/menu/tree',
    method: 'get'
  })
}

export function postOne(obj) {
  return request({
    url: '/menu',
    method: 'post',
    data: obj
  })
}

export function getOne(id) {
  return request({
    url: '/menu/' + id,
    method: 'get'
  })
}

export function deleteOne(id) {
  return request({
    url: '/menu/' + id,
    method: 'delete'
  })
}

export function putOne(id, obj) {
  return request({
    url: '/menu/' + id,
    method: 'put',
    data: obj
  })
}
