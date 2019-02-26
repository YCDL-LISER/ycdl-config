import { loadDictionaryCode, loadDictionaryList } from '@/api/admin/dictionary'

const dictionary = {
  state: {
    dictionaryCode: undefined,
    dictionaryList: undefined
  },
  mutations: {
    SET_DICT_CODE: (state, dictionaryCode) => {
      state.dictionaryCode = dictionaryCode
    },
    SET_DICT_LIST: (state, dictionaryList) => {
      state.dictionaryList = dictionaryList
    }
  },
  actions: {
    // 获取数据字典
    LoadDictionary({ commit }) {
      return new Promise((resolve, reject) => {
        loadDictionaryCode().then(response => {
          const dataCode = response.data
          commit('SET_DICT_CODE', dataCode)
          loadDictionaryList().then(response => {
            const dataList = response.data
            commit('SET_DICT_LIST', dataList)
          }).catch(error => {
            reject(error)
          })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}
export default dictionary
