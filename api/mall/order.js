import request from "@/utils/request";

/**
 * 创建订单
 * 对应后端 POST /api/order/create
 * @param {Object} data 订单信息（addressId/deliveryType/storeId/cartIds/remark）
 */
export function createOrder(data) {
  return request({
    url: "/api/order/create",
    method: "post",
    data,
  });
}

/**
 * 获取当前用户订单列表（分页）
 * 对应后端 GET /api/order/list
 * @param {Object} params - { status?: 10|20|30|40|50, pageNum, pageSize }
 *   status 不传或为0时返回全部状态
 */
export function getOrderList(params) {
  return request({
    url: "/api/order/list",
    method: "get",
    params,
  });
}

/**
 * 获取订单详情
 * 对应后端 GET /api/order/detail/{id}
 * @param {number} orderId 订单ID
 */
export function getOrderDetail(orderId) {
  return request({
    url: `/api/order/detail/${orderId}`,
    method: "get",
  });
}

/**
 * 支付订单（模拟支付）
 * 对应后端 POST /api/order/pay
 * 待支付状态且未超时15分钟时直接完成支付，否则自动取消
 * @param {number} orderId 订单ID
 * @param {string} payType 支付方式：wechat（微信）/ alipay（支付宝），默认wechat
 */
export function payOrder(orderId, payType = "wechat") {
  return request({
    url: "/api/order/pay",
    method: "post",
    data: { orderId, payType },
  });
}

/**
 * 取消订单
 * 对应后端 PUT /api/order/cancel/{id}
 * 只有待支付(status=10)状态可取消
 * @param {number} orderId 订单ID
 */
export function cancelOrder(orderId) {
  return request({
    url: `/api/order/cancel/${orderId}`,
    method: "put",
  });
}

/**
 * 确认收货
 * 对应后端 PUT /api/order/confirm/{id}
 * 将订单状态从待收货(30)更新为已完成(40)
 * @param {number} orderId 订单ID
 */
export function confirmOrder(orderId) {
  return request({
    url: `/api/order/confirm/${orderId}`,
    method: "put",
  });
}

/**
 * 获取订单各状态数量统计（用于个人中心角标）
 * 对应后端 GET /api/order/statistics
 * 返回：{ waitPay, waitShip, waitReceive, afterSale }
 */
export function getOrderStatistics() {
  return request({
    url: "/api/order/statistics",
    method: "get",
  });
}
