import request from "@/utils/request";

/** 获取我的会员信息 */
export function getMemberInfo() {
  return request({
    url: "/api/member/info",
    method: "get",
  });
}

/** 申请开通会员(免费) */
export function applyMember(data) {
  return request({
    url: "/api/member/apply",
    method: "post",
    data: data,
  });
}

/** 获取等级规则 */
export function getLevelRules() {
  return request({
    url: "/api/member/levelRules",
    method: "get",
  });
}
