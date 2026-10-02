<template>
  <view class="product-list-page">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24" color="#333"></uni-icons>
      </view>
      <view class="header-title">{{ pageTitle }}</view>
      <view class="right-placeholder"></view>
    </view>

    <!-- 筛选/排序栏 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: sortBy === 'sales' }" 
        @click="changeSort('sales')"
      >
        <text>销量</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: sortBy === 'price' }" 
        @click="changeSort('price')"
      >
        <text>价格</text>
        <view class="sort-icons">
          <uni-icons 
            type="top" 
            size="10" 
            :color="sortBy === 'price' && sortOrder === 'asc' ? '#E53935' : '#999'"
          ></uni-icons>
          <uni-icons 
            type="bottom" 
            size="10" 
            :color="sortBy === 'price' && sortOrder === 'desc' ? '#E53935' : '#999'"
          ></uni-icons>
        </view>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: sortBy === 'new' }" 
        @click="changeSort('new')"
      >
        <text>新品</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <scroll-view 
      scroll-y 
      class="list-container" 
      @scrolltolower="loadMore"
      refresher-enabled
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <view v-if="productList.length > 0" class="product-grid">
        <view 
          v-for="item in productList" 
          :key="item.productId" 
          class="product-item"
          @click="goDetail(item.productId)"
        >
          <image :src="item.coverImage" mode="aspectFill" class="product-image"></image>
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <view class="product-footer">
              <text class="product-price" v-if="Number(item.categoryId) === 999">{{ item.price }} 积分</text>
              <text class="product-price" v-else>¥{{ item.price }}</text>
              <view class="add-cart-btn" @click.stop="addToCart(item)">
                <uni-icons type="cart-filled" size="18" color="#fff"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="productList.length === 0 && !loading" class="empty-state">
        <uni-icons type="info" size="64" color="#ccc"></uni-icons>
        <text class="empty-text">暂无相关商品</text>
      </view>

      <!-- 加载中/没有更多 -->
      <view class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="finished && productList.length > 0">已经到底了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getProductList, searchProduct } from "@/api/mall/product";
import { addCart } from "@/api/mall/cart";

export default {
  data() {
    return {
      statusBarHeight: 0,
      categoryId: null,
      keyword: '',
      pageTitle: '商品列表',
      productList: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      refreshing: false,
      finished: false,
      sortBy: 'sales', // sales, price, new
      sortOrder: 'desc',
    };
  },
  onLoad(options) {
    // 获取系统信息设置状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;

    if (options.categoryId) {
      this.categoryId = options.categoryId;
      if (options.title) {
        this.pageTitle = options.title;
      }
    }
    if (options.keyword) {
      this.keyword = options.keyword;
      this.pageTitle = `搜索: ${this.keyword}`;
    }

    this.initData();
  },
  methods: {
    async initData() {
      this.pageNum = 1;
      this.productList = [];
      this.finished = false;
      await this.loadData();
    },

    async loadData() {
      if (this.loading || this.finished) return;
      this.loading = true;

      try {
        let res;
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder
        };

        if (this.keyword) {
          // 如果有关键词，使用搜索接口
          res = await searchProduct(this.keyword, this.pageNum, this.pageSize);
        } else {
          // 否则使用列表接口，如果categoryId存在则带上
          if (this.categoryId) {
            params.categoryId = this.categoryId;
          }
          res = await getProductList(params);
        }

        const list = res.data.list || [];
        if (list.length < this.pageSize) {
          this.finished = true;
        }
        
        this.productList = [...this.productList, ...list];
        this.pageNum++;
      } catch (error) {
        console.error("加载数据失败:", error);
        uni.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },

    loadMore() {
      this.loadData();
    },

    onRefresh() {
      this.refreshing = true;
      this.initData();
    },

    changeSort(type) {
      if (type === 'price') {
        if (this.sortBy === 'price') {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortBy = 'price';
          this.sortOrder = 'asc';
        }
      } else {
        this.sortBy = type;
        this.sortOrder = 'desc';
      }
      this.initData();
    },

    goBack() {
      uni.navigateBack();
    },

    goDetail(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${productId}`
      });
    },

    async addToCart(item) {
      try {
        await addCart(item.productId, 1);
        uni.showToast({ title: '已加入购物车', icon: 'success' });
      } catch (error) {
        uni.showToast({ title: '加入购物车失败', icon: 'none' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.product-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}

.status-bar {
  background-color: #fff;
}

.nav-header {
  height: 88rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;

  .back-btn {
    width: 60rpx;
  }

  .header-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
    text-align: center;
  }

  .right-placeholder {
    width: 60rpx;
  }
}

.filter-bar {
  height: 80rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;

  .filter-item {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;

    &.active {
      color: #E53935;
      font-weight: bold;
    }

    .sort-icons {
      display: flex;
      flex-direction: column;
      margin-left: 6rpx;
      line-height: 0.5;
    }
  }
}

.list-container {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-item {
  width: 345rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);

  .product-image {
    width: 100%;
    height: 345rpx;
  }

  .product-info {
    padding: 16rpx;
  }

  .product-name {
    font-size: 28rpx;
    color: #333;
    height: 80rpx;
    line-height: 40rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 16rpx;
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .product-price {
    font-size: 32rpx;
    font-weight: bold;
    color: #E53935;
  }

  .add-cart-btn {
    width: 48rpx;
    height: 48rpx;
    background-color: #E53935;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.empty-state {
  padding-top: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .empty-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.load-more {
  padding: 30rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
</style>
