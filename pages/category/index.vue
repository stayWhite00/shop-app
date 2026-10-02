<template>
  <view class="category-page">
    <view class="category-container">
      <!-- 左侧分类导航 -->
      <scroll-view scroll-y class="category-nav">
        <view
          v-for="(item, index) in categoryList"
          :key="item.categoryId"
          :class="['nav-item', { active: currentIndex === index }]"
          @click="selectCategory(index)"
        >
          <text class="nav-text">{{ item.categoryName }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view scroll-y class="product-container">
        <!-- 二级分类 -->
        <view class="sub-category" v-if="subCategoryList.length > 0">
          <view
            v-for="sub in subCategoryList"
            :key="sub.categoryId"
            class="sub-item"
            @click="selectSubCategory(sub.categoryId)"
          >
            <view class="sub-icon-wrap">
              <uni-icons :type="getCategoryIcon(sub.categoryName)" size="24" color="#E53935"></uni-icons>
            </view>
            <text class="sub-name">{{ sub.categoryName }}</text>
          </view>
        </view>

        <!-- 筛选栏 -->
        <view class="filter-bar">
          <view class="filter-items">
            <!-- 价格排序 -->
            <view class="filter-item" @click="togglePriceSort">
              <text :class="{ active: sortBy === 'price' }">价格排序</text>
              <view class="sort-icon">
                <uni-icons
                  type="top"
                  size="10"
                  :color="
                    sortBy === 'price' && sortOrder === 'asc'
                      ? '#E53935'
                      : '#999'
                  "
                ></uni-icons>
                <uni-icons
                  type="bottom"
                  size="10"
                  :color="
                    sortBy === 'price' && sortOrder === 'desc'
                      ? '#E53935'
                      : '#999'
                  "
                ></uni-icons>
              </view>
            </view>
            <!-- 销售范围筛选 -->
            <view class="filter-item">
              <picker
                @change="onScopeChange"
                :value="scopeIndex"
                :range="scopeOptions"
                range-key="label"
              >
                <view class="picker-value">
                  {{ scopeOptions[scopeIndex].label }}
                  <uni-icons type="bottom" size="12" color="#666"></uni-icons>
                </view>
              </picker>
            </view>
          </view>
          <!-- 价格区间筛选 -->
          <view class="price-range">
            <input
              class="range-input"
              type="digit"
              placeholder="最低价"
              v-model="minPrice"
              @confirm="applyFilter"
            />
            <text class="range-divider">-</text>
            <input
              class="range-input"
              type="digit"
              placeholder="最高价"
              v-model="maxPrice"
              @confirm="applyFilter"
            />
            <button class="filter-btn" @click="applyFilter">筛选</button>
          </view>
        </view>

        <!-- 商品列表 -->
        <view class="product-list">
          <view
            v-for="product in productList"
            :key="product.productId"
            class="product-item"
            @click="goProductDetail(product.productId)"
          >
            <image
              :src="product.coverImage"
              mode="aspectFill"
              class="product-image"
            ></image>
            <view class="product-info">
              <text class="product-name">{{ product.productName }}</text>
              <view class="product-footer">
                <text
                  class="product-price"
                  v-if="Number(product.categoryId) === 999"
                  >{{ product.price }} 积分</text
                >
                <text class="product-price" v-else>¥{{ product.price }}</text>
                <view class="add-cart-btn" @click.stop="addToCart(product)">
                  <uni-icons
                    type="cart-filled"
                    size="18"
                    color="#fff"
                  ></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="productList.length === 0" class="empty-state">
          <image
            src="/static/images/empty.png"
            mode="aspectFit"
            class="empty-image"
          ></image>
          <text class="empty-text">暂无商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getCategoryList, getProductList } from "@/api/mall/product";
import { addCart } from "@/api/mall/cart";

