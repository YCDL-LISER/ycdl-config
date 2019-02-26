import request from '@/utils/request'

/**
 * 从服务器获取菜单侧边栏信息
 * @param roleId
 */
export function loadSidebar(roleId) {
  return request({
    url: '/menu/sidebar/' + roleId,
    method: 'get'
  })
}
