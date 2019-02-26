<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        style="width: 200px;"
        class="filter-item"
        placeholder="姓名或账户"
        clearable
        @keyup.enter.native="handleFilter"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>

    <div class="filter-container">
      <el-button-group>
        <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">添加</el-button>
        <el-button class="filter-item" type="primary" icon="el-icon-delete" @click="handleCreate">批量删除</el-button>
      </el-button-group>
    </div>

    <el-table
      v-loading.body="listLoading"
      :key="tableKey"
      :data="list"
      border
      highlight-current-row
      style="width: 100%">
      <el-table-column type="selection" align="center" width="50"/>
      <el-table-column type="index" align="center" label="序号" width="50"/>
      <el-table-column v-if="false" align="center" label="用户ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="姓名" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="账户" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="性别" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.sex | dictionaryFilter('sex') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="邮箱" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="手机号" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户状态" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.userStatus | dictionaryFilter('userStatus') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="注册时间" width="160">
        <template slot-scope="scope">
          <span>
            {{ scope.row.registrationDate | dateFilter }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="200">
        <template slot-scope="scope">
          <el-button size="small" type="success" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination
        :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30,40,50]"
        :page-size="listQuery.limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="30%">
      <el-form :ref="formKey" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入姓名"/>
        </el-form-item>
        <el-form-item label="账户" prop="username">
          <el-input v-model="form.username" placeholder="请输入账户"/>
        </el-form-item>
        <el-form-item v-if="createStatus" label="密码" placeholder="请输入密码" prop="password">
          <el-input v-model="form.password" type="password"/>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio v-for="item in sexOptions" :key="item.codeKey" :label="item.codeKey">{{ item.codeValue }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱" placeholder="请输入邮箱地址" prop="email">
          <el-input v-model="form.email" type="email"/>
        </el-form-item>
        <el-form-item label="手机号" placeholder="请输入手机号" prop="mobile">
          <el-input v-model="form.mobile" type="mobile"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel(formKey)">取 消</el-button>
        <el-button v-if="createStatus" type="primary" @click="create(formKey)">确 定</el-button>
        <el-button v-else type="primary" @click="update(formKey)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, addObj, delObj, putObj } from '@/api/admin/user'
import { mapGetters } from 'vuex'
export default {
  name: 'User',
  data() {
    return {
      form: {
        userId: undefined,
        nickname: undefined,
        username: undefined,
        password: undefined,
        sex: undefined,
        email: undefined,
        mobile: undefined,
        userStatus: undefined,
        registrationDate: undefined
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入用户',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        username: [
          {
            required: true,
            message: '请输入账户',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 20,
            message: '长度在 5 到 20 个字符',
            trigger: 'blur'
          }
        ]
      },
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined
      },
      sexOptions: null,
      dialogFormVisible: false,
      dialogStatus: '',
      createStatus: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0,
      formKey: 'userForm'
    }
  },
  computed: {
    ...mapGetters([
      'dictionaryList'
    ])
  },
  created() {
    this.getList()
    try {
      this.sexOptions = this.dictionaryList['sex']
    } catch (e) {
      this.sexOptions = null
    }
  },
  methods: {
    handleFilter() {
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.createStatus = true
      this.reset()
    },
    handleUpdate(row) {
      this.form.userId = row.userId
      this.form.nickname = row.nickname
      this.form.username = row.username
      this.form.sex = row.sex
      this.form.email = row.email
      this.form.mobile = row.mobile
      this.form.userStatus = row.userStatus
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
      console.log(JSON.stringify(this.form))
      // getObj(row.id)
      //   .then(response => {
      //     this.form = response.data
      //     this.dialogFormVisible = true
      //     this.dialogStatus = 'update'
      //   })
    },
    create(formName) {
      const set = this.$refs
      set[formName].validate(valid => {
        if (valid) {
          addObj(this.form)
            .then(() => {
              this.dialogFormVisible = false
              this.getList()
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
        } else {
          return false
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delObj(row.userId)
          .then(() => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            const index = this.list.indexOf(row)
            this.list.splice(index, 1)
          })
      })
    },
    update(formName) {
      const set = this.$refs
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false
          this.form.password = undefined
          putObj(this.form.userId, this.form).then(() => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })
          })
        } else {
          return false
        }
      })
    },
    getList() {
      this.listLoading = true
      page(this.listQuery)
        .then(response => {
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
    },
    cancel(formName) {
      this.dialogFormVisible = false
      this.createStatus = false
      // this.$refs[formName].resetFields()
    },
    reset() {
      this.form = {
        userId: undefined,
        nickname: undefined,
        username: undefined,
        password: undefined,
        sex: undefined,
        email: undefined,
        mobile: undefined,
        userStatus: undefined,
        registrationDate: undefined
      }
    },
    associatedRoles() {
      return null
    }
  }
}
</script>
