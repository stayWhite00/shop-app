import config from "@/config";
import { getToken, removeToken } from "@/utils/auth";
import errorCode from "@/utils/errorCode";
import { useUserStore } from "@/store/modules/user";
import { toast, showConfirm, tansParams } from "@/utils/common";

let timeout = 10000;
const baseUrl = config.baseUrl;

// 防止401弹窗重复弹出
let isShowingExpiredModal = false;

const request = (config) => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false;
  config.header = config.header || {};
  if (getToken() && !isToken) {
    config.header["Admin-Token"] = getToken();
  }
  // get请求映射params参数
  if (config.params) {
    let url = config.url + "?" + tansParams(config.params);
    url = url.slice(0, -1);
    config.url = url;
  }
  return new Promise((resolve, reject) => {
    uni
      .request({
        method: config.method || "get",
        timeout: config.timeout || timeout,
        url: config.baseUrl || baseUrl + config.url,
        data: config.data,
        header: config.header,
        dataType: "json",
      })
      .then((response) => {
        const res = response;
        const code = res.data.code || 200;
        const msg = errorCode[code] || res.data.msg || errorCode["default"];
        if (code === 401) {
          // 防止多个请求同时触发多次弹窗
          // 同时：如果已经在登录页了，不再弹窗
          const currentPages = getCurrentPages();
          const currentPage = currentPages[currentPages.length - 1];
          const currentRoute = currentPage ? "/" + currentPage.route : "";
          if (!isShowingExpiredModal && currentRoute !== "/pages/login") {
            isShowingExpiredModal = true;
            showConfirm(
              "登录状态已过期，您可以继续留在该页面，或者重新登录?",
            ).then((modalRes) => {
              isShowingExpiredModal = false;
              if (modalRes.confirm) {
                // 先同步清空 token，permission.js 拦截器会放行
                removeToken();
                useUserStore()
                  .logOut()
                  .finally(() => {
                    uni.reLaunch({ url: "/pages/login" });
                  });
              }
            });
          }
          reject("无效的会话，或者会话已过期，请重新登录。");
          return;
        } else if (code === 500) {
          toast(msg);
          reject("500");
          return;
        } else if (code !== 200) {
          toast(msg);
          reject(code);
          return;
        }
        resolve(res.data);
      })
      .catch((error) => {
        let { message } = error;
        if (message === "Network Error") {
          message = "后端接口连接异常";
        } else if (message.includes("timeout")) {
          message = "系统接口请求超时";
        } else if (message.includes("Request failed with status code")) {
          message = "系统接口" + message.slice(-3) + "异常";
        }
        toast(message);
        reject(error);
      });
  });
};

export default request;
