import request from "@/utils/request";

/**
 * 获取门店列表
 */
export function getStoreList() {
  return request({
    url: "/api/store/list",
    method: "get",
  });
}

/**
 * 获取门店详情
 * @param {number} storeId 门店ID
 */
export function getStoreDetail(storeId) {
  return request({
    url: `/api/store/query/detail/${storeId}`,
    method: "get",
  });
}
