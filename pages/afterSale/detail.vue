<template>
  <view class="after-sale-detail">
    <!-- 售后状态 -->
    <view class="status-section">
      <view :class="['status-icon', `status-${afterSale.status}`]">
        <uni-icons :type="getStatusIcon(afterSale.status)" size="48" color="#fff"></uni-icons>
      </view>
      <text class="status-text">{{ getStatusText(afterSale.status) }}</text>
    </view>

    <!-- 售后信息 -->
    <view class="info-section">
      <view class="section-title">售后信息</view>
      <view class="info-item">
        <text class="label">订单编号</text>
        <text class="value">{{ afterSale.orderNo }}</text>
      </view>
      <view class="info-item">
        <text class="label">售后类型</text>
        <text class="value">{{ getTypeText(afterSale.type) }}</text>
      </view>
      <view class="info-item">
        <text class="label">退款金额</text>
        <text class="value price">¥{{ afterSale.refundAmount }}</text>
      </view>
      <view class="info-item">
        <text class="label">申请时间</text>
        <text class="value">{{ afterSale.createTime }}</text>
      </view>
    </view>

    <!-- 售后原因 -->
    <view class="reason-section">
      <view class="section-title">售后原因</view>
      <text class="reason-text">{{ afterSale.reason }}</text>
      <view v-if="afterSale.images && afterSale.images.length > 0" class="image-list">
        <image 
          v-for="(image, index) in afterSale.images" 
          :key="index"
          :src="image" 
          mode="aspectFill" 
          class="reason-image"
          @click="previewImage(index)"
        ></image>
      </view>
    </view>

    <!-- 退货物流 -->
    <view v-if="afterSale.type === 2 && afterSale.status >= 2" class="express-section">
      <view class="section-title">退货物流</view>
      <view v-if="afterSale.returnExpressNo" class="express-info">
        <text class="express-no">快递单号: {{ afterSale.returnExpressNo }}</text>
      </view>
      <view v-else-if="afterSale.status === 2" class="express-form">
        <input 
          v-model="expressNo" 
          placeholder="请输入退货快递单号" 
          class="express-input"
        />
        <button class="submit-btn" @click="submitExpress">提交</button>
      </view>
    </view>

    <!-- 拒绝原因 -->
    <view v-if="afterSale.status === 6 && afterSale.rejectReason" class="reject-section">
      <view class="section-title">拒绝原因</view>
      <text class="reject-text">{{ afterSale.rejectReason }}</text>
    </view>
  </view>
</template>

<script>
import { getAfterSaleDetail, submitReturnExpress } from '@/api/mall/afterSale'
import config from '@/config'

const baseUrl = config.baseUrl

export default {
  data() {
    return {
      afterSaleId: 0,
      afterSale: {
        afterSaleId: 0,
        orderId: 0,
        orderNo: '',
        type: 1,
        reason: '',
        images: [],
        refundAmount: 0,
        status: 1,
        rejectReason: '',
        returnExpressNo: '',
        createTime: ''
      },
      expressNo: ''
    }
  },
  onLoad(options) {
    this.afterSaleId = options.id
    this.loadAfterSaleDetail()
  },
  onShow() {
    // 每次页面展示时刷新，确保管理员同意/拒绝后状态及时更新
    if (this.afterSaleId) {
      this.loadAfterSaleDetail()
    }
  },
  methods: {
    // 加载售后详情
    async loadAfterSaleDetail() {
      try {
        const res = await getAfterSaleDetail(this.afterSaleId)
        this.afterSale = res.data || {}
        // 处理图片数组
        if (typeof this.afterSale.images === 'string') {
          try {
            this.afterSale.images = JSON.parse(this.afterSale.images || '[]')
          } catch (e) {
            this.afterSale.images = this.afterSale.images ? this.afterSale.images.split(',') : []
          }
        }
        if (!Array.isArray(this.afterSale.images)) {
          this.afterSale.images = []
        }
        this.afterSale.images = this.afterSale.images.map(img => {
          if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
            return baseUrl + img
          }
          return img
        })
      } catch (error) {
        console.error('加载售后详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        10: '待审核',
        20: '待退货',
        30: '待验收',
        40: '退款中',
        50: '退款已完成',
        60: '已拒绝',
        70: '已取消'
      }
      return statusMap[status] || '未知'
    },
    
    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        10: 'clock',
        20: 'box',
        30: 'eye',
        40: 'wallet',
        50: 'checkmarkempty',
        60: 'close',
        70: 'close'
      }
      return iconMap[status] || 'help'
    },
    
    // 获取类型文本
    getTypeText(type) {
      return type === 1 ? '仅退款' : '退货退款'
    },
    
    // 预览图片
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: this.afterSale.images
      })
    },
    
    // 提交物流单号
    async submitExpress() {
      if (!this.expressNo) {
        uni.showToast({
          title: '请输入快递单号',
          icon: 'none'
        })
        return
      }
      
      try {
        await submitReturnExpress(this.afterSaleId, this.expressNo)
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        })
        this.loadAfterSaleDetail()
      } catch (error) {
        uni.showToast({
          title: '提交失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.after-sale-detail {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
}

.status-section {
  background: linear-gradient(135deg, $uni-color-primary 0%, $uni-color-primary-light 100%);
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .status-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .status-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
  }
}

.info-section,
.reason-section,
.express-section,
.reject-section {
  background-color: #fff;
  margin-top: 16rpx;
  padding: 24rpx 32rpx;
  
  .section-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: 24rpx;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $uni-border-color;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }
  
  .value {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    
    &.price {
      color: $uni-color-primary;
      font-weight: bold;
    }
  }
}

.reason-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  line-height: 1.6;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
  
  .reason-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: $uni-border-radius-base;
  }
}

.express-info {
  .express-no {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }
}

.express-form {
  display: flex;
  gap: 16rpx;
  
  .express-input {
    flex: 1;
    height: 72rpx;
    padding: 0 24rpx;
    background-color: $uni-bg-color-grey;
    border-radius: $uni-border-radius-base;
    font-size: $uni-font-size-base;
  }
  
  .submit-btn {
    width: 160rpx;
    height: 72rpx;
    line-height: 72rpx;
    background-color: $uni-color-primary;
    color: #fff;
    border-radius: $uni-border-radius-base;
    font-size: $uni-font-size-base;
  }
}

.reject-text {
  font-size: $uni-font-size-base;
  color: $uni-color-error;
  line-height: 1.6;
}
</style>
