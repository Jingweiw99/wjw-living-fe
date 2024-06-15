import http from '@/utils/httpRequest.js'

export function policy() {
  return new Promise((resolve, reject) => {
    http({
      url: http.adornUrl("/service/oss/policy"),
      // 后面通过nacos和网关解决 统一 localhost:5050/api/service/oss/policy
      // 比如浏览器请求localhost:5050/api/service/oss/policy/path1被后台重写为转发给localhost:7070/oss/policy/path1访问真正的微服务地址
      // url: "http://localhost:7070/oss/policy",
      method: "get",
      params: http.adornParams({})
    }).then(({data}) => {
      resolve(data);
    })
  });
}
