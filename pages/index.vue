<template>
  <view class="mall-index">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="search-box" @click="goSearch">
          <uni-icons type="search" size="18" color="#999"></uni-icons>
          <text class="search-text">搜索商品</text>
        </view>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#E53935"
      >
        <swiper-item v-for="(item, index) in bannerList" :key="index" @click="handleBannerClick(item)">
          <image
            :src="item.imageUrl"
            mode="aspectFill"
            class="banner-image"
          ></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 分类入口 -->
    <view class="category-section">
      <view
        class="category-item"
        v-for="(item, index) in categoryList"
        :key="index"
        @click="goCategory(item.categoryId)"
      >
        <view class="category-icon-wrap">
          <uni-icons :type="getCategoryIcon(item.categoryName)" size="30" color="#E53935"></uni-icons>
        </view>
        <text class="category-name">{{ item.categoryName }}</text>
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="product-section">
      <view class="section-title">
        <text class="title-text">热门推荐</text>
        <text class="title-more" @click="goProductList">更多 ></text>
      </view>
      <view class="product-list">
        <view
          class="product-item"
          v-for="(item, index) in productList"
          :key="index"
          @click="goProductDetail(item.productId)"
        >
          <image
            :src="item.coverImage"
            mode="aspectFill"
            class="product-image"
          ></image>
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <view class="product-footer">
              <text class="product-price" v-if="Number(item.categoryId) === 999"
                >{{ item.price }} 积分</text
              >
              <text class="product-price" v-else>¥{{ item.price }}</text>
              <view class="add-cart-btn" @click.stop="addToCart(item)">
                <uni-icons
                  type="cart-filled"
                  size="20"
                  color="#fff"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductList, getCategoryList } from "@/api/mall/product";
import { addCart } from "@/api/mall/cart";
import { getHomeBanner } from "@/api/mall/home";

export default {
  data() {
    return {
      statusBarHeight: 0,
      bannerList: [],
      categoryList: [],
      productList: [],
      pageNum: 1,
      pageSize: 10,
    };
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;

    this.loadHomeBanner();
    this.loadCategoryList();
    this.loadProductList();
  },
  methods: {
    // 加载轮播图
    async loadHomeBanner() {
      try {
        const res = await getHomeBanner();
        this.bannerList = res.data;
      } catch (error) {
        console.error("加载轮播图失败:", error);
      }
    },
    // 加载分类列表
    async loadCategoryList() {
      try {
        const res = await getCategoryList(0);
        this.categoryList = res.data.slice(0, 8); // 只显示前8个
      } catch (error) {
        console.error("加载分类失败:", error);
      }
    },

    // 加载商品列表
    async loadProductList() {
      try {
        const res = await getProductList({
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          sortBy: "sales",
          sortOrder: "desc",
        });
        this.productList = res.data.list;
      } catch (error) {
        console.error("加载商品失败:", error);
      }
    },

    // 搜索
    goSearch() {
      uni.navigateTo({
        url: "/pages/product/search",
      });
    },

    // 跳转分类
    goCategory(categoryId) {
      uni.switchTab({
        url: "/pages/category/index",
      });
    },

    // 跳转商品列表
    goProductList() {
      uni.navigateTo({
        url: "/pages/product/list",
      });
    },

    // 跳转商品详情
    goProductDetail(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${productId}`,
      });
    },

    // 加入购物车
    async addToCart(product) {
      try {
        await addCart(product.productId, 1);
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

    // 轮播图点击跳转
    handleBannerClick(banner) {
      if (!banner.linkType || banner.linkType === 0) return;
      
      switch (banner.linkType) {
        case 1: // 商品
          if (banner.linkId) {
            this.goProductDetail(banner.linkId);
          }
          break;
        case 2: // 分类
          if (banner.linkId) {
            // 注意：分类跳转可能需要带参数到分类页，或者直接跳转
            uni.navigateTo({
              url: `/pages/product/list?categoryId=${banner.linkId}`
            });
          }
          break;
        case 3: // 外部链接
          if (banner.linkId) {
            // uni-app Webview跳转或外部浏览器
            uni.navigateTo({
              url: `/pages/common/webview/index?url=${encodeURIComponent(banner.linkId)}`
            });
          }
          break;
      }
    },

    // 获取分类图标映射
    getCategoryIcon(name) {
      if (!name) return 'shop';
      if (name.includes('食品') || name.includes('生鲜') || name.includes('肉')) return 'shop';
      if (name.includes('零食') || name.includes('百货') || name.includes('日用')) return 'wallet';
      if (name.includes('积分') || name.includes('礼')) return 'gift';
      if (name.includes('家电') || name.includes('家居') || name.includes('数码')) return 'home';
      if (name.includes('美妆') || name.includes('洗护')) return 'eye';
      if (name.includes('服饰') || name.includes('鞋')) return 'person';
      return 'list';
    },
  },
};
</script>

<style lang="scss" scoped>
.mall-index {
  background-color: $uni-bg-color-grey;
  min-height: 100vh;
}

.custom-navbar {
  background-color: $uni-color-primary;

  .navbar-content {
    height: 88rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
  }

  .search-box {
    flex: 1;
    height: 64rpx;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;

    .search-text {
      margin-left: 16rpx;
      font-size: $uni-font-size-base;
      color: $uni-text-color-grey;
    }
  }
}

.banner-section {
  .banner-swiper {
    height: 360rpx;
  }

  .banner-image {
    width: 100%;
    height: 100%;
  }
}

.category-section {
  background-color: #fff;
  padding: 32rpx 24rpx;
  display: flex;
  flex-wrap: wrap;

  .category-item {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24rpx;

    .category-icon-wrap {
      width: 96rpx;
      height: 96rpx;
      background-color: #fff1f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12rpx;
    }

    .category-name {
      font-size: $uni-font-size-sm;
      color: $uni-text-color;
    }
  }
}

.product-section {
  margin-top: 16rpx;
  background-color: #fff;
  padding: 24rpx;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .title-text {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
    }

    .title-more {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }

  .product-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .product-item {
    width: 48%;
    background-color: #fff;
    border-radius: $uni-border-radius-base;
    overflow: hidden;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .product-image {
      width: 100%;
      height: 320rpx;
    }

    .product-info {
      padding: 16rpx;
    }

    .product-name {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      line-height: 1.4;
      height: 2.8em;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12rpx;
    }

    .product-price {
      font-size: 32rpx;
      font-weight: bold;
      color: $uni-color-primary;
    }

    .add-cart-btn {
      width: 56rpx;
      height: 56rpx;
      background-color: $uni-color-primary;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
