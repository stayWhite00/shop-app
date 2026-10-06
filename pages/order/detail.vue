<template>
  <view class="order-detail">
    <!-- 订单状态 -->
    <view class="status-section">
      <view :class="['status-icon', `status-${order.status}`]">
        <uni-icons
          :type="getStatusIcon(order.status)"
          size="48"
          color="#fff"
        ></uni-icons>
      </view>
      <text class="status-text">{{ getStatusText(order.status) }}</text>
      <text v-if="order.status === 10" class="status-tip"
        >请在15分钟内完成支付</text
      >
    </view>

    <!-- 收货地址（非自提） -->
    <view class="address-section" v-if="order.deliveryType !== 3">
      <view class="section-header">
        <uni-icons type="location" size="20" color="#E53935"></uni-icons>
        <text class="header-title">收货信息</text>
      </view>
      <view class="address-info">
        <view class="address-header">
          <text class="consignee">{{ order.consignee }}</text>
          <text class="phone">{{ order.phone }}</text>
        </view>
        <text class="address-detail">{{ order.address }}</text>
      </view>
    </view>

    <!-- 自提门店信息 -->
    <view class="address-section" v-else>
      <view class="section-header">
        <uni-icons type="shop" size="20" color="#E53935"></uni-icons>
        <text class="header-title">自提门店</text>
      </view>
      <view class="address-info" v-if="storeInfo">
        <view class="address-header">
          <text class="consignee">{{ storeInfo.storeName }}</text>
          <text class="phone">{{ storeInfo.phone }}</text>
        </view>
        <text class="address-detail"
          >{{ storeInfo.city }}{{ storeInfo.district
          }}{{ storeInfo.address }}</text
        >
        <text
          v-if="storeInfo.businessHours"
          class="address-detail"
          style="margin-top: 8rpx; color: #999"
          >营业时间：{{ storeInfo.businessHours }}</text
        >
      </view>
      <view v-else class="address-info">
        <text class="address-detail">加载中...</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-section">
      <view class="section-header">
        <uni-icons type="shop" size="20" color="#E53935"></uni-icons>
        <text class="header-title">商品信息</text>
      </view>
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
            <button
              v-if="order.status === 40 && !isReviewed(item.productId)"
              class="btn btn-evaluate"
              @click.stop="goEvaluate(item.productId)"
            >
              评价
            </button>
            <button
              v-else-if="order.status === 40"
              class="btn btn-evaluated"
              disabled
            >
              已评价
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ order.orderNo }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">配送方式</text>
        <text class="info-value">{{
          getDeliveryTypeText(order.deliveryType)
        }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">创建时间</text>
        <text class="info-value">{{ order.createTime }}</text>
      </view>
      <view v-if="order.payTime" class="info-item">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ formatDateTime(order.payTime) }}</text>
      </view>
      <view v-if="order.shipTime" class="info-item">
        <text class="info-label">发货时间</text>
        <text class="info-value">{{ formatDateTime(order.shipTime) }}</text>
      </view>
      <view v-if="order.finishTime" class="info-item">
        <text class="info-label">完成时间</text>
        <text class="info-value">{{ formatDateTime(order.finishTime) }}</text>
      </view>
      <view v-if="order.payType" class="info-item">
        <text class="info-label">支付方式</text>
        <text class="info-value">
          {{ order.payType === 'wechat' ? '微信支付' : order.payType === 'alipay' ? '支付宝' : order.payType }}
        </text>
      </view>
    </view>

    <view class="price-section">
      <view class="price-item">
        <text class="price-label">商品总额</text>
        <text class="price-value" v-if="order.payType === 'points'"
          >{{ order.totalAmount }} 积分</text
        >
        <text class="price-value" v-else>¥{{ order.totalAmount }}</text>
      </view>
      <view
        class="price-item"
        v-if="order.payType !== 'points' && order.discountAmount > 0"
      >
        <text class="price-label">会员折扣</text>
        <text class="price-value">-¥{{ order.discountAmount }}</text>
      </view>
      <view class="price-item" v-if="order.payType !== 'points'">
        <text class="price-label">运费</text>
        <text class="price-value">¥{{ order.freight || "0.00" }}</text>
      </view>
      <view class="price-item total">
        <text class="price-label">实付</text>
        <text class="price-value" v-if="order.payType === 'points'"
          >{{ order.totalAmount }} 积分</text
        >
        <text class="price-value" v-else>¥{{ order.totalAmount }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="order.status !== 50 && order.status !== 40" class="footer-bar">
      <button
        v-if="order.status === 10"
        class="btn btn-cancel"
        @click="cancelOrder"
      >
        取消订单
      </button>
      <button
        v-if="order.status === 10"
        class="btn btn-primary"
        @click="payOrder"
      >
        立即支付
      </button>
      <button
        v-if="order.status === 30"
        class="btn btn-primary"
        @click="confirmOrder"
      >
        确认收货
      </button>
      <button
        v-if="order.status === 40"
        class="btn btn-primary"
        @click="applyAfterSale"
      >
        申请售后/退款
      </button>
      <button v-if="order.status === 60" class="btn btn-cancel" disabled>
        售后处理中
      </button>
    </view>
  </view>
</template>

<script>
import {
  getOrderDetail,
  cancelOrder as cancelOrderApi,
  confirmOrder as confirmOrderApi,
  payOrder as payOrderApi,
} from "@/api/mall/order";
import { getStoreDetail } from "@/api/mall/store";
import { getReviewedProductIds } from "@/api/mall/review";
import request from "@/utils/request";

export default {
  data() {
    return {
      orderId: 0,
      reviewedProductIds: [],
      order: {
        orderId: 0,
        orderNo: "",
        totalAmount: 0,
        deliveryType: 1,
        consignee: "",
        phone: "",
        address: "",
        status: 10,
        createTime: "",
        payTime: "",
        shipTime: "",
        finishTime: "",
        items: [],
      },
      storeInfo: null,
    };
  },
  onLoad(options) {
    this.orderId = options.id;
    this.loadOrderDetail();
  },
  onShow() {
    // 每次页面展示时刷新订单状态，确保售后处理结果（同意/拒绝）后订单状态即时更新
    if (this.orderId) {
      this.loadOrderDetail();
    }
  },
  methods: {
    // 加载订单详情
    async loadOrderDetail() {
      try {
        const res = await getOrderDetail(this.orderId);
        this.order = res.data;
        await this.loadReviewedProducts();
        // 自提时加载门店信息
        if (this.order.deliveryType === 3 && this.order.storeId) {
          this.loadStoreInfo(this.order.storeId);
        }
      } catch (error) {
        console.error("加载订单详情失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    },

    // 加载门店信息
    async loadStoreInfo(storeId) {
      try {
        const res = await getStoreDetail(storeId);
        this.storeInfo = res.data;
      } catch (error) {
        console.error("加载门店信息失败:", error);
      }
    },

    formatDateTime(value) {
      if (!value) return "";
      const text = String(value).trim();
      const matched = text.match(
        /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/
      );
      if (!matched) return text;
      if (!matched[3]) return `${matched[1]} ${matched[2]}`;
      const date = new Date(text);
      if (Number.isNaN(date.getTime())) return `${matched[1]} ${matched[2]}`;
      const pad = (num) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}`;
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
        70: "已退款",
      };
      return statusMap[status] || "未知";
    },

    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        10: "wallet",
        20: "box",
        30: "car",
        40: "checkmarkempty",
        50: "close",
        60: "redo",
        70: "checkmarkempty",
      };
      return iconMap[status] || "help";
    },

    // 获取配送方式文本
    getDeliveryTypeText(type) {
      const typeMap = {
        1: "快递配送",
        2: "同城配送",
        3: "门店自提",
      };
      return typeMap[type] || "未知";
    },

    // 取消订单
    cancelOrder() {
      uni.showModal({
        title: "提示",
        content: "确定取消该订单?",
        success: async (res) => {
          if (res.confirm) {
            try {
              await cancelOrderApi(this.orderId);
              uni.showToast({
                title: "订单已取消",
                icon: "success",
              });
              this.loadOrderDetail();
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

    // 支付订单（弹出支付方式选择）
    payOrder() {
      uni.showActionSheet({
        title: "选择支付方式",
        itemList: ["微信支付", "支付宝支付"],
        success: async (res) => {
          const payType = res.tapIndex === 0 ? "wechat" : "alipay";
          const payLabel = res.tapIndex === 0 ? "微信支付" : "支付宝";
          try {
            await payOrderApi(this.orderId, payType);
            uni.showToast({
              title: `${payLabel} 模拟支付成功`,
              icon: "success",
            });
            // 刷新详情
            this.loadOrderDetail();
          } catch (error) {
            uni.showToast({
              title: "支付失败",
              icon: "none",
            });
          }
        },
        fail: () => {
          // 用户取消，不做处理
        },
      });
    },

    // 确认收货
    confirmOrder() {
      uni.showModal({
        title: "提示",
        content: "确认已收到商品?",
        success: async (res) => {
          if (res.confirm) {
            try {
              await confirmOrderApi(this.orderId);
              uni.showToast({
                title: "确认收货成功",
                icon: "success",
              });
              this.loadOrderDetail();
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
    applyAfterSale() {
      uni.navigateTo({
        url: `/pages/afterSale/apply?orderId=${this.orderId}`,
      });
    },

    async loadReviewedProducts() {
      if (this.order.status !== 40) {
        this.reviewedProductIds = [];
        return;
      }
      try {
        const res = await getReviewedProductIds(this.orderId);
        this.reviewedProductIds = res.data || [];
      } catch (error) {
        console.error("加载评价状态失败:", error);
      }
    },

    isReviewed(productId) {
      return this.reviewedProductIds.some(
        (id) => String(id) === String(productId)
      );
    },

    // 导航到评价页面
    goEvaluate(productId) {
      uni.navigateTo({
        url: `/pages/review/submit?orderId=${this.orderId}&productId=${productId}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: $uni-bg-color-grey;
}

.status-section {
  background: linear-gradient(
    135deg,
    $uni-color-primary 0%,
    $uni-color-primary-light 100%
  );
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .status-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
    background-color: rgba(255, 255, 255, 0.2);
  }

  .status-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  .status-tip {
    font-size: $uni-font-size-sm;
    color: rgba(255, 255, 255, 0.8);
  }
}

.address-section,
.product-section,
.info-section,
.price-section {
  background-color: #fff;
  margin-top: 16rpx;
  padding: 24rpx 32rpx;

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;

    .header-title {
      margin-left: 8rpx;
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
    }
  }
}

.address-info {
  .address-header {
    margin-bottom: 12rpx;

    .consignee {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      margin-right: 24rpx;
    }

    .phone {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }
  }

  .address-detail {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    line-height: 1.6;
  }
}

.product-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $uni-border-color;

  &:last-child {
    border-bottom: none;
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

  .btn-evaluate {
    height: 48rpx;
    line-height: 48rpx;
    padding: 0 24rpx;
    border-radius: 24rpx;
    font-size: 24rpx;
    background-color: #fff;
    color: $uni-color-primary;
    border: 1rpx solid $uni-color-primary;
    margin-left: 20rpx;
  }

  .btn-evaluated {
    height: 48rpx;
    line-height: 48rpx;
    padding: 0 24rpx;
    border-radius: 24rpx;
    font-size: 24rpx;
    background-color: #f5f5f5;
    color: #999;
    border: 1rpx solid #ddd;
    margin-left: 20rpx;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $uni-border-color;

  &:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }

  .info-value {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;

  &.total {
    border-top: 1rpx solid $uni-border-color;
    padding-top: 24rpx;

    .price-label {
      font-size: $uni-font-size-lg;
      font-weight: bold;
    }

    .price-value {
      font-size: 36rpx;
      font-weight: bold;
      color: $uni-color-primary;
    }
  }

  .price-label {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }

  .price-value {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 16rpx 24rpx;
  border-top: 1rpx solid $uni-border-color;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;

  .btn {
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 48rpx;
    border-radius: 36rpx;
    font-size: $uni-font-size-base;

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
</style>
