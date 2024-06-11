<template>
  <div>
    <el-tree
      :data="data"
      :props="defaultProps"
      :default-expanded-keys="expandedKey"
      node-key="id"
      :expand-on-click-node="false"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <!-- 最后一级不能append，其他级不能remove-->
          <el-button
            type="text"
            size="mini"
            v-if="node.level <= 2"
            @click="() => append(data)"
          >
            Append
          </el-button>
          <el-button
            type="text"
            size="mini"
            v-if="node.childNodes.length == 0"
            @click="() => remove(node, data)"
          >
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog title="添加分类" :visible.sync="dialogVisible" width="30%">
      <el-form :model="category">
        <el-form-item label="分类名">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "category",
  data() {
    return {
      data: null,
      defaultProps: {
        children: "childrenCategories",
        label: "name"
      },
      expandedKey: [],
      dialogVisible: false,
      category: {
        //初始化添加分类的表单对象数据
        name: "",
        parentId: 0,
        catLevel: 0,
        isShow: 1,
        sort: 0,
        proCount: 0,
        proUnit: "",
        icon: "",
        id: null
      }
    };
  },
  methods: {
    append(data) {
      this.dialogVisible = true;
      this.category.parentId = data.id;
      //添加的分类为其父类的层级+1, 这里*1 是为了将字符串转成数值
      this.category.catLevel = data.catLevel * 1 + 1;
      this.category.id = null;
      this.category.name = "";
      this.category.icon = "";
      this.category.proUnit = "";
      this.category.proCount = 0;
      this.category.sort = 0;
      this.category.isShow = 1;
      console.log("this.category= ", this.category);
    },
    addCategory() {
      this.$http({
        url: "http://localhost:9090/commodity/category/save",
        method: "post",
        data: this.category
      }).then(() => {
        this.$message({
          message: "分类信息保存成功",
          type: "success"
        })
        this.dialogVisible = false
        this.getData();
        // 设置默认展开的菜单
        this.expandedKey = [this.category.parentId];
      });
    },
    remove(node, data) {
      this.$confirm(`是否删除【${data.name}】菜单?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http({
            url: "http://localhost:9090/commodity/category/delete",
            method: "post",
            data: [data.id]
          }).then(() => {
            this.getData();
            // 设置默认展开的菜单
            this.expandedKey = [node.parent.data.id];
          });
        })
        .catch(() => {
          console.log("取消了删除~");
        });
    },
    getData() {
      this.$http({
        url: "http://localhost:9090/commodity/category/list/tree",
        method: "get"
      }).then(res => {
        console.log(res, "resres");
        this.data = res.data.data;
      });
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style scoped></style>
