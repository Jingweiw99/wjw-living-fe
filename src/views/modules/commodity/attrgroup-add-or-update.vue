<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @closed="dialogClose"
  >
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item label="组名" prop="name">
        <el-input v-model="dataForm.name" placeholder="组名"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="dataForm.sort" placeholder="排序"></el-input>
      </el-form-item>
      <el-form-item label="说明" prop="description">
        <el-input v-model="dataForm.description" placeholder="说明"></el-input>
      </el-form-item>
      <el-form-item label="组图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="组图标"></el-input>
      </el-form-item>
      <el-form-item label="所属分类 id" prop="categoryId">
        <!-- <el-input v-model="dataForm.categoryId" placeholder="所属分类 id"></el-input> -->
        <!-- 修改为级联选择器 -->
        <el-cascader
          v-model="casValue"
          :options="casOptions"
          :props="casProps"
          @change="casHandleChange"
          filterable
          placeholder="搜索: "
        ></el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        name: "",
        sort: "",
        description: "",
        icon: "",
        categoryId: 0
      },
      dataRule: {
        name: [{ required: true, message: "组名不能为空", trigger: "blur" }],
        sort: [{ required: true, message: "排序不能为空", trigger: "blur" }],
        description: [
          { required: true, message: "说明不能为空", trigger: "blur" }
        ],
        icon: [{ required: true, message: "组图标不能为空", trigger: "blur" }],
        categoryId: [
          { required: true, message: "所属分类 id不能为空", trigger: "blur" }
        ]
      },
      casValue: [],
      casProps: {
        value: "id",
        label: "name",
        children: "childrenCategories"
      },
      casOptions: [] // 所有的家居tree信息
    };
  },
  methods: {
    init(id) {
      console.log("init", this.casValue); // 初始化的时候级联选择器显示不正确=> 找到这个变量 发现为空 => 初始化的时候添加上
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(
              `/commodity/attrgroup/info/${this.dataForm.id}`
            ),
            method: "get",
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.name = data.attrgroup.name;
              this.dataForm.sort = data.attrgroup.sort;
              this.dataForm.description = data.attrgroup.description;
              this.dataForm.icon = data.attrgroup.icon;
              this.dataForm.categoryId = data.attrgroup.categoryId;
              console.log(this.casValue, data, 666); // 这个时候有了categoryId可以通过categoryId找到父级，父级的父级id，然后变成数组，赋值给casValue显示。。 也可以后端返回
              this.casValue = data.attrgroup.cascadedCategoryId;
            }
          });
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/commodity/attrgroup/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              name: this.dataForm.name,
              sort: this.dataForm.sort,
              description: this.dataForm.description,
              icon: this.dataForm.icon,
              categoryId: this.casValue[this.casValue.length - 1]
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                }
              });
            } else {
              this.$message.error(data.msg);
            }
          });
        }
      });
    },
    casHandleChange(value) {
      console.log("选中的value值为: ", value, value.toString().split(","));
      this.casValue = value;
    },
    // 在修改了级联选择器id，弹窗关闭之后，会显示上一次的级联id
    dialogClose() {
      this.casValue = [];
    }
  },
  created() {
    this.$http({
      url: this.$http.adornUrl(`/commodity/category/list/tree`),
      method: "get"
    }).then(res => {
      console.log(res, "resres");
      this.casOptions = res.data.data;
    });
  }
};
</script>
