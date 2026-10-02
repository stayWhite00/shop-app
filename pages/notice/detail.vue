<template>
  <view class="detail-container">
    <view class="detail-card" v-if="notice">
      <view
        class="type-tag"
        :class="notice.noticeType === '1' ? 'tag-notice' : 'tag-announce'"
      >
        {{ notice.noticeType === "1" ? "通知" : "公告" }}
      </view>
      <text class="detail-title">{{ notice.noticeTitle }}</text>
      <text class="detail-time">{{ notice.createTime }}</text>
      <view class="detail-content">
        <rich-text :nodes="notice.noticeContent"></rich-text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getNoticeDetail } from "@/api/system/notice";

const props = defineProps({});
const notice = ref(null);

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const noticeId = currentPage.options?.id;

  if (noticeId) {
    getNoticeDetail(noticeId).then((res) => {
      if (res.code === 200 && res.data) {
        notice.value = res.data;
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx 30rpx;
}

.detail-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.type-tag {
  display: inline-block;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  margin-bottom: 16rpx;

  &.tag-notice {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.tag-announce {
    background: #fff3e0;
    color: #e65100;
  }
}

.detail-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.detail-time {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-content {
  font-size: 28rpx;
  color: #555;
  line-height: 1.8;
}
</style>
