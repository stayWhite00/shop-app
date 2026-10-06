<template>
  <view class="order-confirm">
    <!-- 收货地址（自提时隐藏） -->
    <view
      class="address-section"
      @click="selectAddress"
      v-if="deliveryType !== 3"
    >
      <view v-if="selectedAddress" class="address-info">
        <view class="address-header">
          <text class="consignee">{{ selectedAddress.consignee }}</text>
          <text class="phone">{{ selectedAddress.phone }}</text>
        </view>
        <text class="address-detail">
          {{ selectedAddress.province }} {{ selectedAddress.city }}
          {{ selectedAddress.district }} {{ selectedAddress.detail }}
        </text>
      </view>
      <view v-else class="no-address">
        <uni-icons type="location" size="24" color="#999"></uni-icons>
        <text class="no-address-text">请选择收货地址</text>
      </view>
      <uni-icons type="forward" size="20" color="#999"></uni-icons>
    </view>

    <!-- 商品列表 -->
    <view class="product-section">
      <view
        class="product-item"
        v-for="item in productList"
        :key="item.productId"
      >
        <image
          :src="item.coverImage"
          mode="aspectFill"
          class="product-image"
        ></image>
        <view class="product-info">
          <text class="product-name">{{ item.productName }}</text>
          <view class="product-footer">
            <text class="product-price" v-if="item.categoryId === 999"
              >{{ item.price }} 积分</text
            >
            <text class="product-price" v-else>¥{{ item.price }}</text>
            <text class="product-quantity">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 配送方式 -->
    <view class="delivery-section">
      <view class="section-title">配送方式</view>
      <radio-group @change="onDeliveryChange">
        <label
          class="delivery-item"
          v-for="item in availableDeliveryTypes"
          :key="item.value"
        >
          <radio
            :value="item.value"
            :checked="deliveryType === item.value"
            color="#E53935"
          />
          <text class="delivery-name">{{ item.label }}</text>
          <text class="delivery-desc">{{ item.desc }}</text>
        </label>
      </radio-group>
    </view>

    <!-- 门店选择（自提时显示） -->
    <view class="store-section" v-if="deliveryType === 3">
      <view class="section-title">选择自提门店</view>
      <view v-if="storeList.length === 0" class="no-store">暂无可用门店</view>
      <radio-group @change="onStoreChange">
        <label
          class="store-item"
          v-for="store in storeList"
          :key="store.storeId"
        >
          <radio
            :value="String(store.storeId)"
            :checked="selectedStore && selectedStore.storeId === store.storeId"
            color="#E53935"
          />
          <view class="store-info">
            <text class="store-name">{{ store.storeName }}</text>
            <text class="store-addr"
              >{{ store.city }}{{ store.district }}{{ store.address }}</text
            >
            <text class="store-hours">营业时间：{{ store.businessHours }}</text>
          </view>
        </label>
      </radio-group>
    </view>

    <!-- 优惠券 -->
    <view class="coupon-section" v-if="!isPointsOrder && usableCoupons.length > 0">
      <view class="section-title">优惠券</view>
      <view class="coupon-select" @click="showCouponPopup">
        <text class="coupon-label" :class="{ 'has-coupon': selectedCoupon }">{{ selectedCoupon ? '-¥' + selectedCoupon.discount : '有可用优惠券' }}</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-section">
      <text class="section-title">订单备注</text>
      <textarea
        v-model="remark"
        placeholder="选填,请先和商家协商一致"
        class="remark-input"
        maxlength="200"
      ></textarea>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-item">
        <text class="price-label">商品总额</text>
        <text class="price-value" v-if="isPointsOrder"
          >{{ totalAmount }} 积分</text
        >
        <text class="price-value" v-else>¥{{ totalAmount }}</text>
      </view>
      <view
        class="price-item"
        v-if="!isPointsOrder && parseFloat(discountAmount) > 0"
      >
        <text class="price-label">会员折扣</text>
        <text class="price-value" style="color: #ff0000; font-weight: bold"
          >-¥{{ discountAmount }}</text
        >
      </view>
      <view class="price-item" v-if="!isPointsOrder">
        <text class="price-label">运费</text>
        <text class="price-value">¥{{ freight }}</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="footer-bar">
      <view class="total-info">
        <text class="total-label">合计:</text>
        <text class="total-price" v-if="isPointsOrder"
          >{{ finalAmount }} 积分</text
        >
        <text class="total-price" v-else>¥{{ finalAmount }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder">提交订单</button>
    </view>

    <!-- 积分支付说明（积分订单显示） -->
    <view class="points-balance-section" v-if="isPointsOrder">
      <view class="points-balance-info">
        <text class="balance-label">账户积分余额</text>
        <text class="balance-value">{{ userPoints }}</text>
      </view>
      <view class="points-cost-info">
        <text class="cost-label">本次扣减积分</text>
        <text class="cost-value">-{{ finalAmount }}</text>
      </view>
    </view>
  <uni-popup ref="couponPopup" type="bottom" background-color="#fff">
      <view class="coupon-popup">
        <view class="popup-header">
          <text class="popup-title">选择优惠券</text>
          <uni-icons type="closeempty" size="24" @click="closeCouponPopup"></uni-icons>
        </view>
        <scroll-view scroll-y class="coupon-scroll">
          <view class="coupon-item" @click="selectCoupon(null)">
            <text class="coupon-name">不使用优惠券</text>
            <uni-icons type="checkmarkempty" size="24" color="#E53935" v-if="!selectedCoupon"></uni-icons>
          </view>
          <view 
            class="coupon-item" 
            v-for="item in usableCoupons" 
            :key="item.userCouponId"
            @click="selectCoupon(item)"
          >
            <view class="coupon-info">
              <text class="coupon-name">{{ item.couponName || '优惠券' }}</text>
              <text class="coupon-desc">{{ item.type === 1 ? '满' + item.threshold + '减' + item.discount : '立减' + item.discount }}</text>
            </view>
            <uni-icons type="checkmarkempty" size="24" color="#E53935" v-if="selectedCoupon && selectedCoupon.userCouponId === item.userCouponId"></uni-icons>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { createOrder } from "@/api/mall/order";
import { getAddressList } from "@/api/mall/user";
import { getStoreList } from "@/api/mall/store";
import { getCartList } from "@/api/mall/cart";
import { getProductDetail } from "@/api/mall/product";
import { getMemberInfo } from "@/api/mall/member";
import { getUsableCoupons } from "@/api/mall/coupon";

export default {
  data() {
    return {
      selectedAddress: null,
      productList: [],
      deliveryType: 1,
      deliveryTypes: [
        { value: 1, label: "快递配送", desc: "3-7天送达" },
        { value: 2, label: "同城配送", desc: "当日/次日达" },
        { value: 3, label: "门店自提", desc: "2小时后可自提" },
      ],
      storeList: [],
      selectedStore: null,
      remark: "",
      totalAmount: "0.00",
      discountRate: 1.0,
      discountAmount: "0.00",
      freight: 0,
      userPoints: 0,
      usableCoupons: [],
      selectedCoupon: null,
    };
  },
  computed: {
    finalAmount() {
      let amount = parseFloat(this.totalAmount) - parseFloat(this.discountAmount);
      if (amount < 0) amount = 0;
      return (amount + parseFloat(this.freight)).toFixed(2);
    },
    // 根据详设：本地用户可选快递/配送/自提，外地用户仅快递
    // 此处暂时返回全部，实际可结合 userType 做过滤
    availableDeliveryTypes() {
      return this.deliveryTypes;
    },
    // 是否为积分订单
    isPointsOrder() {
      return (
        this.productList.length > 0 &&
        this.productList.every((item) => Number(item.categoryId) === 999)
      );
    },
  },
  async onLoad(options) {
    // 提前加载会员信息，以获取折扣率
    await this.loadMemberInfo();

    // 从购物车或立即购买进入
    if (options.cartIds) {
      this.loadCartProducts(options.cartIds);
    } else if (options.productId) {
      this.loadDirectBuyProduct(options.productId, options.quantity);
    }

    this.loadDefaultAddress();

    // 监听地址选择事件
    uni.$on("selectAddress", this.onAddressSelected);
  },
  onUnload() {
    // 移除监听，防止内存泄漏
    uni.$off("selectAddress", this.onAddressSelected);
  },
  methods: {
    // 处理地址选择回调
    onAddressSelected(address) {
      this.selectedAddress = address;
      this.calculateFreight();
    },
    async loadMemberInfo() {
      try {
        const res = await getMemberInfo();
        if (res.data && res.data.discountRate) {
          this.discountRate = parseFloat(res.data.discountRate);
        }
        if (res.data && res.data.points !== undefined) {
          this.userPoints = res.data.points;
        }
      } catch (error) {
        console.error("加载会员信息失败:", error);
      }
    },
    // 加载购物车商品
    async loadCartProducts(cartIds) {
      try {
        const cartIdArr = cartIds.split(",").map((id) => id.trim());
        const res = await getCartList();
        const allItems = res.data || [];
        this.productList = allItems
          .filter((item) => cartIdArr.includes(String(item.cartId)))
          .map((item) => ({
            cartId: item.cartId,
            productId: item.productId,
            productName: item.productName,
            coverImage: item.coverImage,
            price: item.price,
            quantity: item.quantity,
            categoryId: item.categoryId,
          }));
        this.calculateTotal();
        this.loadUsableCoupons();
      } catch (error) {
        console.error("加载购物车商品失败:", error);
      }
    },

    // 加载立即购买商品
    async loadDirectBuyProduct(productId, quantity) {
      try {
        const res = await getProductDetail(productId);
        const product = res.data;
        this.productList = [
          {
            cartId: null,
            productId: product.productId,
            productName: product.productName,
            coverImage: product.coverImage,
            price: product.price,
            quantity: parseInt(quantity) || 1,
            categoryId: product.categoryId,
          },
        ];
        this.calculateTotal();
        this.loadUsableCoupons();
      } catch (error) {
        console.error("加载商品信息失败:", error);
      }
    },

    // 加载默认地址
    async loadDefaultAddress() {
      try {
        const res = await getAddressList();
        const defaultAddr = res.data.find((addr) => addr.isDefault === 1);
        if (defaultAddr) {
          this.selectedAddress = defaultAddr;
        }
      } catch (error) {
        console.error("加载地址失败:", error);
      }
    },

    // 选择地址
    selectAddress() {
      uni.navigateTo({
        url: "/pages/address/list?from=order",
      });
    },

    // 配送方式改变
    onDeliveryChange(e) {
      this.deliveryType = parseInt(e.detail.value);
      this.selectedStore = null;
      // 选择自提时加载门店列表
      if (this.deliveryType === 3 && this.storeList.length === 0) {
        this.loadStoreList();
      }
      this.calculateFreight();
    },

    // 加载门店列表
    async loadStoreList() {
      try {
        const res = await getStoreList();
        this.storeList = res.data || [];
      } catch (error) {
        console.error("加载门店失败:", error);
      }
    },

    // 门店选择变化
    onStoreChange(e) {
      const storeIdStr = e.detail.value;
      this.selectedStore =
        this.storeList.find((s) => String(s.storeId) === storeIdStr) || null;
    },

    // 计算总价
    calculateTotal() {
      const productTotal = this.productList.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      this.totalAmount = productTotal.toFixed(2);

      // 积分订单不参与会员折扣
      if (this.isPointsOrder) {
        this.discountAmount = "0.00";
      } else {
        let discount = productTotal * (1.0 - this.discountRate);
        if (this.selectedCoupon) {
          discount += parseFloat(this.selectedCoupon.discount);
        }
        this.discountAmount = discount.toFixed(2);
      }

      this.calculateFreight();
    },

    // 计算运费
    calculateFreight() {
      // 积分订单免邮
      if (this.isPointsOrder) {
        this.freight = 0;
        return;
      }

      // 根据配送方式计算运费
      if (this.deliveryType === 1) {
        // 快递: 满99包邮
        this.freight = this.totalAmount >= 99 ? 0 : 5;
      } else if (this.deliveryType === 2) {
        // 同城: 满50包邮
        this.freight = this.totalAmount >= 50 ? 0 : 5;
      } else {
        // 自提: 免运费
        this.freight = 0;
      }
    },

    // 提交订单
    async loadUsableCoupons() {
      if (this.isPointsOrder) return;
      try {
        const res = await getUsableCoupons(this.totalAmount);
        this.usableCoupons = res.data || [];
        // 如果有优惠券且没选，默认选金额最大的一张或者不选。这里我们不默认选择，让用户自己选
      } catch (e) {
        console.error("获取可用优惠券失败:", e);
      }
    },
    showCouponPopup() {
      this.$refs.couponPopup.open();
    },
    closeCouponPopup() {
      this.$refs.couponPopup.close();
    },
    selectCoupon(coupon) {
      this.selectedCoupon = coupon;
      this.closeCouponPopup();
      // 重新计算总价，更新 discountAmount 或新增 couponDiscount
      this.calculateTotal();
    },
    async submitOrder() {
      // 非自提时必须选择收货地址
      if (this.deliveryType !== 3 && !this.selectedAddress) {
        uni.showToast({ title: "请选择收货地址", icon: "none" });
        return;
      }

      // 自提必须选门店
      if (this.deliveryType === 3 && !this.selectedStore) {
        uni.showToast({ title: "请选择自提门店", icon: "none" });
        return;
      }

      try {
        const validCartIds = this.productList
          .filter((item) => item.cartId)
          .map((item) => item.cartId);
        const orderData = {
          addressId:
            this.deliveryType !== 3 && this.selectedAddress
              ? this.selectedAddress.addressId
              : null,
          deliveryType: this.deliveryType,
          storeId:
            this.deliveryType === 3 && this.selectedStore
              ? this.selectedStore.storeId
              : null,
          cartIds: validCartIds.length > 0 ? validCartIds : null,
          productId:
            validCartIds.length === 0 && this.productList.length > 0
              ? this.productList[0].productId
              : null,
          quantity:
            validCartIds.length === 0 && this.productList.length > 0
              ? this.productList[0].quantity
              : null,
          remark: this.remark,
          userCouponId: this.selectedCoupon ? this.selectedCoupon.userCouponId : null,
        };

        const res = await createOrder(orderData);

        uni.showToast({
          title: "订单创建成功",
          icon: "success",
        });

        // 跳转到支付页面
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/order/detail?id=${res.data.orderId}`,
          });
        }, 1500);
      } catch (error) {
        console.error("订单提交失败:", error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.order-confirm {
  padding-bottom: 120rpx;
  background-color: $uni-bg-color-grey;
}

.address-section {
  background-color: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .address-info {
    flex: 1;
  }

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

  .no-address {
    flex: 1;
    display: flex;
    align-items: center;

    .no-address-text {
      margin-left: 16rpx;
      font-size: $uni-font-size-base;
      color: $uni-text-color-grey;
    }
  }
}

.product-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .product-item {
    display: flex;
    margin-bottom: 24rpx;

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
}

.delivery-section,
.remark-section {
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: 24rpx;
  }

  .delivery-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $uni-border-color;

    &:last-child {
      border-bottom: none;
    }

    .delivery-name {
      flex: 1;
      margin-left: 16rpx;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .delivery-desc {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }

  .remark-input {
    width: 100%;
    min-height: 120rpx;
    padding: 16rpx;
    background-color: $uni-bg-color-grey;
    border-radius: $uni-border-radius-base;
    font-size: $uni-font-size-base;
  }
}

.store-section {
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: 24rpx;
  }

  .no-store {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    text-align: center;
    padding: 24rpx 0;
  }

  .store-item {
    display: flex;
    align-items: flex-start;
    padding: 20rpx 0;
    border-bottom: 1rpx solid $uni-border-color;

    &:last-child {
      border-bottom: none;
    }

    .store-info {
      flex: 1;
      margin-left: 16rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
    }

    .store-name {
      font-size: $uni-font-size-base;
      font-weight: bold;
      color: $uni-text-color;
    }

    .store-addr {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }

    .store-hours {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }
}

.price-section {
  background-color: #fff;
  padding: 24rpx 32rpx;

  .price-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
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
  justify-content: space-between;
  align-items: center;

  .total-info {
    .total-label {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .total-price {
      font-size: 36rpx;
      font-weight: bold;
      color: $uni-color-primary;
    }
  }

  .submit-btn {
    width: 240rpx;
    height: 72rpx;
    line-height: 72rpx;
    background-color: $uni-color-primary;
    color: #fff;
    border-radius: 36rpx;
    font-size: $uni-font-size-base;
  }
}

.points-balance-section {
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-top: 16rpx;
  border-radius: $uni-border-radius-base;

  .points-balance-info,
  .points-cost-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .balance-label,
    .cost-label {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .balance-value {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: #ff9800; // 积分使用橙色
    }

    .cost-value {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-color-primary;
    }
  }
}
.coupon-section {
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .coupon-select {
    display: flex;
    align-items: center;

    .coupon-label {
      font-size: 28rpx;
      color: #999;
      margin-right: 8rpx;

      &.has-coupon {
        color: #e53935;
        font-weight: bold;
      }
    }
  }
}

.coupon-popup {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .coupon-scroll {
    max-height: 60vh;
  }

  .coupon-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .coupon-info {
      display: flex;
      flex-direction: column;

      .coupon-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 8rpx;
      }

      .coupon-desc {
        font-size: 24rpx;
        color: #e53935;
      }
    }
  }
}
</style>
