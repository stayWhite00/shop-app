<template>
  <view class="search-page">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input
          v-model="keyword"
          placeholder="搜索商品"
          class="search-input"
          confirm-type="search"
          @confirm="doSearch"
          @input="onInput"
          focus
        />
        <uni-icons
          v-if="keyword"
          type="clear"
          size="18"
          color="#999"
          @click="clearKeyword"
        ></uni-icons>
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 热门搜索（未输入时显示） -->
    <view v-if="!keyword && !searched" class="hot-section">
      <view class="section-title">热门搜索</view>
      <view class="hot-tags">
        <view
          v-for="(tag, index) in hotKeywords"
          :key="index"
          class="hot-tag"
          @click="searchByTag(tag)"
          >{{ tag }}</view
        >
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="searched" class="result-section">
      <!-- 结果为空 -->
      <view v-if="productList.length === 0 && !loading" class="empty-state">
        <uni-icons type="search" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">没有找到"{{ keyword }}"相关商品</text>
      </view>

      <!-- 商品列表 -->
      <view class="product-list">
        <view
          v-for="item in productList"
          :key="item.productId"
          class="product-item"
          @click="goDetail(item.productId)"
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
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { searchProduct } from "@/api/mall/product";

export default {
  data() {
    return {
      keyword: "",
      hotKeywords: [],
      productList: [],
      loading: false,
      searched: false,
      pageNum: 1,
      pageSize: 20,
    };
  },
  onLoad(options) {
    if (options.keyword) {
      this.keyword = options.keyword;
      this.doSearch();
    }
    this.loadHotKeywords();
  },
  methods: {
    // 加载热门搜索词
    async loadHotKeywords() {
      try {
        const res = await uni.request({
          url: require("@/config").default.baseUrl + "/api/product/hotKeywords",
          method: "get",
          header: { "Admin-Token": uni.getStorageSync("Admin-Token") || "" },
        });
        if (res[1] && res[1].data && res[1].data.code === 200) {
          this.hotKeywords = res[1].data.data || [];
        }
      } catch (e) {
        this.hotKeywords = ["推荐商品", "热销商品", "新品上市"];
      }
    },

    onInput() {
      if (!this.keyword) {
        this.searched = false;
        this.productList = [];
      }
    },

    // 执行搜索
    async doSearch() {
      if (!this.keyword.trim()) return;
      this.loading = true;
      this.searched = true;
      try {
        const res = await searchProduct(this.keyword.trim(), 1, this.pageSize);
        this.productList = res.data.list || [];
      } catch (error) {
        console.error("搜索失败:", error);
        this.productList = [];
      } finally {
        this.loading = false;
      }
    },

    // 点击热词搜索
    searchByTag(tag) {
      this.keyword = tag;
      this.doSearch();
    },

    // 清空关键词
    clearKeyword() {
      this.keyword = "";
      this.searched = false;
      this.productList = [];
    },

    // 跳转详情
    goDetail(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${productId}`,
      });
    },

    // 返回
    goBack() {
      uni.navigateBack();
    },
  },
};
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid $uni-border-color;

  .search-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 32rpx;
    padding: 12rpx 20rpx;
    margin-right: 20rpx;

    .search-input {
      flex: 1;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      margin: 0 12rpx;
      height: 44rpx;
    }
  }

  .cancel-btn {
    font-size: $uni-font-size-base;
    color: $uni-color-primary;
    white-space: nowrap;
  }
}

.hot-section {
  padding: 24rpx;
  background-color: #fff;
  margin-top: 16rpx;

  .section-title {
    font-size: $uni-font-size-base;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: 20rpx;
  }

  .hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .hot-tag {
      padding: 10rpx 24rpx;
      background-color: #f5f5f5;
      border-radius: 32rpx;
      font-size: $uni-font-size-sm;
      color: $uni-text-color;
    }
  }
}

.result-section {
  padding: 16rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    margin-top: 24rpx;
  }
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .product-item {
    width: 48%;
    background-color: #fff;
    border-radius: $uni-border-radius-base;
    overflow: hidden;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

    .product-image {
      width: 100%;
      height: 320rpx;
    }

    .product-info {
      padding: 16rpx;

      .product-name {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        line-height: 1.4;
      }

      .product-footer {
        margin-top: 12rpx;

        .product-price {
          font-size: 32rpx;
          font-weight: bold;
          color: $uni-color-primary;
        }
      }
    }
  }
}
</style>
