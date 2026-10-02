<template>
  <view class="mine-container">
    <!-- 顶部个人资料区域 -->
    <view class="header-section">
      <view class="user-card-wrap">
        <view class="user-card flex align-center" @click="handleToInfo">
          <view class="avatar-box">
            <image
              v-if="avatar"
              :src="avatar"
              class="avatar-img"
              mode="aspectFill"
            ></image>
            <view v-else class="avatar-default">
              <text class="iconfont icon-people"></text>
            </view>
          </view>
          <view class="user-info-box">
            <view v-if="name" class="user-name">{{ name }}</view>
            <view v-else class="login-prompt" @click.stop="handleToLogin"
              >点击登录/注册</view
            >
            <view class="user-level" v-if="name" @click.stop="handleToMember">
              <text class="iconfont icon-vip-fill vip-icon"></text>
              <text class="level-text">{{
                memberInfo.levelName || "普通用户"
              }}</text>
            </view>
          </view>
          <view class="setting-btn" @click.stop="handleToSetting">
            <text class="iconfont icon-setting"></text>
          </view>
        </view>
      </view>

      <!-- 资产面板 -->
      <view class="asset-panel grid col-3">
        <view class="asset-item" @click="handleToMember">
          <text class="asset-value">{{
            memberInfo.member?.growthValue || 0
          }}</text>
          <text class="asset-label">成长值</text>
        </view>
        <view class="asset-item" @click="handleToMember">
          <text class="asset-value">Lv{{ memberInfo.member?.level || 0 }}</text>
          <text class="asset-label">等级</text>
        </view>
        <view class="asset-item" @click="handleToCoupon">
          <text class="asset-value">{{ couponCount }}</text>
          <text class="asset-label">优惠券</text>
        </view>
      </view>
    </view>

    <view class="content-section">
      <!-- 订单管理 -->
      <view class="order-section card-box">
        <view class="section-title flex justify-between align-center">
          <text class="title-text">我的订单</text>
          <view class="all-orders" @click="handleOrderList(0)">
            <text>查看全部</text>
            <text class="iconfont icon-right"></text>
          </view>
        </view>
        <view class="order-grid grid col-5">
          <view class="order-item" @click="handleOrderList(10)">
            <view class="icon-wrap">
              <text class="iconfont icon-pay"></text>
              <view class="badge" v-if="orderCount.waitPay > 0">{{
                orderCount.waitPay
              }}</view>
            </view>
            <text class="label">待付款</text>
          </view>
          <view class="order-item" @click="handleOrderList(20)">
            <view class="icon-wrap">
              <text class="iconfont icon-send"></text>
              <view class="badge" v-if="orderCount.waitShip > 0">{{
                orderCount.waitShip
              }}</view>
            </view>
            <text class="label">待发货</text>
          </view>
          <view class="order-item" @click="handleOrderList(30)">
            <view class="icon-wrap">
              <text class="iconfont icon-deliver"></text>
              <view class="badge" v-if="orderCount.waitReceive > 0">{{
                orderCount.waitReceive
              }}</view>
            </view>
            <text class="label">待收货</text>
          </view>
          <view class="order-item" @click="handleOrderList(40)">
            <view class="icon-wrap">
              <text class="iconfont icon-evaluate"></text>
              <view class="badge" v-if="orderCount.waitEvaluate > 0">{{
                orderCount.waitEvaluate
              }}</view>
            </view>
            <text class="label">待评价</text>
          </view>
          <view class="order-item" @click="handleOrderList(60)">
            <view class="icon-wrap">
              <text class="iconfont icon-repair"></text>
              <view class="badge" v-if="orderCount.afterSale > 0">{{
                orderCount.afterSale
              }}</view>
            </view>
            <text class="label">退款/售后</text>
          </view>
        </view>
      </view>

      <!-- 常用服务 -->
      <view class="service-section card-box">
        <view class="section-title">
          <text class="title-text">常用服务</text>
        </view>
        <view class="menu-list">
          <view
            class="menu-item flex justify-between align-center"
            @click="handleToMember"
          >
            <view class="item-left flex align-center">
              <text class="iconfont icon-peoplefill text-yellow"></text>
              <text class="item-name">会员中心</text>
            </view>
            <text class="iconfont icon-right gray-color"></text>
          </view>
          <view
            class="menu-item flex justify-between align-center"
            @click="handleToCoupon"
          >
            <view class="item-left flex align-center">
              <text class="iconfont icon-tagfill text-red"></text>
              <text class="item-name">优惠券</text>
            </view>
            <text class="iconfont icon-right gray-color"></text>
          </view>
          <view
            class="menu-item flex justify-between align-center"
            @click="handleToNotice"
          >
            <view class="item-left flex align-center">
              <text class="iconfont icon-noticefill text-green"></text>
              <text class="item-name">公告通知</text>
            </view>
            <text class="iconfont icon-right gray-color"></text>
          </view>
          <view
            class="menu-item flex justify-between align-center"
            @click="handAddress"
          >
            <view class="item-left flex align-center">
              <text class="iconfont icon-locationfill text-orange"></text>
              <text class="item-name">收货地址</text>
            </view>
            <text class="iconfont icon-right gray-color"></text>
          </view>
          <view
            class="menu-item flex justify-between align-center"
            @click="handleBuilding"
          >
            <view class="item-left flex align-center">
              <text class="iconfont icon-favorfill text-yellow"></text>
              <text class="item-name">我的收藏</text>
            </view>
            <text class="iconfont icon-right gray-color"></text>
          </view>
          <view
            class="menu-item flex justify-between align-center"
            @click="handleHelp"
          >
            <view class="item-left flex align-center">
              <text class="iconfont icon-questionfill text-blue"></text>
              <text class="item-name">常见问题</text>
            </view>
            <text class="iconfont icon-right gray-color"></text>
          </view>
          <view
            class="menu-item flex justify-between align-center"
            @click="handleAbout"
          >
            <view class="item-left flex align-center">
              <text class="iconfont icon-infofill text-green"></text>
              <text class="item-name">关于我们</text>
            </view>
            <text class="iconfont icon-right gray-color"></text>
          </view>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view class="logout-box" v-if="name">
        <button class="cu-btn block lg logout-btn" @click="handleLogout">
          退出当前账号
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from "@/store";
import { ref, computed, getCurrentInstance, onMounted } from "vue";
import { getOrderStatistics } from "@/api/mall/order";
import { getMemberInfo } from "@/api/mall/member";
import { getMyCoupons } from "@/api/mall/coupon";

