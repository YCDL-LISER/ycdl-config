import { asyncRouterMap, constantRouterMap } from '@/router'
import { loadSidebar } from '@/api/admin/sidebar'

/* Layout */
import Layout from '@/views/layout/Layout'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRouter(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        let accessedRouters
        if (roles.includes('admin')) {
          accessedRouters = asyncRouterMap
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    },
    DynamicRoutes({ commit }, data) {
      return new Promise((resolve, reject) => {
        loadSidebar(1).then(response => {
          const data = response.data.data
          const finalRouters = formatRouter(data)
          const notFound = { path: '*', redirect: '/404', hidden: true }
          finalRouters.push(notFound)
          // console.log(JSON.stringify(finalRouters))
          commit('SET_ROUTERS', finalRouters)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

// const map = (component) => import(component)
const formatRouter = (data) => {
  const routers = []
  data.forEach(menu => {
    const {
      menuId,
      parentId,
      name,
      router,
      icon,
      enabled,
      children
    } = menu
    // () => import('@/views/permission/page')
    const menuRouter = {
      path: router,
      component: parentId === 0 ? Layout : asyncRouterMap[router],
      name: menuId.toString(),
      hidden: !enabled,
      meta: {
        title: name,
        icon: icon
      },
      children: children === null ? [] : formatRouter(children)
    }
    routers.push(menuRouter)
  })
  return routers
}

export default permission
