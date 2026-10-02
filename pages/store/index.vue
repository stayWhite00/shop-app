<template>
  <view class="store-page">
    <!-- 地图区域 -->
    <map
      class="store-map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :markers="markers"
      :scale="12"
      @markertap="onMarkerTap"
    ></map>

    <!-- 门店列表 -->
    <scroll-view scroll-y class="store-list">
      <view class="list-title">附近门店</view>
      <view
        v-for="(store, index) in storeList"
        :key="store.storeId"
        class="store-card"
        :class="{ active: selectedIndex === index }"
        @click="selectStore(index)"
      >
        <view class="store-main">
          <text class="store-name">{{ store.storeName }}</text>
          <text class="store-hours">{{ store.businessHours }}</text>
        </view>
        <view class="store-sub">
          <text class="store-address"
            >{{ store.province }}{{ store.city }}{{ store.district
            }}{{ store.address }}</text
          >
          <text class="store-phone">{{ store.phone }}</text>
        </view>
        <view class="store-actions">
          <button
            class="action-btn call-btn"
            size="mini"
            @click.stop="callStore(store.phone)"
          >
            <uni-icons type="phone" size="14" color="#E53935"></uni-icons> 电话
          </button>
          <button
            class="action-btn nav-btn"
            size="mini"
            @click.stop="navigateTo(store)"
          >
            <uni-icons type="navigate" size="14" color="#fff"></uni-icons> 导航
          </button>
        </view>
      </view>
      <view v-if="storeList.length === 0" class="empty-tip">暂无门店信息</view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      storeList: [],
      markers: [],
      selectedIndex: -1,
      mapCenter: {
        latitude: 36.2,
        longitude: 117.1,
      },
    };
  },
  onLoad() {
    this.loadStoreList();
  },
  methods: {
    async loadStoreList() {
      try {
        const res = await uni.request({
          url: require("@/config").default.baseUrl + "/api/store/list",
          method: "GET",
          header: { "Admin-Token": uni.getStorageSync("Admin-Token") || "" },
        });
        if (res[1] && res[1].data && res[1].data.code === 200) {
          this.storeList = res[1].data.data || [];
          this.buildMarkers();
          if (this.storeList.length > 0 && this.storeList[0].latitude) {
            this.mapCenter = {
              latitude: this.storeList[0].latitude,
              longitude: this.storeList[0].longitude,
            };
          }
        }
      } catch (e) {
        console.error("加载门店列表失败:", e);
      }
    },

    buildMarkers() {
      this.markers = this.storeList
        .filter((s) => s.latitude && s.longitude)
        .map((store, index) => ({
          id: index,
          latitude: store.latitude,
          longitude: store.longitude,
          title: store.storeName,
          iconPath: "/static/images/tabbar/home_.png",
          width: 28,
          height: 28,
          callout: {
            content: store.storeName,
            display: "BYCLICK",
            borderRadius: 4,
            padding: 6,
            fontSize: 12,
          },
        }));
    },

    selectStore(index) {
      this.selectedIndex = index;
      const store = this.storeList[index];
      if (store.latitude && store.longitude) {
        this.mapCenter = {
          latitude: store.latitude,
          longitude: store.longitude,
        };
      }
    },

    onMarkerTap(e) {
      this.selectedIndex = e.markerId;
    },

    callStore(phone) {
      if (phone) {
        uni.makePhoneCall({ phoneNumber: phone });
      }
    },

    navigateTo(store) {
      if (store.latitude && store.longitude) {
        uni.openLocation({
          latitude: store.latitude,
          longitude: store.longitude,
          name: store.storeName,
          address: store.province + store.city + store.district + store.address,
        });
      } else {
        uni.showToast({ title: "暂无导航信息", icon: "none" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.store-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.store-map {
  width: 100%;
  height: 45vh;
}

.store-list {
  flex: 1;
  background-color: $uni-bg-color-grey;
  padding: 0 24rpx;

  .list-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    padding: 24rpx 0 16rpx;
  }
}

.store-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: border-color 0.2s;
  border: 2rpx solid transparent;

  &.active {
    border-color: $uni-color-primary;
  }

  .store-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    .store-name {
      font-size: 30rpx;
      font-weight: bold;
      color: $uni-text-color;
    }

    .store-hours {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }

  .store-sub {
    margin-bottom: 16rpx;

    .store-address {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
      display: block;
      line-height: 1.6;
    }

    .store-phone {
      font-size: $uni-font-size-sm;
      color: $uni-color-primary;
      margin-top: 4rpx;
      display: block;
    }
  }

  .store-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 4rpx;
      border-radius: 24rpx;
      font-size: 24rpx;
      padding: 0 24rpx;
      height: 56rpx;
      line-height: 56rpx;
    }

    .call-btn {
      background-color: #fff;
      border: 1rpx solid $uni-color-primary;
      color: $uni-color-primary;
    }

    .nav-btn {
      background-color: $uni-color-primary;
      color: #fff;
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: $uni-text-color-grey;
  font-size: $uni-font-size-base;
}
</style>
