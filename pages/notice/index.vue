<template>
  <view class="notice-container">
    <view v-if="noticeList.length === 0 && !loading" class="empty-tip"
      >暂无公告</view
    >

    <view
      class="notice-card"
      v-for="item in noticeList"
      :key="item.noticeId"
      @click="goDetail(item.noticeId)"
    >
      <view class="notice-top flex justify-between align-center">
        <view
          class="type-tag"
          :class="item.noticeType === '1' ? 'tag-notice' : 'tag-announce'"
        >
          {{ item.noticeType === "1" ? "通知" : "公告" }}
        </view>
        <text class="notice-time">{{ item.createTime?.substring(0, 10) }}</text>
      </view>
      <text class="notice-title">{{ item.noticeTitle }}</text>
    </view>

    <!-- 加载更多 -->
    <view
      class="load-more"
      v-if="noticeList.length > 0 && hasMore"
      @click="loadMore"
    >
      <text>加载更多</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { getNoticeList } from "@/api/system/notice";

const { proxy } = getCurrentInstance();
const noticeList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const hasMore = ref(true);

async function loadData() {
  loading.value = true;
  try {
    const res = await getNoticeList({ pageNum: pageNum.value, pageSize: 15 });
    if (res.code === 200 && res.data) {
      if (pageNum.value === 1) {
        noticeList.value = res.data.list || [];
      } else {
        noticeList.value.push(...(res.data.list || []));
      }
      hasMore.value = noticeList.value.length < res.data.total;
    }
  } catch (e) {}
  loading.value = false;
}

function loadMore() {
  pageNum.value++;
  loadData();
}

function goDetail(noticeId) {
  proxy.$tab.navigateTo(`/pages/notice/detail?id=${noticeId}`);
}

onMounted(() => loadData());
</script>

<style lang="scss" scoped>
.notice-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx 30rpx;
}

.empty-tip {
  text-align: center;
  color: #ccc;
  font-size: 28rpx;
  padding: 100rpx 0;
}

.notice-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .notice-top {
    margin-bottom: 16rpx;
  }

  .type-tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 6rpx;

    &.tag-notice {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.tag-announce {
      background: #fff3e0;
      color: #e65100;
    }
  }

  .notice-time {
    font-size: 22rpx;
    color: #999;
  }

  .notice-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    display: block;
  }
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
