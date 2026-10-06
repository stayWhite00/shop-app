<template>
  <view class="manage-detail-page">
    <!-- 骨架屏 -->
    <view v-if="loading" class="skeleton">
      <view class="sk-img"></view>
      <view class="sk-body">
        <view class="sk-line w60"></view>
        <view class="sk-line w40"></view>
        <view class="sk-line"></view>
        <view class="sk-line w80"></view>
      </view>
    </view>

    <!-- 详情内容 -->
    <scroll-view v-else scroll-y class="detail-scroll">

      <!-- 商品图片轮播 -->
      <view class="image-section">
        <swiper
          class="img-swiper"
          :indicator-dots="imageList.length > 1"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#E53935"
          circular
        >
          <swiper-item v-for="(img, idx) in imageList" :key="idx">
            <image :src="img" mode="aspectFill" class="swiper-img" @click="previewImage(idx)" />
          </swiper-item>
        </swiper>
      </view>

      <!-- 基本信息卡片 -->
      <view class="info-card">
        <view class="card-title">基本信息</view>

        <view class="info-row">
          <text class="label">商品名称</text>
          <text class="value">{{ product.productName }}</text>
        </view>

        <view class="info-row">
          <text class="label">商品分类</text>
          <text class="value">{{ product.categoryName || product.categoryId || '—' }}</text>
        </view>

        <view class="info-row">
          <text class="label">商品价格</text>
          <text class="value price-text">
            {{ product.categoryId === 999 ? product.price + ' 积分' : '¥' + product.price }}
          </text>
        </view>

        <view class="info-row" v-if="product.originalPrice">
          <text class="label">原始价格</text>
          <text class="value line-through">¥{{ product.originalPrice }}</text>
        </view>

        <view class="info-row">
          <text class="label">库存数量</text>
          <text class="value" :class="product.stock <= 10 ? 'warn-text' : ''">
            {{ product.stock }}
            <text v-if="product.stock <= 10" class="warn-badge">库存紧张</text>
          </text>
        </view>

        <view class="info-row">
          <text class="label">累计销量</text>
          <text class="value">{{ product.sales || 0 }}</text>
        </view>

        <view class="info-row">
          <text class="label">商品评分</text>
          <view class="value stars-row" v-if="product.rating">
            <text
              v-for="i in 5"
              :key="i"
              class="star"
              :style="{ color: i <= Math.round(product.rating) ? '#ffb400' : '#ddd' }"
            >★</text>
            <text class="rating-num">{{ product.rating }} 分</text>
          </view>
          <text class="value" v-else>暂无评分</text>
        </view>

        <view class="info-row">
          <text class="label">上架状态</text>
          <view class="value">
            <text class="status-badge" :class="product.status === 1 ? 'on' : 'off'">
              {{ product.status === 1 ? '已上架' : '已下架' }}
            </text>
          </view>
        </view>

        <view class="info-row" v-if="product.createTime">
          <text class="label">创建时间</text>
          <text class="value">{{ product.createTime }}</text>
        </view>

        <view class="info-row" v-if="product.updateTime">
          <text class="label">更新时间</text>
          <text class="value">{{ product.updateTime }}</text>
        </view>
      </view>

      <!-- 商品详情 -->
      <view class="info-card">
        <view class="card-title">商品详情</view>
        <view v-if="product.detail" class="detail-content-wrap">
          <rich-text :nodes="product.detail" class="detail-rich"></rich-text>
        </view>
        <view v-else class="no-content">暂无图文详情</view>
      </view>

      <!-- 底部留白 -->
      <view class="footer-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="!loading">
      <button
        class="action-btn toggle-btn"
        :class="product.status === 1 ? 'btn-warning' : 'btn-success'"
        @click="toggleStatus"
        :loading="toggling"
      >
        {{ product.status === 1 ? '下架商品' : '上架商品' }}
      </button>
      <button class="action-btn edit-btn" @click="goEdit">
        编辑商品
      </button>
    </view>
  </view>
</template>

<script>
import { getProductDetail } from "@/api/mall/product";

