<template>
  <view class="cart-page" :style="{ height: pageHeight + 'px' }">
    <!-- 购物车列表 -->
    <scroll-view
      v-if="cartList.length > 0"
      scroll-y
      class="cart-list"
      :style="{ height: listHeight + 'px' }"
    >
      <view class="cart-list-inner">
      <view v-for="item in cartList" :key="item.cartId" class="cart-item">
        <!-- 选择框 -->
        <view class="item-check" @click="toggleCheck(item)">
          <uni-icons
            :type="item.checked ? 'checkbox-filled' : 'circle'"
            :size="24"
            :color="item.checked ? '#E53935' : '#CCCCCC'"
          ></uni-icons>
        </view>

        <!-- 商品信息 -->
        <image
          :src="item.coverImage"
          mode="aspectFill"
          class="item-image"
          @click="goProductDetail(item.productId)"
        ></image>

        <view class="item-info">
          <text class="item-name" @click="goProductDetail(item.productId)">{{
            item.productName
          }}</text>
          <view class="item-footer">
            <text class="item-price" v-if="item.categoryId === 999"
              >{{ item.price }} 积分</text
            >
            <text class="item-price" v-else>¥{{ item.price }}</text>
            <view class="item-stepper">
              <view class="stepper-btn" @click="decreaseQuantity(item)">
                <uni-icons type="minus" size="16" color="#666"></uni-icons>
              </view>
              <input
                type="number"
                :value="item.quantity"
                disabled
                class="stepper-input"
              />
              <view class="stepper-btn" @click="increaseQuantity(item)">
                <uni-icons type="plus" size="16" color="#666"></uni-icons>
              </view>
            </view>
          </view>
        </view>

        <!-- 删除按钮 -->
        <view class="item-delete" @click="deleteItem(item)">
          <uni-icons type="trash" size="20" color="#999"></uni-icons>
        </view>
      </view>
      </view>
    </scroll-view>

    <!-- 空购物车 -->
    <view v-else class="empty-cart">
      <image
        src="/static/images/empty-cart.png"
        mode="aspectFit"
        class="empty-image"
      ></image>
      <text class="empty-text">购物车空空如也</text>
      <button class="go-shopping-btn" @click="goShopping">去逛逛</button>
    </view>

    <!-- 底部结算栏 -->
    <view v-if="cartList.length > 0" class="cart-footer">
      <view class="all-check" @click="toggleAllCheck">
        <uni-icons
          :type="isAllChecked ? 'checkbox-filled' : 'circle'"
          :size="22"
          :color="isAllChecked ? '#E53935' : '#CCCCCC'"
        ></uni-icons>
        <text class="all-check-text">全选</text>
      </view>
      <view class="total-info">
        <text class="total-label">合计</text>
        <text class="total-price" v-if="isPointsSelectedOnly"
          >{{ totalPrice }} 积分</text
        >
        <text class="total-price" v-else>¥{{ totalPrice }}</text>
      </view>
      <button
        class="settle-btn"
        :disabled="checkedCount === 0"
        @click="goSettle"
      >
        结算({{ checkedCount }})
      </button>
    </view>
  </view>
</template>

<script>
import {
  getCartList,
  updateCartQuantity,
  deleteCart,
  toggleCartCheck,
  toggleAllCheck,
} from "@/api/mall/cart";

