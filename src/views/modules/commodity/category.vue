<template>
  <div>
    <el-button type="danger" @click="batchDelete">批量删除</el-button>
    <el-tree
      ref="categoryTree"
      :data="data"
      :props="defaultProps"
      show-checkbox
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
          <el-button type="text" size="mini" @click="edit(data)">
            Edit
          </el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog title="添加分类" :visible.sync="dialogVisible" width="30%">
      <el-form :model="category">
        <el-form-item label="分类名">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="category.proUnit" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
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
      },
      dialogType: "", // edit add
      updateNeedParentId: 0
    };
  },
  methods: {
    append(data) {
      this.dialogVisible = true;
      this.dialogType = "add";
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
    addOrUpdate() {
      if (this.dialogType == "add") {
        this.addCategory();
      } else {
        this.updateCategory();
      }
    },
    addCategory() {
      this.$http({
        // url: "http://localhost:9090/commodity/category/save",
        url: this.$http.adornUrl(`/commodity/category/save`),
        method: "post",
        data: this.category
      }).then(() => {
        this.$message({
          message: "分类信息保存成功",
          type: "success"
        });
        this.dialogVisible = false;
        this.getData();
        // 设置默认展开的菜单
        this.expandedKey = [this.category.parentId];
      });
    },
    updateCategory() {
      const { id, name, proUnit, icon } = this.category;
      console.log(this.category, "更新的category信息1");
      this.$http({
        // url: "http://localhost:9090/commodity/category/update",
        url: this.$http.adornUrl(`/commodity/category/update`),
        method: "post",
        data: { id, name, proUnit, icon }
      }).then(() => {
        this.$message({
          message: "分类信息更新成功",
          type: "success"
        });
        this.dialogVisible = false;
        this.getData();
        console.log(this.category, "更新的category信息2");
        // 设置默认展开的菜单 这样不用再发送一次请求获取parentId了
        this.expandedKey = [this.updateNeedParentId];
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
            // url: "http://localhost:9090/commodity/category/delete",
            url: this.$http.adornUrl(`/commodity/category/delete`),
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
    edit(data) {
      this.dialogVisible = true;
      //发送请求, 到数据库获取当前分类的实时数据
      console.log(data, "编辑的data");
      this.$http({
        // url: `http://localhost:9090/commodity/category/info/${data.id}`,
        url: this.$http.adornUrl(`/commodity/category/info/${data.id}`),
        method: "get"
      }).then(({ data }) => {
        //请求成功
        console.log("要回显的数据", data);
        this.dialogType = "edit";
        //将返回的 data 数据字段信息，分别绑定到 category 对象
        this.category.name = data.category.name;
        this.category.id = data.category.id;
        this.category.icon = data.category.icon;
        this.category.proUnit = data.category.proUnit;
        this.updateNeedParentId = data.category.parentId;
        //不修改的，可以不用绑定
        // this.category.parentId = data.category.parentId;
        // this.category.catLevel = data.category.catLevel;
        // this.category.sort = data.category.sort;
        // this.category.isShow = data.category.isShow;
      });
    },
    getData() {
      this.$http({
        // url: "http://localhost:9090/commodity/category/list/tree",
        url: this.$http.adornUrl(`/commodity/category/list/tree`),
        method: "get"
      }).then(res => {
        console.log(res, "resres");
        this.data = res.data.data;
      });
    },
    batchDelete() {
      const checkedNodes = this.$refs.categoryTree.getCheckedNodes();
      console.log("选中的节点为: " + checkedNodes);
      let ids = []; // 给后台传递的批量删除id
      let categoryNames = []; //收集分类名，给出提示
      for (let i = 0; i < checkedNodes.length; i++) {
        ids.push(checkedNodes[i].id);
        categoryNames.push(checkedNodes[i].name);
      }
      this.$confirm(`是否批量删除【${categoryNames}】菜单?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http({
            // url: "http://localhost:9090/commodity/category/delete",
            url: this.$http.adornUrl(`/commodity/category/delete`),
            method: "post",
            data: this.$http.adornData(ids, false)
          }).then(({ data }) => {
            this.$message({
              message: "家居分类批量删除 OK",
              type: "success"
            });
            //刷新分类列表
            this.getData();
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style scoped></style>