export default {
  data() {
    return {
      productId: 0,
      loading: true,
      toggling: false,
      product: {
        productName: "",
        price: 0,
        originalPrice: 0,
        stock: 0,
        sales: 0,
        rating: 0,
        status: 1,
        categoryId: null,
        categoryName: "",
        coverImage: "",
        images: [],
        detail: "",
        createTime: "",
        updateTime: "",
      },
    };
  },

  computed: {
    /** 解析后的轮播图列表，至少包含封面 */
    imageList() {
      let imgs = [];
      const raw = this.product.images;
      if (typeof raw === "string" && raw.trim()) {
        try {
          const parsed = JSON.parse(raw);
          imgs = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          imgs = raw.split(",").map((s) => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(raw)) {
        imgs = raw;
      }
      if (imgs.length === 0 && this.product.coverImage) {
        imgs = [this.product.coverImage];
      }
      return imgs;
    },
  },

  onLoad(options) {
    this.productId = options.id;
    this.loadDetail();
  },

  methods: {
    /** 加载商品详情 */
    async loadDetail() {
      this.loading = true;
      try {
        const res = await getProductDetail(this.productId);
        const data = res.data || {};
        // 修复富文本图片路径
        if (typeof data.detail === "string" && data.detail) {
          data.detail = data.detail
            .replace(/\/dev-api\/(https?:\/\/)/g, "$1")
            .replace(/\/dev-api\/http/g, "http")
            .replace(
              /<img/gi,
              '<img style="max-width:100%;height:auto;display:block;margin:10rpx auto;"'
            );
        }
        this.product = { ...this.product, ...data };
      } catch (e) {
        uni.showToast({ title: "加载失败，请稍后重试", icon: "none" });
      } finally {
        this.loading = false;
      }
    },

    /** 预览图片 */
    previewImage(index) {
      if (this.imageList.length === 0) return;
      uni.previewImage({
        current: this.imageList[index],
        urls: this.imageList,
      });
    },

    /** 切换上架/下架状态（示例：调用后端接口，这里模拟） */
    async toggleStatus() {
      const action = this.product.status === 1 ? "下架" : "上架";
      const confirm = await uni.showModal({
        title: "操作确认",
        content: `确定要${action}该商品吗？`,
        confirmText: "确定",
        cancelText: "取消",
      });
      if (!confirm.confirm) return;

      this.toggling = true;
      try {
        // TODO: 替换为实际的上下架接口
        // await updateProductStatus(this.productId, this.product.status === 1 ? 0 : 1);
        this.product.status = this.product.status === 1 ? 0 : 1;
        uni.showToast({ title: `${action}成功`, icon: "success" });
      } catch (e) {
        uni.showToast({ title: `${action}失败`, icon: "none" });
      } finally {
        this.toggling = false;
      }
    },

    /** 跳转编辑页（待实现） */
    goEdit() {
      uni.showToast({ title: "编辑功能建设中", icon: "none" });
    },
  },
};
</script>

<style lang="scss" scoped>
.manage-detail-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* ===== 骨架屏 ===== */
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

.skeleton {
  animation: pulse 1.4s ease-in-out infinite;

  .sk-img {
    width: 100%;
    height: 560rpx;
    background-color: #e9e9e9;
  }

  .sk-body {
    background: #fff;
    padding: 32rpx;
    margin-top: 16rpx;
  }

  .sk-line {
    height: 28rpx;
    background-color: #e9e9e9;
    border-radius: 8rpx;
    margin-bottom: 20rpx;

    &.w40 { width: 40%; }
    &.w60 { width: 60%; }
    &.w80 { width: 80%; }
  }
}

/* ===== 详情滚动容器 ===== */
.detail-scroll {
  flex: 1;
  padding-bottom: 120rpx;
}

/* ===== 图片轮播 ===== */
.image-section {
  .img-swiper {
    width: 100%;
    height: 560rpx;

    .swiper-img {
      width: 100%;
      height: 100%;
    }
  }
}

/* ===== 信息卡片 ===== */
.info-card {
  background-color: #fff;
  margin-top: 16rpx;
  padding: 0 32rpx;

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    padding: 28rpx 0 16rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }

  .info-row {
    display: flex;
    align-items: flex-start;
    padding: 22rpx 0;
    border-bottom: 1rpx solid #fafafa;
    min-height: 72rpx;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 160rpx;
      flex-shrink: 0;
      font-size: 26rpx;
      color: #999;
      line-height: 1.5;
    }

    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      line-height: 1.5;
      word-break: break-all;

      &.price-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #E53935;
      }

      &.line-through {
        text-decoration: line-through;
        color: #bbb;
      }

      &.warn-text {
        color: #ff6d00;
      }

      .warn-badge {
        font-size: 20rpx;
        background-color: #fff3e0;
        color: #e65100;
        padding: 2rpx 10rpx;
        border-radius: 12rpx;
        margin-left: 10rpx;
      }
    }

    .stars-row {
      display: flex;
      align-items: center;

      .star {
        font-size: 28rpx;
      }

      .rating-num {
        font-size: 26rpx;
        color: #ffb400;
        margin-left: 8rpx;
      }
    }

    .status-badge {
      font-size: 24rpx;
      padding: 6rpx 20rpx;
      border-radius: 24rpx;

      &.on {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &.off {
        background-color: #fafafa;
        color: #999;
        border: 1rpx solid #eee;
      }
    }
  }
}

/* ===== 富文本详情区 ===== */
.detail-content-wrap {
  padding: 16rpx 0 32rpx;

  .detail-rich {
    line-height: 1.8;
    font-size: 28rpx;
    color: #444;
  }
}

.no-content {
  text-align: center;
  padding: 60rpx 0;
  font-size: 26rpx;
  color: #bbb;
}

.footer-placeholder {
  height: 32rpx;
}

/* ===== 底部操作栏 ===== */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
  gap: 20rpx;

  .action-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    border: none;
  }

  .toggle-btn {
    &.btn-warning {
      background-color: #fff3e0;
      color: #e65100;
    }

    &.btn-success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
  }

  .edit-btn {
    background-color: #E53935;
    color: #fff;
  }
}
</style>