const { proxy } = getCurrentInstance();
const userStore = useUserStore();

// ===== 用户信息（从全局 store 读取）=====
const name = computed(() => userStore.name);
const avatar = computed(() => userStore.avatar);

// ===== 会员信息 =====
const memberInfo = ref({ isMember: false, levelName: "普通用户" });
const couponCount = ref(0);

// ===== 订单各状态角标数量 =====
const orderCount = ref({
  waitPay: 0,
  waitShip: 0,
  waitReceive: 0,
  afterSale: 0,
});

async function getMineStatistics() {
  try {
    const res = await getOrderStatistics();
    if (res.code === 200 && res.data) {
      orderCount.value = res.data;
    }
  } catch (error) {}
}

async function loadMemberInfo() {
  try {
    const res = await getMemberInfo();
    if (res.code === 200 && res.data) {
      memberInfo.value = res.data;
    }
  } catch (e) {}
}

async function loadCouponCount() {
  try {
    const res = await getMyCoupons(0); // status=0 未使用
    if (res.code === 200 && res.data) {
      couponCount.value = res.data.length;
    }
  } catch (e) {}
}

// ===== 页面跳转方法 =====

/** 跳转至个人信息编辑页 */
function handleToInfo() {
  proxy.$tab.navigateTo("/pages/mine/info/index");
}

/** 跳转至系统设置页 */
function handleToSetting() {
  proxy.$tab.navigateTo("/pages/mine/setting/index");
}

/** 未登录时点击头像区域跳转登录页 */
function handleToLogin() {
  proxy.$tab.reLaunch("/pages/login");
}

/**
 * 退出登录
 * 弹出确认弹窗 → 清除 Sa-Token → 跳转至登录页
 */
function handleLogout() {
  proxy.$modal.confirm("确定注销并退出系统吗？").then(() => {
    userStore.logOut().then(() => {
      proxy.$tab.reLaunch("/pages/login");
    });
  });
}

/**
 * 跳转至订单列表页，并按状态筛选
 * @param {number} status - 0=全部, 1=待付款, 2=待发货, 3=待收货, 4=待评价
 */
function handleOrderList(status) {
  proxy.$tab.navigateTo(`/pages/order/list?status=${status}`);
}

/** 跳转至常见问题 */
function handleHelp() {
  proxy.$tab.navigateTo("/pages/mine/help/index");
}
/**跳转收货地址*/
function handAddress() {
  proxy.$tab.navigateTo("/pages/address/list");
}

