<template>
  <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
</template>

<script>
export default {
  name: 'category',
  data() {
    return {
      data: null,
      defaultProps: {
        children: 'childrenCategories',
        label: 'name'
      }
    }
  },
  methods: {
    handleNodeClick(data) {
      console.log(data)
    }
  },
  mounted() {
    this.$http({
      url: 'http://localhost:9090/commodity/category/list/tree',
      method: 'get',
    }).then(res => {
      console.log(res, "resres")
      this.data = res.data.data;
    })
  }
}
</script>

<style scoped>

</style>
