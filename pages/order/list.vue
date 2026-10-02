<template>
  <view class="order-list">
    <!-- 订单状态筛选 -->
    <scroll-view scroll-x class="status-tabs">
      <view
        v-for="(tab, index) in statusTabs"
        :key="index"
        :class="['tab-item', { active: currentStatus === tab.value }]"
        @click="switchStatus(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-scroll">
      <view
        v-for="order in orderList"
        :key="order.orderId"
        class="order-item"
        @click="goOrderDetail(order.orderId)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <text :class="['order-status', `status-${order.status}`]">{{
            getStatusText(order.status)
          }}</text>
        </view>

        <!-- 商品列表 -->
        <view class="product-list">
          <view
            v-for="item in order.items"
            :key="item.productId"
            class="product-item"
          >
            <image
              :src="item.coverImage"
              mode="aspectFill"
              class="product-image"
            ></image>
            <view class="product-info">
              <text class="product-name">{{ item.productName }}</text>
              <view class="product-footer">
                <text class="product-price" v-if="order.payType === 'points'"
                  >{{ item.price }} 积分</text
                >
                <text class="product-price" v-else>¥{{ item.price }}</text>
                <text class="product-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <text class="total-amount" v-if="order.payType === 'points'"
            >合计: {{ order.totalAmount }} 积分</text
          >
          <text class="total-amount" v-else
            >合计: ¥{{ order.totalAmount }}</text
          >
          <view class="action-buttons">
            <button
              v-if="order.status === 10"
              class="btn btn-cancel"
              @click.stop="cancelOrder(order.orderId)"
            >
              取消订单
            </button>
            <button
              v-if="order.status === 10"
              class="btn btn-primary"
              @click.stop="payOrder(order.orderId)"
            >
              去支付
            </button>
            <button
              v-if="order.status === 30"
              class="btn btn-primary"
              @click.stop="confirmOrder(order.orderId)"
            >
              确认收货
            </button>
            <button
              v-if="order.status === 40"
              class="btn btn-default"
              @click.stop="applyAfterSale(order.orderId)"
            >
              申请售后
            </button>
            <button
              v-if="order.status === 40"
              class="btn btn-primary"
              @click.stop="goEvaluate(order)"
            >
              商品评价
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="orderList.length === 0" class="empty-state">
        <image
          src="/static/images/empty-order.png"
          mode="aspectFit"
          class="empty-image"
        ></image>
        <text class="empty-text">暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import {
  getOrderList,
  cancelOrder as cancelOrderApi,
  confirmOrder as confirmOrderApi,
} from "@/api/mall/order";