/** 跳转至关于我们 */
function handleAbout() {
  proxy.$tab.navigateTo("/pages/mine/about/index");
}

/** 跳转至会员中心 */
function handleToMember() {
  proxy.$tab.navigateTo("/pages/member/index");
}

/** 跳转至优惠券中心 */
function handleToCoupon() {
  proxy.$tab.navigateTo("/pages/coupon/index");
}

/** 跳转至公告通知 */
function handleToNotice() {
  proxy.$tab.navigateTo("/pages/notice/index");
}

/** 功能建设中，显示提示 */
function handleBuilding() {
  proxy.$modal.showToast("模块建设中~");
}

// ===== 生命周期 =====
onMounted(() => {
  if (name.value) {
    getMineStatistics();
    loadMemberInfo();
    loadCouponCount();
  }
});
</script>

<style lang="scss" scoped>
.mine-container {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(180deg, #ff4d4f 0%, #ff7875 100%);
  padding: 60rpx 30rpx 100rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;

  .user-card-wrap {
    margin-bottom: 40rpx;
  }

  .user-card {
    position: relative;

    .avatar-box {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      border: 4rpx solid rgba(255, 255, 255, 0.8);
      overflow: hidden;
      background-color: #f0f0f0;

      .avatar-img {
        width: 100%;
        height: 100%;
      }

      .avatar-default {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ccc;

        .iconfont {
          font-size: 60rpx;
        }
      }
    }

    .user-info-box {
      margin-left: 20rpx;
      color: #ffffff;

      .user-name {
        font-size: 34rpx;
        font-weight: bold;
      }

      .login-prompt {
        font-size: 32rpx;
        font-weight: 500;
      }

      .user-level {
        margin-top: 10rpx;
        background: rgba(0, 0, 0, 0.1);
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        display: inline-flex;
        align-items: center;

        .vip-icon {
          font-size: 24rpx;
          color: #ffd700;
          margin-right: 6rpx;
        }

        .level-text {
          font-size: 20rpx;
        }
      }
    }

    .setting-btn {
      position: absolute;
      right: 0;
      top: 20rpx;

      .iconfont {
        font-size: 40rpx;
        color: #ffffff;
      }
    }
  }

  .asset-panel {
    .asset-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #ffffff;

      .asset-value {
        font-size: 32rpx;
        font-weight: bold;
      }

      .asset-label {
        font-size: 24rpx;
        margin-top: 6rpx;
        opacity: 0.9;
      }
    }
  }
}

.content-section {
  padding: 0 30rpx;
  margin-top: -60rpx;

  .card-box {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  }

  .grid.col-5 {
    display: flex;
    flex-wrap: wrap;
    & > view {
      width: 20%;
    }
  }

  .section-title {
    border-bottom: 1rpx solid #f5f5f5;
    padding-bottom: 20rpx;
    margin-bottom: 30rpx;

    .title-text {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .all-orders {
      font-size: 24rpx;
      color: #999;
      display: flex;
      align-items: center;

      .iconfont {
        font-size: 24rpx;
        margin-left: 4rpx;
      }
    }
  }

  .order-grid {
    .order-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .icon-wrap {
        position: relative;

        .iconfont {
          font-size: 50rpx;
          color: #444;
        }

        .badge {
          position: absolute;
          top: -10rpx;
          right: -10rpx;
          background-color: #ff4d4f;
          color: #fff;
          font-size: 20rpx;
          min-width: 30rpx;
          height: 30rpx;
          border-radius: 15rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6rpx;
        }
      }

      .label {
        font-size: 24rpx;
        color: #666;
        margin-top: 10rpx;
      }
    }
  }

  .menu-list {
    .menu-item {
      height: 100rpx;
      border-bottom: 1rpx solid #fafafa;

      &:last-child {
        border-bottom: none;
      }

      .item-left {
        .iconfont {
          font-size: 36rpx;
          margin-right: 20rpx;
        }

        .item-name {
          font-size: 28rpx;
          color: #333;
        }
      }

      .gray-color {
        color: #ccc;
        font-size: 26rpx;
      }
    }
  }

  .logout-box {
    margin: 40rpx 0;

    .logout-btn {
      background-color: #ffffff;
      color: #ff4d4f;
      border: 1rpx solid #ff4d4f;
      border-radius: 50rpx;
      font-size: 30rpx;
    }
  }
}
</style>
