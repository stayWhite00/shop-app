import request from "@/utils/request";

/**
 * 发送验证码
 * @param {string} phone 手机号
 */
export function sendCode(phone) {
  return request({
    url: "/api/user/sendCode",
    method: "post",
    data: { phone },
  });
}

/**
 * 手机验证码登录
 * @param {string} phone 手机号
 * @param {string} code 验证码
 */
export function login(phone, code) {
  return request({
    url: "/api/user/login",
    method: "post",
    data: { phone, code },
  });
}

/**
 * 微信小程序登录
 * @param {string} code 微信临时code
 */
export function wechatLogin(code) {
  return request({
    url: "/api/user/wechatLogin",
    method: "post",
    data: { code },
  });
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: "/api/user/info",
    method: "get",
  });
}

/**
 * 添加收货地址
 * 对应后端 POST /api/user/address/add
 * @param {Object} data 地址信息
 */
export function addAddress(data) {
  return request({
    url: "/api/user/address/add",
    method: "post",
    data,
  });
}

/**
 * 更新收货地址
 * 对应后端 PUT /api/user/address/update
 * @param {Object} data 地址信息
 */
export function updateAddress(data) {
  return request({
    url: "/api/user/address/update",
    method: "put",
    data,
  });
}

/**
 * 删除收货地址
 * 对应后端 DELETE /api/user/address/delete/{id}
 * @param {number} addressId 地址ID
 */
export function deleteAddress(addressId) {
  return request({
    url: `/api/user/address/delete/${addressId}`,
    method: "delete",
  });
}

/**
 * 获取收货地址列表
 */
export function getAddressList() {
  return request({
    url: "/api/user/address/list",
    method: "get",
  });
}

/**
 * 设置默认地址
 * 对应后端 PUT /api/user/address/setDefault/{id}
 * @param {number} addressId 地址ID
 */
export function setDefaultAddress(addressId) {
  return request({
    url: `/api/user/address/setDefault/${addressId}`,
    method: "put",
  });
}
