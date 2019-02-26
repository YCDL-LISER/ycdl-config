import { loginByUsername, logout, getUserInfo, getQqAccessToken, getQqOpenid, loginByOpenId } from '@/api/login'
import { getToken, setToken, removeToken, social, substringBetween } from '@/utils/auth'

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    setting: {
      articlePlatform: []
    }
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        const user = {
          username: username,
          password: userInfo.password,
          grant_type: 'password'
        }
        loginByUsername(user).then(response => {
          const data = response.data
          commit('SET_TOKEN', data.token)
          setToken(response.data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 第三方登陆
    loginBySocial({ commit }, param) {
      return new Promise((resolve, reject) => {
        const code = param.code
        const type = param.type
        // const param = {
        //   grant_type: 'openid',
        //   openid: '5858203A07CED9E105033101E87FB362'
        // }
        // loginByOpenId(param).then(response => {
        //   const data = response.data
        //   console.log('result', data)
        //   resolve()
        // }).catch(error => {
        //   reject(error)
        // })
        if (type === 'qq') {
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
            if (!token) {
              reject('qq登陆access_token获取失败')
            }
            const param = {
              access_token: token
            }
            getQqOpenid(param).then(response => {
              const data = response.data
              const openId = substringBetween(data, '"openid":"', '"}')
              if (!openId) {
                reject('openid获取失败')
              }
              console.log('openId', openId)
              const param = {
                grant_type: 'openid',
                openid: openId
              }
              loginByOpenId(param).then(response => {
                const data = response.data
                console.log('result', JSON.stringify(data))
                if (!data.access_token) {
                  reject('token获取失败')
                }
                commit('SET_TOKEN', data.access_token)
                setToken(data.access_token)
                resolve()
              }).catch(error => {
                reject(error)
              })
            }).catch(error => {
              reject(error)
            })
          }).catch(error => {
            reject(error)
          })
        }
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const data = response.data

          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }

          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit, dispatch }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
          resolve()
        })
      })
    }
  }
}

export default user
