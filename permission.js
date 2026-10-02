import { getToken } from "@/utils/auth";

// 登录页面
const loginPage = "/pages/login";

// 页面白名单
const whiteList = [
  "/pages/login",
  "/pages/register",
  "/pages/common/webview/index",
];

// 检查地址白名单
function checkWhite(url) {
  const path = url.split("?")[0];
  return whiteList.indexOf(path) !== -1;
}

// 页面跳转验证拦截器
let list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
list.forEach((item) => {
  uni.addInterceptor(item, {
    invoke(to) {
      if (getToken()) {
        // 已登录时，放行所有跳转（包括401后手动跳转到登录页）
        // 不再强制拦截已登录用户跳到登录页，避免与401过期处理逻辑冲突
        return true;
      } else {
        if (checkWhite(to.url)) {
          return true;
        }
        uni.reLaunch({ url: loginPage });
        return false;
      }
    },
    fail(err) {
      console.log(err);
    },
  });
});
