import request from "@/utils/request";

/**
 * 添加商品到购物车
 * 对应后端 POST /api/cart/add?productId=xxx&quantity=xxx
 * @param {number} productId 商品ID
 * @param {number} quantity 数量
 */
export function addCart(productId, quantity = 1) {
  return request({
    url: "/api/cart/add",
    method: "post",
    data: { productId, quantity },
  });
}

/**
 * 获取购物车列表
 */
export function getCartList() {
  return request({
    url: "/api/cart/list",
    method: "get",
  });
}

/**
 * 更新购物车商品数量
 * 对应后端 PUT /api/cart/update?cartId=xxx&quantity=xxx
 * @param {number} cartId 购物车ID
 * @param {number} quantity 数量
 */
export function updateCartQuantity(cartId, quantity) {
  return request({
    url: "/api/cart/update",
    method: "put",
    data: { cartId, quantity },
  });
}

/**
 * 删除购物车商品
 * 对应后端 DELETE /api/cart/delete?cartIds=1,2,3
 * @param {Array} cartIds 购物车ID数组
 */
export function deleteCart(cartIds) {
  return request({
    url: "/api/cart/" + (Array.isArray(cartIds) ? cartIds.join(",") : cartIds),
    method: "delete",
  });
}

/**
 * 选中/取消选中购物车商品
 * 对应后端 PUT /api/cart/check?cartId=xxx&checked=xxx
 * @param {number} cartId 购物车ID
 * @param {number} checked 是否选中(0-否 1-是)
 */
export function toggleCartCheck(cartId, isChecked) {
  return request({
    url: "/api/cart/check",
    method: "put",
    data: { cartId, isChecked },
  });
}

/**
 * 全选/取消全选
 * 对应后端 PUT /api/cart/checkAll?checked=xxx
 * @param {number} checked 是否选中(0-否 1-是)
 */
export function toggleAllCheck(checked) {
  return request({
    url: "/api/cart/checkAll",
    method: "put",
    params: { checked },
  });
}
