<template>
  <view class="product-detail">
    <!-- 骨架屏（加载中显示） -->
    <view v-if="loading" class="skeleton">
      <view class="skeleton-image"></view>
      <view class="skeleton-info">
        <view class="skeleton-price"></view>
        <view class="skeleton-name"></view>
        <view class="skeleton-name short"></view>
      </view>
      <view class="skeleton-detail">
        <view class="skeleton-title"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-line"></view>
        <view class="skeleton-line short"></view>
      </view>
    </view>

    <!-- 商品内容（加载完成后显示） -->
    <view v-else>
      <!-- 商品图片轮播 -->
      <swiper
        class="product-swiper"
        :indicator-dots="true"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#E53935"
      >
        <swiper-item v-for="(image, index) in product.images" :key="index">
          <image
            :src="image"
            mode="aspectFill"
            class="swiper-image"
            lazy-load
            @error="onImageError($event, index)"
          ></image>
        </swiper-item>
      </swiper>

      <!-- 商品信息 -->
      <view class="product-info">
        <view class="price-section">
          <text class="price" v-if="product.categoryId === 999"
            >{{ product.price }} 积分</text
          >
          <text class="price" v-else>¥{{ product.price }}</text>
          <text class="stock">库存: {{ product.stock }}</text>
        </view>
        <text class="product-name">{{ product.productName }}</text>
        <view class="rating-info">
          <text class="rating-label">商品评分:</text>
          <view v-if="product.rating" class="rating-score">
            <uni-icons type="star-filled" size="16" color="#ffb400"></uni-icons>
            <text class="rating-value">{{ product.rating }} 分</text>
          </view>
          <text v-else class="rating-score empty">暂无评分</text>
        </view>
      </view>

      <!-- 商品详情 -->
      <view class="detail-section">
        <view class="section-title">商品详情</view>
        <rich-text :nodes="product.detail" class="detail-content"></rich-text>
      </view>

      <!-- 商品评价 -->
      <view class="review-section">
        <view class="section-title-row">
          <text class="section-title">商品评价</text>
          <text class="review-count">{{ reviewStats.totalCount ? `共 ${reviewStats.totalCount} 条` : '暂无评价' }}</text>
        </view>

        <!-- 评分概览 -->
        <view v-if="reviewStats.avgRating > 0" class="rating-overview">
          <text class="avg-score">{{ reviewStats.avgRating }}</text>
          <view class="stars-row">
            <text
              v-for="i in 5"
              :key="i"
              class="star-icon"
              :style="{ color: i <= Math.round(reviewStats.avgRating) ? '#ffb400' : '#ddd' }"
            >★</text>
          </view>
          <text class="avg-label">综合评分</text>
        </view>

        <!-- 评价列表 -->
        <view v-if="reviewList.length > 0">
          <view v-for="item in reviewList" :key="item.reviewId" class="review-item">
            <view class="review-user">
              <image
                class="review-avatar"
                :src="item.avatar || '/static/images/default-avatar.png'"
                mode="aspectFill"
              />
              <text class="review-nickname">{{ item.nickname || '匿名用户' }}</text>
              <view class="review-stars">
                <text
                  v-for="i in 5"
                  :key="i"
                  :style="{ color: i <= item.rating ? '#ffb400' : '#ddd', fontSize: '24rpx' }"
                >★</text>
              </view>
            </view>
            <text class="review-content">{{ item.content }}</text>
            <text class="review-time">{{ item.createTime }}</text>
          </view>
        </view>
        <view v-else class="no-review">
          <text>暂无评价，快来抢先评价吧~</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar" v-if="!loading">
      <view class="footer-left">
        <view
          class="footer-btn"
          @click="goCart"
          v-if="product.categoryId !== 999"
        >
          <uni-icons type="cart" size="24" color="#666"></uni-icons>
          <text class="btn-text">购物车</text>
        </view>
      </view>
      <view class="footer-right">
        <button
          class="add-cart-btn"
          @click="addToCart"
          v-if="product.categoryId !== 999"
        >
          加入购物车
        </button>
        <button class="buy-now-btn" @click="buyNow">
          {{ product.categoryId === 999 ? "立即兑换" : "立即购买" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductDetail } from "@/api/mall/product";
import { addCart } from "@/api/mall/cart";
import { getProductReviews } from "@/api/mall/review";

export default {
  data() {
    return {
      productId: 0,
      loading: true,
      product: {
        productName: "",
        price: 0,
        stock: 0,
        coverImage: "",
        images: [],
        detail: "",
        rating: 0,
      },
      reviewList: [],
      reviewStats: {
        totalCount: 0,
        avgRating: 0,
      },
    };
  },
  onLoad(options) {
    this.productId = options.id;
    this.loadProductDetail();
    this.loadReviews();
  },
  methods: {
    // 加载商品详情
    async loadProductDetail() {
      this.loading = true;
      try {
        const res = await getProductDetail(this.productId);
        this.product = res.data || {};
        // 处理图片数组（兼容 JSON 数组字符串、逗号分隔字符串或纯数组）
        let imgList = [];
        if (typeof this.product.images === "string" && this.product.images.trim()) {
          try {
            const parsed = JSON.parse(this.product.images);
            imgList = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            imgList = this.product.images
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } else if (Array.isArray(this.product.images)) {
          imgList = this.product.images;
        }

        // 如果没有商品轮播图，降级使用封面图
        if (imgList.length === 0 && this.product.coverImage) {
          imgList = [this.product.coverImage];
        }

        this.product.images = imgList;

        // 处理富文本详情中的图片展示与错误链接修复
        if (typeof this.product.detail === "string" && this.product.detail) {
          this.product.detail = this.product.detail
            .replace(/\/dev-api\/(https?:\/\/)/g, "$1")
            .replace(/\/dev-api\/http/g, "http")
            .replace(/<img/gi, '<img style="max-width:100%;height:auto;display:block;margin:10rpx auto;"');
        }
      } catch (error) {
        console.error("加载商品详情失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
      }
    },

    // 图片加载失败降级处理
    onImageError(e, index) {
      if (Array.isArray(this.product.images) && this.product.images[index]) {
        const fallback =
          this.product.coverImage &&
          this.product.images[index] !== this.product.coverImage
            ? this.product.coverImage
            : "/static/images/default-product.png";
        if (this.product.images[index] !== fallback) {
          this.$set(this.product.images, index, fallback);
        }
      }
    },

    // 加入购物车
    async addToCart() {
      try {
        await addCart(this.productId, 1);
        uni.showToast({
          title: "已加入购物车",
          icon: "success",
        });
      } catch (error) {
        uni.showToast({
          title: "加入购物车失败",
          icon: "none",
        });
      }
    },

    // 立即购买
    buyNow() {
      // 创建临时购物车项并跳转到确认订单页
      uni.navigateTo({
        url: `/pages/order/confirm?productId=${this.productId}&quantity=1&type=buy`,
      });
    },

    // 跳转购物车
    goCart() {
      uni.switchTab({
        url: "/pages/cart/index",
      });
    },

    // 加载商品评价列表
    async loadReviews() {
      try {
        const res = await getProductReviews(this.productId, {
          pageNum: 1,
          pageSize: 5,
        });
        if (res.data) {
          this.reviewList = res.data.list || [];
          this.reviewStats = {
            totalCount: res.data.totalCount || 0,
            avgRating: res.data.avgRating || 0,
          };
        }
      } catch (error) {
        console.error("加载评价失败:", error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.product-detail {
  padding-bottom: 120rpx;
  background-color: $uni-bg-color-grey;
}

/* ===== 骨架屏样式 ===== */
@keyframes skeleton-pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.skeleton {
  animation: skeleton-pulse 1.5s infinite ease-in-out;

  .skeleton-image {
    width: 100%;
    height: 750rpx;
    background-color: #e9e9e9;
  }

  .skeleton-info {
    background-color: #fff;
    padding: 32rpx;
    margin-bottom: 16rpx;

    .skeleton-price {
      width: 200rpx;
      height: 48rpx;
      background-color: #e9e9e9;
      border-radius: 8rpx;
      margin-bottom: 20rpx;
    }

    .skeleton-name {
      width: 100%;
      height: 32rpx;
      background-color: #e9e9e9;
      border-radius: 8rpx;
      margin-bottom: 12rpx;

      &.short {
        width: 60%;
      }
    }
  }

  .skeleton-detail {
    background-color: #fff;
    padding: 32rpx;

    .skeleton-title {
      width: 160rpx;
      height: 36rpx;
      background-color: #e9e9e9;
      border-radius: 8rpx;
      margin-bottom: 24rpx;
    }

    .skeleton-line {
      width: 100%;
      height: 24rpx;
      background-color: #e9e9e9;
      border-radius: 8rpx;
      margin-bottom: 16rpx;

      &.short {
        width: 40%;
      }
    }
  }
}

/* ===== 正常页面样式 ===== */
.product-swiper {
  width: 100%;
  height: 750rpx;
  background-color: #fff;

  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

.product-info {
  background-color: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .price-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .price {
    font-size: 48rpx;
    font-weight: bold;
    color: $uni-color-primary;
  }

  .stock {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }

  .product-name {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-top: 16rpx;
    line-height: 1.4;
  }

  .rating-info {
    display: flex;
    align-items: center;
    margin-top: 12rpx;

    .rating-label {
      font-size: 26rpx;
      color: $uni-text-color-grey;
      margin-right: 12rpx;
    }

    .rating-score {
      display: flex;
      align-items: center;

      .rating-value {
        font-size: 28rpx;
        color: #ffb400;
        font-weight: bold;
        margin-left: 8rpx;
      }

      &.empty {
        font-size: 26rpx;
        color: $uni-text-color-grey;
      }
    }
  }
}

.detail-section {
  background-color: #fff;
  padding: 32rpx;

  .section-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: 24rpx;
  }

  .detail-content {
    line-height: 1.8;
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

  .footer-left {
    display: flex;
  }

  .footer-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 32rpx;

    .btn-text {
      font-size: 20rpx;
      color: $uni-text-color-grey;
      margin-top: 4rpx;
    }
  }

  .footer-right {
    display: flex;
    gap: 16rpx;
  }

  .add-cart-btn,
  .buy-now-btn {
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 48rpx;
    border-radius: 36rpx;
    font-size: $uni-font-size-base;
  }

  .add-cart-btn {
    background-color: $uni-color-primary-light;
    color: #fff;
  }

  .buy-now-btn {
    background-color: $uni-color-primary;
    color: #fff;
  }
}

/* ===== 评价区样式 ===== */
.review-section {
  background-color: #fff;
  margin-top: 16rpx;
  padding: 24rpx 32rpx;

  .section-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
    }

    .review-count {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }

  .rating-overview {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    margin-bottom: 16rpx;
    border-bottom: 1rpx solid $uni-border-color;

    .avg-score {
      font-size: 48rpx;
      font-weight: bold;
      color: #ffb400;
      margin-right: 12rpx;
    }

    .stars-row {
      display: flex;
      margin-right: 12rpx;
    }

    .star-icon {
      font-size: 28rpx;
    }

    .avg-label {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }

  .review-item {
    padding: 20rpx 0;
    border-bottom: 1rpx solid $uni-border-color;

    &:last-child {
      border-bottom: none;
    }

    .review-user {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;

      .review-avatar {
        width: 52rpx;
        height: 52rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }

      .review-nickname {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        margin-right: 12rpx;
      }

      .review-stars {
        display: flex;
      }
    }

    .review-content {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      line-height: 1.6;
      display: block;
      margin-bottom: 8rpx;
    }

    .review-time {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }

  .no-review {
    text-align: center;
    padding: 40rpx 0;
    color: $uni-text-color-grey;
    font-size: $uni-font-size-base;
  }
}
</style>