export default {
  data() {
    const info = uni.getSystemInfoSync();
    const footerHeight = uni.upx2px(112);
    return {
      cartList: [],
      pageHeight: info.windowHeight,
      listHeight: Math.max(info.windowHeight - footerHeight, 0),
    };
  },
  computed: {
    // 是否全选
    isAllChecked() {
      return (
        this.cartList.length > 0 &&
        this.cartList.every((item) => item.checked === 1)
      );
    },

    // 选中的商品数量
    checkedCount() {
      return this.cartList.filter((item) => item.checked === 1).length;
    },

    // 总价
    totalPrice() {
      return this.cartList
        .filter((item) => item.checked === 1)
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2);
    },

    // 是否只选中了积分商品
    isPointsSelectedOnly() {
      const checkedItems = this.cartList.filter((item) => item.checked === 1);
      return (
        checkedItems.length > 0 &&
        checkedItems.every((item) => item.categoryId === 999)
      );
    },
  },
  onLoad() {
    this.updateLayout();
  },
  onShow() {
    this.updateLayout();
    this.loadCartList();
  },
  methods: {
    updateLayout() {
      const info = uni.getSystemInfoSync();
      const footerHeight = uni.upx2px(112);
      this.pageHeight = info.windowHeight;
      this.listHeight = Math.max(info.windowHeight - footerHeight, 0);
    },

    // 加载购物车列表
    async loadCartList() {
      try {
        const res = await getCartList();
        this.cartList = res.data;
      } catch (error) {
        console.error("加载购物车失败:", error);
      }
    },

    // 切换选中状态
    async toggleCheck(item) {
      try {
        const checked = item.checked === 1 ? 0 : 1;
        await toggleCartCheck(item.cartId, checked);
        item.checked = checked;
      } catch (error) {
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    },

    // 全选/取消全选
    async toggleAllCheck() {
      try {
        const checked = this.isAllChecked ? 0 : 1;
        await toggleAllCheck(checked);
        this.cartList.forEach((item) => {
          item.checked = checked;
        });
      } catch (error) {
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    },

    // 减少数量
    async decreaseQuantity(item) {
      if (item.quantity <= 1) {
        uni.showModal({
          title: "提示",
          content: "是否删除该商品?",
          success: (res) => {
            if (res.confirm) {
              this.deleteItem(item);
            }
          },
        });
        return;
      }

      try {
        await updateCartQuantity(item.cartId, item.quantity - 1);
        item.quantity--;
      } catch (error) {
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    },

    // 增加数量
    async increaseQuantity(item) {
      if (item.quantity >= item.stock) {
        uni.showToast({
          title: "库存不足",
          icon: "none",
        });
        return;
      }

      try {
        await updateCartQuantity(item.cartId, item.quantity + 1);
        item.quantity++;
      } catch (error) {
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    },

    // 删除商品
    deleteItem(item) {
      uni.showModal({
        title: "提示",
        content: "确定删除该商品?",
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteCart([item.cartId]);
              this.cartList = this.cartList.filter(
                (cart) => cart.cartId !== item.cartId,
              );
              uni.showToast({
                title: "删除成功",
                icon: "success",
              });
            } catch (error) {
              uni.showToast({
                title: "删除失败",
                icon: "none",
              });
            }
          }
        },
      });
    },

    // 跳转商品详情
    goProductDetail(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${productId}`,
      });
    },

    // 去逛逛
    goShopping() {
      uni.switchTab({
        url: "/pages/index",
      });
    },

    // 去结算
    goSettle() {
      if (this.checkedCount === 0) {
        uni.showToast({
          title: "请选择商品",
          icon: "none",
        });
        return;
      }

      const checkedIds = this.cartList
        .filter((item) => item.checked === 1)
        .map((item) => item.cartId);

      uni.navigateTo({
        url: `/pages/order/confirm?cartIds=${checkedIds.join(",")}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.cart-page {
  height: 100%;
  background-color: $uni-bg-color-grey;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-list {
  flex: 1;
  height: 0;
  min-height: 0;
}

.cart-list-inner {
  padding: 16rpx;
}

.cart-item {
  background-color: #fff;
  border-radius: $uni-border-radius-base;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;

  .item-check {
    margin-right: 16rpx;
  }

  .item-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: $uni-border-radius-base;
    margin-right: 16rpx;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 160rpx;
  }

  .item-name {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-price {
    font-size: 32rpx;
    font-weight: bold;
    color: $uni-color-primary;
  }

  .item-stepper {
    display: flex;
    align-items: center;
    border: 1rpx solid $uni-border-color;
    border-radius: $uni-border-radius-base;
    overflow: hidden;

    .stepper-btn {
      width: 56rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $uni-bg-color-grey;
    }

    .stepper-input {
      width: 80rpx;
      height: 48rpx;
      text-align: center;
      font-size: $uni-font-size-base;
      border-left: 1rpx solid $uni-border-color;
      border-right: 1rpx solid $uni-border-color;
    }
  }

  .item-delete {
    margin-left: 16rpx;
  }
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .empty-image {
    width: 400rpx;
    height: 400rpx;
    margin-bottom: 32rpx;
  }

  .empty-text {
    font-size: $uni-font-size-lg;
    color: $uni-text-color-grey;
    margin-bottom: 48rpx;
  }

  .go-shopping-btn {
    width: 300rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: $uni-color-primary;
    color: #fff;
    border-radius: 40rpx;
    font-size: $uni-font-size-base;
  }
}

.cart-footer {
  flex-shrink: 0;
  box-sizing: border-box;
  height: 112rpx;
  background-color: #fff;
  padding: 0 24rpx;
  border-top: 1rpx solid $uni-border-color;
  display: flex;
  align-items: center;

  .all-check {
    flex-shrink: 0;
    display: flex;
    align-items: center;

    .all-check-text {
      margin-left: 8rpx;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      white-space: nowrap;
    }
  }

  .total-info {
    flex: 1;
    min-width: 0;
    margin-left: 20rpx;
    display: flex;
    align-items: baseline;
    justify-content: flex-end;

    .total-label {
      flex-shrink: 0;
      margin-right: 8rpx;
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }

    .total-price {
      min-width: 0;
      font-size: 36rpx;
      font-weight: bold;
      line-height: 1.2;
      color: $uni-color-primary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .settle-btn {
    flex-shrink: 0;
    width: 200rpx;
    height: 76rpx;
    margin: 0 0 0 20rpx;
    padding: 0;
    line-height: 76rpx;
    background-color: $uni-color-primary;
    color: #fff;
    border-radius: 38rpx;
    font-size: $uni-font-size-base;

    &::after {
      border: none;
    }

    &[disabled] {
      background-color: $uni-bg-color-grey;
      color: $uni-text-color-grey;
    }
  }
}
</style>
