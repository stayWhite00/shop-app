<template>
  <view class="coupon-container">
    <!-- 顶部Tab切换 -->
    <view class="tab-bar flex">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'available' }"
        @click="currentTab = 'available'"
      >
        领券中心
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'mine' }"
        @click="switchToMine"
      >
        我的优惠券
      </view>
    </view>

    <!-- 领券中心 -->
    <view v-if="currentTab === 'available'" class="coupon-list">
      <view v-if="availableList.length === 0" class="empty-tip"
        >暂无可领取的优惠券</view
      >
      <view
        class="coupon-card"
        v-for="item in availableList"
        :key="item.couponId"
        :class="{
          'full-type': item.type === 1,
          'direct-type': item.type === 2,
        }"
      >
        <view class="card-left">
          <text class="discount-value">¥{{ item.discount }}</text>
          <text class="threshold-text" v-if="item.type === 1"
            >满{{ item.threshold }}可用</text
          >
          <text class="threshold-text" v-else>立减券</text>
        </view>
        <view class="card-right">
          <text class="coupon-name">{{ item.couponName }}</text>
          <text class="coupon-time"
            >{{ item.startTime?.substring(0, 10) }} ~
            {{ item.endTime?.substring(0, 10) }}</text
          >
          <text class="target-tag" v-if="item.targetType === 1">会员专享</text>
          <text class="target-tag lv-tag" v-else-if="item.targetType === 2"
            >Lv{{ item.minUserLevel }}+</text
          >
          <view class="remain-info"
            >剩余 {{ item.remainCount }}/{{ item.totalCount }}</view
          >
        </view>
        <view class="card-btn" @click="handleReceive(item)">领取</view>
      </view>
    </view>

    <!-- 我的优惠券 -->
    <view v-else class="coupon-list">
      <!-- 状态筛选 -->
      <view class="status-bar flex">
        <view
          class="status-item"
          :class="{ active: mineStatus === null }"
          @click="loadMine(null)"
          >全部</view
        >
        <view
          class="status-item"
          :class="{ active: mineStatus === 0 }"
          @click="loadMine(0)"
          >未使用</view
        >
        <view
          class="status-item"
          :class="{ active: mineStatus === 1 }"
          @click="loadMine(1)"
          >已使用</view
        >
        <view
          class="status-item"
          :class="{ active: mineStatus === 2 }"
          @click="loadMine(2)"
          >已过期</view
        >
      </view>

      <view v-if="mineList.length === 0" class="empty-tip">暂无优惠券</view>
      <view
        class="coupon-card mine-card"
        v-for="item in mineList"
        :key="item.userCouponId"
        :class="{ disabled: item.status !== 0 }"
      >
        <view class="card-left">
          <text class="discount-value"
            >¥{{ getCouponInfo(item.couponId)?.discount || "?" }}</text
          >
          <text class="threshold-text">{{
            getCouponInfo(item.couponId)?.type === 1
              ? "满" + getCouponInfo(item.couponId)?.threshold
              : "立减"
          }}</text>
        </view>
        <view class="card-right">
          <text class="coupon-name">{{
            getCouponInfo(item.couponId)?.couponName || "优惠券"
          }}</text>
          <text class="coupon-time"
            >领取于 {{ item.receiveTime?.substring(0, 10) }}</text
          >
          <view class="mine-status">
            <text v-if="item.status === 0" class="unused-text">未使用</text>
            <text v-else-if="item.status === 1" class="used-text">已使用</text>
            <text v-else class="expired-text">已过期</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import {
  getAvailableCoupons,
  receiveCoupon,
  getMyCoupons,
} from "@/api/mall/coupon";

const { proxy } = getCurrentInstance();

const currentTab = ref("available");
const availableList = ref([]);
const mineList = ref([]);
const mineStatus = ref(null);
const couponMap = ref({}); // couponId -> coupon info cache

async function loadAvailable() {
  try {
    const res = await getAvailableCoupons();
    if (res.code === 200) {
      availableList.value = res.data || [];
      // cache coupon info
      availableList.value.forEach((c) => {
        couponMap.value[c.couponId] = c;
      });
    }
  } catch (e) {}
}

async function loadMine(status) {
  mineStatus.value = status;
  try {
    const res = await getMyCoupons(status);
    if (res.code === 200) {
      mineList.value = res.data || [];
    }
  } catch (e) {}
}

function switchToMine() {
  currentTab.value = "mine";
  loadMine(null);
}

function getCouponInfo(couponId) {
  return couponMap.value[couponId];
}

async function handleReceive(item) {
  try {
    const res = await receiveCoupon(item.couponId);
    if (res.code === 200) {
      proxy.$modal.showToast("领取成功！");
      loadAvailable();
    } else {
      proxy.$modal.showToast(res.msg || "领取失败");
    }
  } catch (e) {
    proxy.$modal.showToast(e.msg || "领取失败");
  }
}

onMounted(() => {
  loadAvailable();
});
</script>

<style lang="scss" scoped>
.coupon-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.tab-bar {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 28rpx;
    color: #666;
    border-bottom: 4rpx solid transparent;

    &.active {
      color: #e53935;
      font-weight: bold;
      border-bottom-color: #e53935;
    }
  }
}

.status-bar {
  padding: 16rpx 30rpx;
  background: #fff;
  margin-bottom: 16rpx;

  .status-item {
    padding: 8rpx 24rpx;
    border-radius: 30rpx;
    font-size: 24rpx;
    color: #666;
    margin-right: 16rpx;
    background: #f5f5f5;

    &.active {
      background: #e53935;
      color: #fff;
    }
  }
}

.coupon-list {
  padding: 20rpx 30rpx;
}

.empty-tip {
  text-align: center;
  color: #ccc;
  font-size: 28rpx;
  padding: 100rpx 0;
}

.coupon-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  &.full-type .card-left {
    background: linear-gradient(135deg, #ff9a56, #ff6a3c);
  }

  &.direct-type .card-left {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  &.disabled {
    opacity: 0.5;
  }
}

.card-left {
  width: 200rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  color: #fff;
  flex-shrink: 0;

  .discount-value {
    font-size: 44rpx;
    font-weight: bold;
    display: block;
  }

  .threshold-text {
    font-size: 22rpx;
    opacity: 0.9;
  }
}

.card-right {
  flex: 1;
  padding: 20rpx;

  .coupon-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    display: block;
    margin-bottom: 8rpx;
  }

  .coupon-time {
    font-size: 22rpx;
    color: #999;
    display: block;
    margin-bottom: 6rpx;
  }

  .target-tag {
    display: inline-block;
    background: #fff3e0;
    color: #e65100;
    font-size: 20rpx;
    padding: 2rpx 12rpx;
    border-radius: 6rpx;
    margin-top: 4rpx;

    &.lv-tag {
      background: #e8eaf6;
      color: #283593;
    }
  }

  .remain-info {
    font-size: 22rpx;
    color: #bbb;
    margin-top: 4rpx;
  }

  .mine-status {
    margin-top: 6rpx;

    .unused-text {
      color: #67c23a;
      font-size: 22rpx;
    }

    .used-text {
      color: #bbb;
      font-size: 22rpx;
    }

    .expired-text {
      color: #f56c6c;
      font-size: 22rpx;
    }
  }
}

.card-btn {
  width: 120rpx;
  height: 100%;
  background: #e53935;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  padding: 40rpx 0;
  flex-shrink: 0;
}

.mine-card .card-left {
  background: linear-gradient(135deg, #a8a8a8, #888);
}

.mine-card:not(.disabled) .card-left {
  background: linear-gradient(135deg, #ff9a56, #ff6a3c);
}
</style>