export default {
  data() {
    return {
      currentIndex: 0,
      categoryList: [],
      subCategoryList: [],
      productList: [],
      currentCategoryId: null,
      sortBy: "",
      sortOrder: "desc",
      scopeOptions: [
        { label: "全部范围", value: null },
        { label: "全国发货", value: 1 },
        { label: "本地专属", value: 2 },
      ],
      scopeIndex: 0,
      minPrice: "",
      maxPrice: "",
    };
  },
  onLoad() {
    this.loadCategoryList();
  },
  methods: {
    // 加载一级分类
    async loadCategoryList() {
      try {
        const res = await getCategoryList(0);
        this.categoryList = res.data;
        if (this.categoryList.length > 0) {
          this.selectCategory(0);
        }
      } catch (error) {
        console.error("加载分类失败:", error);
      }
    },

    // 选择一级分类
    async selectCategory(index) {
      this.currentIndex = index;
      const category = this.categoryList[index];

      // 加载二级分类
      try {
        const res = await getCategoryList(category.categoryId);
        this.subCategoryList = res.data;
      } catch (error) {
        console.error("加载子分类失败:", error);
      }

      // 加载该分类下的商品
      this.loadProductList(category.categoryId);
    },

    // 选择二级分类
    selectSubCategory(categoryId) {
      this.currentCategoryId = categoryId;
      this.loadProductList(categoryId);
    },

    // 销售范围改变
    onScopeChange(e) {
      this.scopeIndex = e.detail.value;
      this.applyFilter();
    },

    // 切换价格排序
    togglePriceSort() {
      if (this.sortBy !== "price") {
        this.sortBy = "price";
        this.sortOrder = "asc";
      } else {
        if (this.sortOrder === "asc") {
          this.sortOrder = "desc";
        } else {
          this.sortBy = ""; // 重置排序
          this.sortOrder = "desc";
        }
      }
      this.applyFilter();
    },

    // 执行自定义筛选
    applyFilter() {
      if (
        this.currentCategoryId ||
        (this.categoryList.length > 0 && this.currentIndex !== -1)
      ) {
        const catId =
          this.currentCategoryId ||
          this.categoryList[this.currentIndex].categoryId;
        this.loadProductList(catId);
      }
    },

    // 加载商品列表
    async loadProductList(categoryId) {
      this.currentCategoryId = categoryId;
      try {
        const params = {
          categoryId,
          pageNum: 1,
          pageSize: 50,
        };
        // 挂载动态筛选排序参数
        if (this.sortBy) {
          params.sortBy = this.sortBy;
          params.sortOrder = this.sortOrder;
        }
        if (this.scopeOptions[this.scopeIndex].value) {
          params.saleScope = this.scopeOptions[this.scopeIndex].value;
        }
        if (this.minPrice !== "") {
          params.minPrice = parseFloat(this.minPrice) || 0;
        }
        if (this.maxPrice !== "") {
          params.maxPrice = parseFloat(this.maxPrice) || 0;
        }

        const res = await getProductList(params);
        this.productList = res.data.list;
      } catch (error) {
        console.error("加载商品失败:", error);
      }
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
.category-page {
  height: 100vh;
  background-color: $uni-bg-color-grey;
}

.category-container {
  display: flex;
  height: 100%;
}

.category-nav {
  width: 180rpx;
  background-color: $uni-bg-color-grey;

  .nav-item {
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $uni-bg-color-grey;
    position: relative;

    &.active {
      background-color: #fff;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 40rpx;
        background-color: $uni-color-primary;
        border-radius: 0 4rpx 4rpx 0;
      }
    }

    .nav-text {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }
  }
}

.product-container {
  flex: 1;
  background-color: #fff;
}

.sub-category {
  padding: 24rpx;
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1rpx solid;
  flex-wrap: wrap;
  padding: 16rpx;

  .sub-item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24rpx;

    .sub-icon-wrap {
      width: 100rpx;
      height: 100rpx;
      background-color: #fff1f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12rpx;
    }

    .sub-name {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.filter-bar {
  background-color: #fff;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 10rpx;

  .filter-items {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    padding: 0 10rpx;
  }

  .filter-item {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #333;

    .active {
      color: #E53935;
      font-weight: bold;
    }

    .sort-icon {
      display: flex;
      flex-direction: column;
      margin-left: 6rpx;
      line-height: 0.5;
    }

    .picker-value {
      display: flex;
      align-items: center;
      background-color: #f7f8fa;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      color: #666;
    }
  }

  .price-range {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .range-input {
      background-color: #f7f8fa;
      text-align: center;
      border-radius: 24rpx;
      height: 48rpx;
      font-size: 24rpx;
      flex: 1;
    }

    .range-divider {
      margin: 0 16rpx;
      color: #999;
    }

    .filter-btn {
      margin-left: 20rpx;
      width: 100rpx;
      height: 48rpx;
      line-height: 48rpx;
      border-radius: 24rpx;
      background-color: #E53935;
      color: #fff;
      font-size: 24rpx;
      padding: 0;
    }
  }
}

.product-list {
  padding: 16rpx;
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
    height: 260rpx;
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
    font-size: 28rpx;
    font-weight: bold;
    color: $uni-color-primary;
  }

  .add-cart-btn {
    width: 48rpx;
    height: 48rpx;
    background-color: $uni-color-primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
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
