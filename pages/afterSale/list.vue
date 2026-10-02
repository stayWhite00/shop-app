<template>
  <view class="after-sale-list">
    <!-- 售后列表 -->
    <scroll-view scroll-y class="list-scroll">
      <view v-for="item in afterSaleList" :key="item.afterSaleId" class="after-sale-item" @click="goDetail(item.afterSaleId)">
        <!-- 售后头部 -->
        <view class="item-header">
          <text class="order-no">订单号: {{ item.orderNo }}</text>
          <text :class="['status-text', `status-${item.status}`]">{{ getStatusText(item.status) }}</text>
        </view>

        <!-- 售后信息 -->
        <view class="item-content">
          <view class="info-row">
            <text class="label">售后类型:</text>
            <text class="value">{{ getTypeText(item.type) }}</text>
          </view>
          <view class="info-row">
            <text class="label">退款金额:</text>
            <text class="value price">¥{{ item.refundAmount }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间:</text>
            <text class="value">{{ item.createTime }}</text>
          </view>
          <view class="info-row">
            <text class="label">售后原因:</text>
            <text class="value reason">{{ item.reason }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view v-if="item.status === 2" class="item-footer">
          <button class="btn btn-small" @click.stop="fillExpress(item)">填写物流</button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="afterSaleList.length === 0" class="empty-state">
        <image src="/static/images/empty-after-sale.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无售后记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getAfterSaleList } from '@/api/mall/afterSale'

export default {
  data() {
    return {
      afterSaleList: [],
      pageNum: 1,
      pageSize: 10
    }
  },
  onLoad() {
    this.loadAfterSaleList()
  },
  methods: {
    // 加载售后列表
    async loadAfterSaleList() {
      try {
        const res = await getAfterSaleList({
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        this.afterSaleList = res.data
      } catch (error) {
        console.error('加载售后列表失败:', error)
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        1: '待审核',
        2: '待退货',
        3: '待验收',
        4: '退款中',
        5: '已完成',
        6: '已拒绝'
      }
      return statusMap[status] || '未知'
    },
    
    // 获取类型文本
    getTypeText(type) {
      return type === 1 ? '仅退款' : '退货退款'
    },
    
    // 跳转详情
    goDetail(afterSaleId) {
      uni.navigateTo({
        url: `/pages/afterSale/detail?id=${afterSaleId}`
      })
    },
    
    // 填写物流
    fillExpress(item) {
      uni.navigateTo({
        url: `/pages/afterSale/detail?id=${item.afterSaleId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.after-sale-list {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
}

.list-scroll {
  height: 100vh;
  padding: 16rpx;
}

.after-sale-item {
  background-color: #fff;
  border-radius: $uni-border-radius-base;
  margin-bottom: 16rpx;
  overflow: hidden;
  
  .item-header {
    padding: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid $uni-border-color;
    
    .order-no {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
    
    .status-text {
      font-size: $uni-font-size-base;
      
      &.status-1 { color: $uni-color-warning; }
      &.status-2 { color: $uni-color-primary; }
      &.status-3 { color: $uni-color-warning; }
      &.status-4 { color: $uni-color-primary; }
      &.status-5 { color: $uni-color-success; }
      &.status-6 { color: $uni-text-color-grey; }
    }
  }
  
  .item-content {
    padding: 24rpx;
  }
  
  .info-row {
    display: flex;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      width: 160rpx;
      font-size: $uni-font-size-base;
      color: $uni-text-color-grey;
    }
    
    .value {
      flex: 1;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      
      &.price {
        color: $uni-color-primary;
        font-weight: bold;
      }
      
      &.reason {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }
  }
  
  .item-footer {
    padding: 16rpx 24rpx;
    border-top: 1rpx solid $uni-border-color;
    display: flex;
    justify-content: flex-end;
    
    .btn-small {
      height: 56rpx;
      line-height: 56rpx;
      padding: 0 32rpx;
      background-color: $uni-color-primary;
      color: #fff;
      border-radius: 28rpx;
      font-size: $uni-font-size-sm;
    }
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
