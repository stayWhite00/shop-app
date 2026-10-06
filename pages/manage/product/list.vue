<template>
  <view class="manage-product-page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索商品名称"
          confirm-type="search"
          @confirm="onSearch"
          @input="onSearchInput"
        />
        <uni-icons v-if="keyword" type="clear" size="18" color="#ccc" @click="clearSearch"></uni-icons>
      </view>
    </view>

    <!-- 筛选标签栏 -->
    <view class="filter-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeStatus === tab.value }"
        @click="changeStatus(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 商品列表 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="productList.length > 0">
        <view
          v-for="item in productList"
          :key="item.productId"
          class="product-card"
          @click="goDetail(item.productId)"
        >
          <!-- 商品图片 -->
          <image
            class="product-img"
            :src="item.coverImage || '/static/images/profile.jpg'"
            mode="aspectFill"
          />
          <!-- 商品信息 -->
          <view class="product-info">
            <text class="product-name ellipsis2">{{ item.productName }}</text>
            <view class="product-meta">
              <text class="price">¥{{ item.price }}</text>
              <text class="stock">库存: {{ item.stock }}</text>
            </view>
            <view class="product-tags">
              <text class="tag sales">销量 {{ item.sales || 0 }}</text>
              <text
                class="tag status"
                :class="item.status === 1 ? 'on' : 'off'"
              >{{ item.status === 1 ? '上架' : '下架' }}</text>
            </view>
          </view>
          <!-- 右侧箭头 -->
          <uni-icons type="right" size="16" color="#ccc" class="arrow-icon"></uni-icons>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="productList.length === 0 && !loading" class="empty-state">
        <uni-icons type="list" size="60" color="#ddd"></uni-icons>
        <text class="empty-text">暂无商品数据</text>
      </view>

      <!-- 加载更多 -->
      <view class="load-more-tip">
        <text v-if="loading">加载中...</text>
        <text v-else-if="finished && productList.length > 0">已加载全部</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getProductList } from "@/api/mall/product";

export default {
  data() {
    return {
      keyword: "",
      activeStatus: -1,
      statusTabs: [
        { label: "全部", value: -1 },
        { label: "上架", value: 1 },
        { label: "下架", value: 0 },
      ],
      productList: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      refreshing: false,
      finished: false,
    };
  },
  onLoad() {
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
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
        };
        if (this.keyword) params.keyword = this.keyword;
        if (this.activeStatus !== -1) params.status = this.activeStatus;

        const res = await getProductList(params);
        const list = (res.data && res.data.list) || [];
        if (list.length < this.pageSize) this.finished = true;
        this.productList = [...this.productList, ...list];
        this.pageNum++;
      } catch (e) {
        uni.showToast({ title: "加载失败", icon: "none" });
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

    onSearch() {
      this.initData();
    },

    onSearchInput() {
      if (!this.keyword) this.initData();
    },

    clearSearch() {
      this.keyword = "";
      this.initData();
    },

    changeStatus(val) {
      this.activeStatus = val;
      this.initData();
    },

    goDetail(productId) {
      uni.navigateTo({
        url: `/pages/manage/product/detail?id=${productId}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.manage-product-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 搜索栏 */
.search-bar {
  background-color: #fff;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #eee;

  .search-input-wrap {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 24rpx;
    height: 68rpx;

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      margin: 0 12rpx;
      height: 100%;
    }
  }
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    text-align: center;
    height: 72rpx;
    line-height: 72rpx;
    font-size: 26rpx;
    color: #666;
    position: relative;

    &.active {
      color: #E53935;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 25%;
        width: 50%;
        height: 4rpx;
        background-color: #E53935;
        border-radius: 2rpx;
      }
    }
  }
}

/* 列表滚动区 */
.list-scroll {
  flex: 1;
  padding: 16rpx;
  box-sizing: border-box;
}

/* 商品卡片 */
.product-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  .product-img {
    width: 140rpx;
    height: 140rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    background-color: #f5f5f5;
  }

  .product-info {
    flex: 1;
    margin: 0 16rpx;
    overflow: hidden;

    .product-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .product-meta {
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      gap: 24rpx;

      .price {
        font-size: 30rpx;
        font-weight: bold;
        color: #E53935;
      }

      .stock {
        font-size: 24rpx;
        color: #999;
      }
    }

    .product-tags {
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      gap: 12rpx;

      .tag {
        font-size: 22rpx;
        padding: 4rpx 14rpx;
        border-radius: 20rpx;

        &.sales {
          background-color: #fff3e0;
          color: #e65100;
        }

        &.status {
          &.on {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          &.off {
            background-color: #fafafa;
            color: #999;
          }
        }
      }
    }
  }

  .arrow-icon {
    flex-shrink: 0;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 180rpx;

  .empty-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #bbb;
  }
}

/* 加载更多 */
.load-more-tip {
  text-align: center;
  padding: 28rpx 0;
  font-size: 24rpx;
  color: #bbb;
}
</style>
