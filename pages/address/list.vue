<template>
  <view class="address-list">
    <!-- 地址列表 -->
    <view v-for="address in addressList" :key="address.addressId" class="address-item" @click="selectAddress(address)">
      <view class="address-info">
        <view class="address-header">
          <text class="consignee">{{ address.consignee }}</text>
          <text class="phone">{{ address.phone }}</text>
          <view v-if="address.isDefault === 1" class="default-tag">默认</view>
        </view>
        <text class="address-detail">
          {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
        </text>
      </view>
      
      <view class="address-actions" @click.stop>
        <view class="action-btn" @click="editAddress(address)">
          <uni-icons type="compose" size="20" color="#666"></uni-icons>
        </view>
        <view class="action-btn" @click="deleteAddress(address)">
          <uni-icons type="trash" size="20" color="#666"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="addressList.length === 0" class="empty-state">
      <image src="/static/images/empty-address.png" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">暂无收货地址</text>
    </view>

    <!-- 添加地址按钮 -->
    <view class="add-button">
      <button class="add-btn" @click="addAddress">添加新地址</button>
    </view>
  </view>
</template>

<script>
import { getAddressList, deleteAddress as deleteAddressApi, setDefaultAddress } from '@/api/mall/user'

export default {
  data() {
    return {
      addressList: [],
      fromPage: ''
    }
  },
  onLoad(options) {
    this.fromPage = options.from || ''
    this.loadAddressList()
  },
  onShow() {
    this.loadAddressList()
  },
  methods: {
    // 加载地址列表
    async loadAddressList() {
      try {
        const res = await getAddressList()
        this.addressList = res.data
      } catch (error) {
        console.error('加载地址失败:', error)
      }
    },
    
    // 选择地址
    selectAddress(address) {
      if (this.fromPage === 'order') {
        // 从订单页面进入,选择后返回
        uni.$emit('selectAddress', address)
        uni.navigateBack()
      } else {
        // 设置为默认地址
        this.setDefault(address)
      }
    },
    
    // 设置默认地址
    async setDefault(address) {
      if (address.isDefault === 1) return
      
      try {
        await setDefaultAddress(address.addressId)
        uni.showToast({
          title: '设置成功',
          icon: 'success'
        })
        this.loadAddressList()
      } catch (error) {
        uni.showToast({
          title: '设置失败',
          icon: 'none'
        })
      }
    },
    
    // 添加地址
    addAddress() {
      uni.navigateTo({
        url: '/pages/address/edit'
      })
    },
    
    // 编辑地址
    editAddress(address) {
      uni.navigateTo({
        url: `/pages/address/edit?id=${address.addressId}`
      })
    },
    
    // 删除地址
    deleteAddress(address) {
      uni.showModal({
        title: '提示',
        content: '确定删除该地址?',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteAddressApi(address.addressId)
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadAddressList()
            } catch (error) {
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.address-list {
  min-height: 100vh;
  padding: 16rpx;
  padding-bottom: 120rpx;
  background-color: $uni-bg-color-grey;
}

.address-item {
  background-color: #fff;
  border-radius: $uni-border-radius-base;
  padding: 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  
  .address-info {
    flex: 1;
  }
  
  .address-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .consignee {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      margin-right: 24rpx;
    }
    
    .phone {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      margin-right: 16rpx;
    }
    
    .default-tag {
      padding: 4rpx 12rpx;
      background-color: $uni-color-primary;
      color: #fff;
      font-size: 20rpx;
      border-radius: 4rpx;
    }
  }
  
  .address-detail {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    line-height: 1.6;
  }
  
  .address-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 24rpx;
    margin-left: 24rpx;
    
    .action-btn {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $uni-bg-color-grey;
      border-radius: 50%;
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

.add-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-top: 1rpx solid $uni-border-color;
  
  .add-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background-color: $uni-color-primary;
    color: #fff;
    border-radius: 44rpx;
    font-size: $uni-font-size-base;
  }
}
</style>
