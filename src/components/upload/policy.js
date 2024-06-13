import http from '@/utils/httpRequest.js'

export function policy() {
  return new Promise((resolve, reject) => {
    http({
      // url: http.adornUrl("/oss/policy"),
      // 后面通过nacos和网关解决
      url: "http://localhost:7070/oss/policy",
      // url 完整的 http://localhost:7070/api/service/oss/policy
      method: "get",
      params: http.adornParams({})
    }).then(({data}) => {
      resolve(data);
    })
  });
}
