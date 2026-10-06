<template>
  <view class="review-container">
    <view class="review-header">
      <text class="title">评价商品</text>
    </view>

    <!-- 评分 -->
    <view class="section">
      <text class="section-label">商品评分</text>
      <view class="star-row flex">
        <text
          v-for="i in 5"
          :key="i"
          class="star"
          :class="{ active: i <= form.rating }"
          @click="form.rating = i"
          >★</text
        >
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="section">
      <text class="section-label">评价内容</text>
      <textarea
        v-model="form.content"
        placeholder="分享使用感受，帮助其他买家~"
        maxlength="500"
        class="review-textarea"
      />
      <text class="char-count">{{ form.content.length }}/500</text>
    </view>

    <!-- 匿名评价 -->
    <view class="section anonymous-section flex justify-between align-center">
      <text class="section-label">匿名评价</text>
      <switch
        :checked="form.anonymous === 1"
        @change="form.anonymous = $event.detail.value ? 1 : 0"
        color="#E53935"
      />
    </view>

    <!-- 上传图片 -->
    <view class="section">
      <text class="section-label">添加图片</text>
      <view class="upload-list flex flex-wrap">
        <view
          v-for="(img, index) in imageList"
          :key="index"
          class="upload-item"
        >
          <image :src="img" mode="aspectFill" class="upload-img" />
          <view class="delete-btn" @click="deleteImage(index)">×</view>
        </view>
        <view
          v-if="imageList.length < 5"
          class="upload-btn flex align-center justify-center"
          @click="chooseImage"
        >
          <text class="plus">+</text>
        </view>
      </view>
    </view>

    <!-- 提交 -->
    <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
      {{ submitting ? "提交中..." : "提交评价" }}
    </button>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { addReview } from "@/api/mall/review";
import upload from "@/utils/upload";
import config from "@/config";

const baseUrl = config.baseUrl;
const { proxy } = getCurrentInstance();
const submitting = ref(false);
const imageList = ref([]);

const form = ref({
  orderId: null,
  productId: null,
  rating: 5,
  content: "",
  anonymous: 0,
  images: "",
});

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  form.value.orderId = Number(currentPage.options?.orderId);
  form.value.productId = Number(currentPage.options?.productId);
});

// 选择图片并上传
async function chooseImage() {
  uni.chooseImage({
    count: 5 - imageList.value.length,
    sizeType: ["compressed"],
    success: async (res) => {
      uni.showLoading({ title: "上传中..." });
      try {
        for (let path of res.tempFilePaths) {
          const uploadRes = await upload({
            url: "/common/upload",
            filePath: path,
          });
          let fileUrl =
            uploadRes?.data?.url ||
            uploadRes?.url ||
            uploadRes?.data?.fileName ||
            uploadRes?.fileName;
          if (fileUrl) {
            if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
              fileUrl = baseUrl + fileUrl;
            }
            imageList.value.push(fileUrl);
          }
        }
      } catch (e) {
        proxy.$modal.showToast("图片上传失败");
      } finally {
        uni.hideLoading();
      }
    },
  });
}

// 删除图片
function deleteImage(index) {
  imageList.value.splice(index, 1);
}

async function handleSubmit() {
  if (!form.value.content.trim()) {
    return proxy.$modal.showToast("请输入评价内容");
  }
  submitting.value = true;
  try {
    // 处理图片：逗号分隔
    form.value.images = imageList.value.join(",");
    const res = await addReview(form.value);
    if (res.code === 200) {
      proxy.$modal.showToast("评价成功");
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      proxy.$modal.showToast(res.msg || "评价失败");
    }
  } catch (e) {
    proxy.$modal.showToast(e.msg || "评价失败");
  }
  submitting.value = false;
}
</script>

<style lang="scss" scoped>
.review-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx 30rpx;
}

.review-header {
  text-align: center;
  padding: 30rpx 0;

  .title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  margin-bottom: 20rpx;

  .section-label {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    display: block;
    margin-bottom: 16rpx;
  }
}

.star-row {
  .star {
    font-size: 56rpx;
    color: #ddd;
    margin-right: 16rpx;

    &.active {
      color: #ffb400;
    }
  }
}

.review-textarea {
  width: 100%;
  height: 200rpx;
  font-size: 26rpx;
  color: #333;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 16rpx;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #ccc;
  margin-top: 8rpx;
}

.anonymous-section {
  .section-label {
    margin-bottom: 0;
  }
}

.submit-btn {
  margin-top: 40rpx;
  background: linear-gradient(135deg, #e53935, #ff7043);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.upload-list {
  gap: 20rpx;
}

.upload-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;

  .upload-img {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }

  .delete-btn {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 36rpx;
    height: 36rpx;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 50%;
    text-align: center;
    line-height: 32rpx;
    font-size: 28rpx;
  }
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  background: #f8f8f8;
  border: 1rpx dashed #ddd;
  border-radius: 12rpx;

  .plus {
    font-size: 60rpx;
    color: #999;
  }
}
</style>
