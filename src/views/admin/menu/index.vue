<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button-group>
        <el-button type="primary" icon="el-icon-plus" @click="handlerAdd">添加</el-button>
        <el-button type="primary" icon="el-icon-edit" @click="handlerEdit">编辑</el-button>
        <el-button type="primary" icon="el-icon-delete" @click="handleDelete">删除</el-button>
      </el-button-group>
    </div>

    <el-row>
      <el-col :span="8" style="margin-top:15px;">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"/>
        <el-tree
          ref="menuTree"
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          class="filter-tree"
          node-key="menuId"
          highlight-current
          default-expand-all
          @node-click="getNodeData"
        />
      </el-col>
      <el-col :span="16" style="margin-top:15px;">
        <el-card class="box-card">
          <el-form ref="form" :label-position="labelPosition" :model="form" label-width="80px">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType" :disabled="formEdit">
                <el-radio v-for="item in dicts" :key="item.codeKey" :label="item.codeKey">{{ item.codeValue }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="form.name" :disabled="formEdit" placeholder="请输入菜单名称"/>
            </el-form-item>
            <el-form-item label="父级菜单" prop="parentId">
              <el-input v-model="form.parentId" :disabled="formEdit" readonly/>
            </el-form-item>
            <el-form-item label="前端路由" prop="router">
              <el-input v-model="form.router" :disabled="formEdit" placeholder="请输入前端路由"/>
            </el-form-item>
            <el-form-item v-if="form.menuType === 2" label="资源路径" prop="url">
              <el-input v-model="form.url" :disabled="formEdit" placeholder="请输入资源路径"/>
            </el-form-item>
            <el-form-item v-if="form.menuType === 1" label="外部链接" prop="externalLinks">
              <el-input v-model="form.externalLinks" :disabled="formEdit" placeholder="请输入外部链接"/>
            </el-form-item>
            <el-form-item label="图标" prop="icon">
              <el-input v-model="form.icon" :disabled="formEdit" placeholder="请选择图标"/>
            </el-form-item>
            <el-form-item label="是否启用" prop="enable">
              <el-switch v-model="form.enabled" :disabled="formEdit"/>
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="form.sort"
                :disabled="formEdit"
                :min="1"
                controls-position="right"
                placeholder="请输入排序"/>
            </el-form-item>
            <el-form-item v-if="formStatus == 'update'">
              <el-button type="primary" @click="update">更新</el-button>
              <el-button @click="onCancel">取消</el-button>
            </el-form-item>
            <el-form-item v-if="formStatus == 'create'">
              <el-button type="primary" @click="create">保存</el-button>
              <el-button @click="onCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { tree, postOne, deleteOne, putOne } from '@/api/admin/menu'
import { mapGetters } from 'vuex'
export default {
  name: 'Menu',
  data() {
    return {
      filterText: '',
      list: null,
      total: null,
      formEdit: true,
      formAdd: true,
      formStatus: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      labelPosition: 'right',
      coding: 'menuType',
      dicts: [],
      form: {
        menuType: undefined,
        name: undefined,
        parentId: undefined,
        router: undefined,
        url: undefined,
        externalLinks: undefined,
        icon: undefined,
        enabled: undefined,
        sort: undefined
      },
      currentId: -1
    }
  },
  computed: {
    ...mapGetters([
      'dictionaryList'
    ])
  },
  watch: {
    filterText(val) {
      this.$refs.menuTree.filter(val)
    }
  },
  created() {
    this.getList()
    this.dicts = this.dictionaryList['menuType']
    // loadDictionaryCode(this.coding).then(response => {
    //   this.dicts = response.data
    // })
  },
  methods: {
    getList() {
      tree().then(response => {
        this.treeData = response.data.data
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    getNodeData(data) {
      if (!this.formEdit) {
        this.formStatus = 'update'
      }
      this.form = data
      this.currentId = data.menuId
    },
    handlerEdit() {
      this.formEdit = false
      this.formStatus = 'update'
    },
    handlerAdd() {
      this.resetForm()
      this.formEdit = false
      this.formStatus = 'create'
    },
    handleDelete() {
      this.$confirm('此操作将永久删除！是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOne(this.currentId).then(() => {
          this.getList()
          this.resetForm()
          this.onCancel()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    update() {
      putOne(this.form.id, this.form).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    create() {
      postOne(this.form).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    onCancel() {
      this.formEdit = true
      this.formStatus = ''
    },
    resetForm() {
      this.form = {
        code: undefined,
        title: undefined,
        parentId: this.currentId,
        href: undefined,
        icon: undefined,
        orderNum: undefined,
        description: undefined,
        path: undefined,
        enabled: undefined
      }
    }
  }
}
</script>

