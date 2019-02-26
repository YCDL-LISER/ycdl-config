import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken, social } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

// permission judge function
function hasPermission(roles, permissionRoles) {
  // admin permission passed directly
  if (roles.indexOf('admin') >= 0) return true
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

// no redirect whitelist
const whiteList = ['/login', '/auth-redirect']

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  if (getToken()) { // determine if there has token
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      // if current page is dashboard will not trigger	afterEach hook, so manually handle it
      NProgress.done()
    } else {
      // 判断当前用户是否已拉取完user_info信息
      if (store.getters.roles.length === 0) {
        // 拉取user_info
        store.dispatch('GetUserInfo').then(res => {
          // note: roles must be a array! such as: ['editor','develop']
          const roles = res.data.roles
          // 根据roles权限生成可访问的路由表
          store.dispatch('DynamicRoutes', { roles }).then(() => {
            // 动态添加可访问路由表
            router.addRoutes(store.getters.addRouters)
            // 添加数据字典进vuex
            store.dispatch('LoadDictionary').then(() => {
              // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
              next({ ...to, replace: true })
            })
          })
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        if (hasPermission(store.getters.roles, to.meta.roles)) {
          next()
        } else {
          next({ path: '/401', replace: true, query: { noGoBack: true }})
        }
        // 可删 ↑
      }
    }
  } else {
    /* has no token*/
    if (to.path.startsWith(social.dispatchUrl)) {
      // 第三方登陆
      const code = to.query.code
      const type = to.path.substring(social.dispatchUrl.length)

      store.dispatch('loginBySocial', { type, code }).then(() => {
        next({ path: '/' })
        NProgress.done()
        Message.success('登陆成功')
      }).catch((err) => {
        Message.error(err)
        next({ path: '/' })
        NProgress.done()
      })
    } else if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      // 否则全部重定向到登录页
      next(`/login?redirect=${to.path}`)
      // if current page is login will not trigger afterEach hook, so manually handle it
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
