import request from "@/utils/request";

/** 可领取的优惠券列表 */
export function getAvailableCoupons() {
  return request({
    url: "/api/coupon/list",
    method: "get",
  });
}

/** 领取优惠券 */
export function receiveCoupon(couponId) {
  return request({
    url: "/api/coupon/receive",
    method: "post",
    params: { couponId },
  });
}

/** 我的优惠券列表 */
export function getMyCoupons(status) {
  return request({
    url: "/api/coupon/mine",
    method: "get",
    params: { status },
  });
}

/** 下单时可用的优惠券 */
export function getUsableCoupons(orderAmount) {
  return request({
    url: "/api/coupon/available",
    method: "get",
    params: { orderAmount },
  });
}
