import request from "@/utils/request";

/** 提交评价 */
export function addReview(data) {
  return request({
    url: "/api/review/add",
    method: "post",
    data,
  });
}

/** 获取商品评价列表 */
export function getProductReviews(productId, params) {
  return request({
    url: `/api/review/product/${productId}`,
    method: "get",
    params,
  });
}

/** 检查订单是否已评价 */
export function checkReviewed(orderId) {
  return request({
    url: `/api/review/check/${orderId}`,
    method: "get",
  });
}
