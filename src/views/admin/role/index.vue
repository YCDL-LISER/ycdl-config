<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input v-model="query.keyword" class="filter-item" style="width: 200px;" placeholder="请输入角色信息" clearable @keyup.enter.native="handleSearch"/>
      <el-select v-model="query.enabled" placeholder="是否启用" class="filter-item" clearable>
        <el-option v-for="item in enabledOptions" :key="item.codeKey" :label="item.codeValue" :value="item.codeKey"/>
      </el-select>
      <el-date-picker v-model="query.start" type="datetime" placeholder="创建开始时间" class="filter-item"/>
      <span>-</span>
      <el-date-picker v-model="query.end" type="datetime" placeholder="创建截至时间" class="filter-item"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
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
      max-height="400"
      border
      highlight-current-row>
      <el-table-column type="selection" align="center"/>
      <el-table-column type="index" align="center" label="序号"/>
      <el-table-column v-if="false" align="center" label="角色ID">
        <template slot-scope="scope">
          <span>{{ scope.row.roleId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色编码">
        <template slot-scope="scope">
          <span>{{ scope.row.roleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称">
        <template slot-scope="scope">
          <span>{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否启用">
        <template slot-scope="scope">
        <el-switch v-model="scope.row.enabled" @change="switchChange(scope.$index,scope.row)"/></template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="创建时间">
        <template slot-scope="scope">
          <span>
            {{ scope.row.createTime | dateFilter }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" type="success" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination
        :current-page.sync="query.page"
        :page-sizes="[10,20,30,40,50]"
        :page-size="query.limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChange"
        @current-change="currentChange"/>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogVisible" width="30%">
      <el-form :ref="formKey" :model="form" label-width="80px">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode" placeholder="请输入角色编码"/>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"/>
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch v-model="form.enabled"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { page, addObj, putObj, delObj } from '@/api/admin/role'
export default {
  name: 'Role',
  data() {
    return {
      enabledOptions: [],
      query: {
        page: 1,
        limit: 20,
        keyword: undefined,
        enabled: undefined,
        start: undefined,
        end: undefined
      },
      tableKey: 'roleTable',
      list: null,
      total: null,
      listLoading: true,
      dialogVisible: false,
      dialogStatus: undefined,
      textMap: {
        true: '创建',
        false: '编辑'
      },
      formKey: 'roleForm',
      form: {
        roleId: undefined,
        roleCode: undefined,
        roleName: undefined,
        remark: undefined,
        enabled: undefined
      }
    }
  },
  computed: {
    ...mapGetters([
      'dictionaryList'
    ])
  },
  created() {
    this.enabledOptions = this.dictionaryList['enabled']
    this.queryList()
  },
  methods: {
    queryList() {
      this.listLoading = true
      page(this.query)
        .then(response => {
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
    },
    handleSearch() {
      this.queryList()
    },
    sizeChange(val) {
      this.listQuery.limit = val
      this.queryList()
    },
    currentChange(val) {
      this.listQuery.page = val
      this.queryList()
    },
    switchChange(index, row) {
      console.log('索引：', index, '数据：', row)
    },
    handleCreate() {
      this.dialogVisible = true
      this.dialogStatus = true
      this.form = {}
    },
    handleUpdate(row) {
      this.dialogVisible = true
      this.dialogStatus = false
      this.form = JSON.parse(JSON.stringify(row))
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delObj(row.roleId).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.queryList()
        })
      })
    },
    cancel() {
      this.$refs[this.formKey].resetFields()
      this.dialogVisible = false
    },
    submit() {
      if (this.dialogStatus) {
        this.create()
      } else {
        this.update()
      }
      this.queryList()
    },
    create() {
      addObj(this.form).then(() => {
        this.dialogVisible = false
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    update() {
      putObj(this.form.roleId, this.form).then(() => {
        this.dialogVisible = false
        this.$notify({
          title: '成功',
          message: '编辑成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
