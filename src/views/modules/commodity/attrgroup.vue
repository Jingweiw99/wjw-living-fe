<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="5">
        <el-tree
          ref="categoryTree"
          :data="data"
          :props="defaultProps"
          node-key="id"
          @node-click="nodeclick"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="19">
        <div class="mod-config">
          <el-form
            :inline="true"
            :model="dataForm"
            @keyup.enter.native="getDataList()"
          >
            <el-form-item>
              <el-input
                v-model="dataForm.key"
                placeholder="参数名"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="getDataList()">查询</el-button>
              <el-button
                v-if="isAuth('commodity:attrgroup:save')"
                type="primary"
                @click="addOrUpdateHandle()"
                >新增</el-button
              >
              <el-button
                v-if="isAuth('commodity:attrgroup:delete')"
                type="danger"
                @click="deleteHandle()"
                :disabled="dataListSelections.length <= 0"
                >批量删除</el-button
              >
            </el-form-item>
          </el-form>
          <el-table
            :data="dataList"
            border
            v-loading="dataListLoading"
            @selection-change="selectionChangeHandle"
            style="width: 100%;"
          >
            <el-table-column
              type="selection"
              header-align="center"
              align="center"
              width="50"
            >
            </el-table-column>
            <el-table-column
              prop="id"
              header-align="center"
              align="center"
              label="id"
            >
            </el-table-column>
            <el-table-column
              prop="name"
              header-align="center"
              align="center"
              label="组名"
            >
            </el-table-column>
            <el-table-column
              prop="sort"
              header-align="center"
              align="center"
              label="排序"
            >
            </el-table-column>
            <el-table-column
              prop="description"
              header-align="center"
              align="center"
              label="说明"
            >
            </el-table-column>
            <el-table-column
              prop="icon"
              header-align="center"
              align="center"
              label="组图标"
            >
            </el-table-column>
            <el-table-column
              prop="categoryId"
              header-align="center"
              align="center"
              label="所属分类 id"
            >
            </el-table-column>
            <el-table-column
              fixed="right"
              header-align="center"
              align="center"
              width="150"
              label="操作"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="addOrUpdateHandle(scope.row.id)"
                  >修改</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  @click="deleteHandle(scope.row.id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="pageIndex"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper"
          >
          </el-pagination>
          <!-- 弹窗, 新增 / 修改 -->
          <add-or-update
            v-if="addOrUpdateVisible"
            ref="addOrUpdate"
            @refreshDataList="getDataList"
          ></add-or-update>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AddOrUpdate from "./attrgroup-add-or-update";
export default {
  data() {
    return {
      dataForm: {
        key: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      data: [],
      defaultProps: {
        children: "childrenCategories",
        label: "name"
      },
      catId: 0
    };
  },
  components: {
    AddOrUpdate
  },
  activated() {
    this.getDataList();
  },
  created() {
    this.getCategories();
  },
  methods: {
    nodeclick(data, node, component) {
      console.log("category 的节点被点击= ", data, node, component);
      console.log("category 的节点被点击 id= ", data.id);
      //如果点击的是第三级分类，就查询该分类的属性组信息, 否则不处理
      if (data.catLevel == 3) {
        this.catId = data.id;
        this.getDataList(); //刷新数据
      }
    },
    getCategories() {
      this.$http({
        url: this.$http.adornUrl("/commodity/category/list/tree"),
        method: "get"
      }).then(({ data }) => {
        this.data = data.data;
      });
    },
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;

      this.$http({
        url: this.$http.adornUrl(
          `/commodity/attrgroup/list/${this.catId}?key=${
            this.dataForm.key
          }&page=${this.pageIndex}&limit=${this.pageSize}`
        ),
        method: "get"
        // params: this.$http.adornData({
        //   page: this.pageIndex,
        //   limit: this.pageSize,
        //   // key: this.dataForm.key
        // })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
      console.log(this.pageIndex, this.pageSize, this.dataForm.key, this.catId);
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    // 删除
    deleteHandle(id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map(item => {
            return item.id;
          });
      this.$confirm(
        `确定对[id=${ids.join(",")}]进行[${id ? "删除" : "批量删除"}]操作?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl("/commodity/attrgroup/delete"),
          method: "post",
          data: this.$http.adornData(ids, false)
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: "操作成功",
              type: "success",
              duration: 1500,
              onClose: () => {
                this.getDataList();
              }
            });
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    }
  }
};
</script>