export default {
  data() {
    return {
      currentStatus: "",
      statusTabs: [
        { label: "全部", value: "" },
        { label: "待付款", value: 10 },
        { label: "待发货", value: 20 },
        { label: "待收货", value: 30 },
        { label: "已完成", value: 40 },
      ],
      orderList: [],
      pageNum: 1,
      pageSize: 10,
    };
  },
  onLoad(options) {
    if (options.status) {
      this.currentStatus = parseInt(options.status);
    }
    this.loadOrderList();
  },
  methods: {
    // 切换状态
    switchStatus(status) {
      this.currentStatus = status;
      this.pageNum = 1;
      this.orderList = [];
      this.loadOrderList();
    },

    // 加载订单列表
    async loadOrderList() {
      try {
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
        };
        if (this.currentStatus !== "") {
          params.status = this.currentStatus;
        }

        const res = await getOrderList(params);
        this.orderList = res.data.list;
      } catch (error) {
        console.error("加载订单失败:", error);
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        10: "待付款",
        20: "待发货",
        30: "待收货",
        40: "已完成",
        50: "已取消",
        60: "售后中",
      };
      return statusMap[status] || "未知";
    },

    // 跳转订单详情
    goOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`,
      });
    },

    // 取消订单
    cancelOrder(orderId) {
      uni.showModal({
        title: "提示",
        content: "确定取消该订单?",
        success: async (res) => {
          if (res.confirm) {
            try {
              await cancelOrderApi(orderId);
              uni.showToast({
                title: "订单已取消",
                icon: "success",
              });
              this.loadOrderList();
            } catch (error) {
              uni.showToast({
                title: "取消失败",
                icon: "none",
              });
            }
          }
        },
      });
    },

    // 支付订单
    payOrder(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`,
      });
    },

    // 确认收货
    confirmOrder(orderId) {
      uni.showModal({
        title: "提示",
        content: "确认已收到商品?",
        success: async (res) => {
          if (res.confirm) {
            try {
              await confirmOrderApi(orderId);
              uni.showToast({
                title: "确认收货成功",
                icon: "success",
              });
              this.loadOrderList();
            } catch (error) {
              uni.showToast({
                title: "操作失败",
                icon: "none",
              });
            }
          }
        },
      });
    },

    // 申请售后导航
    applyAfterSale(orderId) {
      uni.navigateTo({
        url: `/pages/afterSale/apply?orderId=${orderId}`,
      });
    },

    // 评价第一个商品
    goEvaluate(order) {
      if (order.items && order.items.length > 0) {
        uni.navigateTo({
          url: `/pages/review/submit?orderId=${order.orderId}&productId=${order.items[0].productId}`,
        });
      } else {
        uni.showToast({ title: "无法获取商品信息", icon: "none" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.order-list {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $uni-bg-color-grey;
}

.status-tabs {
  background-color: #fff;
  white-space: nowrap;
  border-bottom: 1rpx solid $uni-border-color;

  .tab-item {
    display: inline-block;
    padding: 24rpx 32rpx;
    position: relative;

    &.active {
      .tab-text {
        color: $uni-color-primary;
        font-weight: bold;
      }

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 4rpx;
        background-color: $uni-color-primary;
        border-radius: 2rpx;
      }
    }

    .tab-text {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }
  }
}

.order-scroll {
  flex: 1;
  padding: 16rpx;
}

.order-item {
  background-color: #fff;
  border-radius: $uni-border-radius-base;
  margin-bottom: 16rpx;
  overflow: hidden;

  .order-header {
    padding: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid $uni-border-color;

    .order-no {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }

    .order-status {
      font-size: $uni-font-size-base;

      &.status-10 {
        color: $uni-color-primary;
      }
      &.status-20 {
        color: $uni-color-warning;
      }
      &.status-30 {
        color: $uni-color-primary;
      }
      &.status-40 {
        color: $uni-text-color-grey;
      }
      &.status-50 {
        color: $uni-text-color-grey;
      }
      &.status-60 {
        color: $uni-color-warning;
      }
    }
  }

  .product-list {
    padding: 24rpx;
  }

  .product-item {
    display: flex;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .product-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: $uni-border-radius-base;
      margin-right: 16rpx;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .product-name {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-price {
      font-size: 28rpx;
      font-weight: bold;
      color: $uni-color-primary;
    }

    .product-quantity {
      font-size: $uni-font-size-base;
      color: $uni-text-color-grey;
    }
  }

  .order-footer {
    padding: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1rpx solid $uni-border-color;

    .total-amount {
      font-size: $uni-font-size-base;
      color: $uni-text-color;

      &::before {
        content: "实付: ";
      }
    }

    .action-buttons {
      display: flex;
      gap: 16rpx;
    }

    .btn {
      height: 56rpx;
      line-height: 56rpx;
      padding: 0 32rpx;
      border-radius: 28rpx;
      font-size: $uni-font-size-sm;

      &.btn-default {
        background-color: #fff;
        color: $uni-text-color;
        border: 1rpx solid $uni-border-color;
      }

      &.btn-cancel {
        background-color: #fff;
        color: $uni-text-color-grey;
        border: 1rpx solid $uni-border-color;
      }

      &.btn-primary {
        background-color: $uni-color-primary;
        color: #fff;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-image {
    width: 320rpx;
    height: 320rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }
}
</style>
