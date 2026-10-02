import request from "@/utils/request";

/**
 * 获取商品分类列表
 * @param {number} parentId 父分类ID,0表示获取一级分类
 */
export function getCategoryList(parentId = 0) {
  return request({
    url: "/api/product/category/list",
    method: "get",
    params: { parentId },
  });
}

/**
 * 获取商品列表
 * @param {Object} params 查询参数
 */
export function getProductList(params) {
  return request({
    url: "/api/product/list",
    method: "get",
    params,
  });
}

/**
 * 获取商品详情
 * @param {number} productId 商品ID
 */
export function getProductDetail(productId) {
  return request({
    url: `/api/product/detail/${productId}`,
    method: "get",
  });
}

/**
 * 搜索商品
 * 对应后端 GET /api/product/search?keyword=xxx&pageNum=1&pageSize=20
 * @param {string} keyword 搜索关键词
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页数量
 */
export function searchProduct(keyword, pageNum = 1, pageSize = 20) {
  return request({
    url: "/api/product/search",
    method: "get",
    params: {
      keyword,
      pageNum,
      pageSize,
    },
  });
}
