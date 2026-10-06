<template>
  <view class="after-sale-apply">
    <view class="form-section">
      <!-- 售后类型 -->
      <view class="form-item">
        <text class="label">售后类型</text>
        <radio-group @change="onTypeChange">
          <label class="radio-item">
            <radio value="1" :checked="formData.type === 1" color="#E53935" />
            <text>仅退款</text>
          </label>
          <label class="radio-item">
            <radio value="2" :checked="formData.type === 2" color="#E53935" />
            <text>退货退款</text>
          </label>
        </radio-group>
      </view>

      <!-- 退款金额 -->
      <view class="form-item">
        <text class="label">退款金额</text>
        <input
          v-model="formData.refundAmount"
          type="digit"
          placeholder="请输入退款金额"
          class="input"
        />
        <text class="hint" v-if="maxRefundAmount > 0"
          >最高可退款：¥{{ maxRefundAmount }}</text
        >
      </view>

      <!-- 售后原因 -->
      <view class="form-item">
        <text class="label">售后原因</text>
        <textarea
          v-model="formData.reason"
          placeholder="请详细描述售后原因"
          class="textarea"
          maxlength="200"
        ></textarea>
      </view>

      <!-- 上传凭证 -->
      <view class="form-item upload-item">
        <text class="label">上传凭证</text>
        <view class="upload-list">
          <view
            v-for="(image, index) in imageList"
            :key="index"
            class="upload-image"
          >
            <image :src="image" mode="aspectFill" class="image"></image>
            <view class="delete-btn" @click="deleteImage(index)">
              <uni-icons type="close" size="16" color="#fff"></uni-icons>
            </view>
          </view>
          <view
            v-if="imageList.length < 3"
            class="upload-btn"
            @click="chooseImage"
          >
            <uni-icons type="camera" size="32" color="#999"></uni-icons>
            <text class="upload-text">上传图片</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-button">
      <button class="submit-btn" @click="submitApply">提交申请</button>
    </view>
  </view>
</template>

<script>
import { applyAfterSale } from "@/api/mall/afterSale";
import upload from "@/utils/upload";
import config from "@/config";

const baseUrl = config.baseUrl;

export default {
  data() {
    return {
      orderId: 0,
      maxRefundAmount: 0,
      formData: {
        type: 1,
        reason: "",
        refundAmount: "",
        images: [],
      },
      imageList: [],
    };
  },
  onLoad(options) {
    this.orderId = options.orderId;
    this.loadOrderDetail();
  },
  methods: {
    // 加载订单信息以获取最大退款金额
    async loadOrderDetail() {
      try {
        const { getOrderDetail } = await import("@/api/mall/order");
        const res = await getOrderDetail(this.orderId);
        if (res.code === 200 && res.data) {
          this.formData.refundAmount = res.data.totalAmount;
          this.maxRefundAmount = res.data.totalAmount;
        }
      } catch (error) {
        uni.showToast({ title: "加载订单信息失败", icon: "none" });
      }
    },
    // 售后类型改变
    onTypeChange(e) {
      this.formData.type = parseInt(e.detail.value);
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.imageList.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
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
                this.imageList.push(fileUrl);
              }
            }
          } catch (e) {
            uni.showToast({ title: "图片上传失败", icon: "none" });
          } finally {
            uni.hideLoading();
          }
        },
      });
    },

    // 删除图片
    deleteImage(index) {
      this.imageList.splice(index, 1);
    },

    // 提交申请
    async submitApply() {
      // 表单验证
      if (!this.formData.refundAmount) {
        uni.showToast({
          title: "请输入退款金额",
          icon: "none",
        });
        return;
      }

      if (!this.formData.reason) {
        uni.showToast({
          title: "请填写售后原因",
          icon: "none",
        });
        return;
      }

      try {
        const data = {
          orderId: this.orderId,
          type: this.formData.type,
          reason: this.formData.reason,
          refundAmount: parseFloat(this.formData.refundAmount),
          images: JSON.stringify(this.imageList),
        };

        await applyAfterSale(data);

        uni.showToast({
          title: "申请成功",
          icon: "success",
        });

        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        uni.showToast({
          title: "申请失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.after-sale-apply {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: $uni-bg-color-grey;
}

.form-section {
  background-color: #fff;

  .form-item {
    padding: 32rpx;
    border-bottom: 1rpx solid $uni-border-color;

    &:last-child {
      border-bottom: none;
    }

    .label {
      display: block;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      margin-bottom: 16rpx;
    }

    .radio-item {
      display: inline-flex;
      align-items: center;
      margin-right: 48rpx;
      margin-bottom: 16rpx;

      text {
        margin-left: 8rpx;
        font-size: $uni-font-size-base;
        color: $uni-text-color;
      }
    }

    .input,
    .textarea {
      width: 100%;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .hint {
      font-size: $uni-font-size-sm;
      color: $uni-color-error;
      margin-top: 10rpx;
    }

    .textarea {
      min-height: 160rpx;
      padding: 16rpx;
      background-color: $uni-bg-color-grey;
      border-radius: $uni-border-radius-base;
    }

    &.upload-item {
      display: block;
    }
  }
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .upload-image,
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    border-radius: $uni-border-radius-base;
    position: relative;
  }

  .upload-image {
    .image {
      width: 100%;
      height: 100%;
      border-radius: $uni-border-radius-base;
    }

    .delete-btn {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      width: 48rpx;
      height: 48rpx;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .upload-btn {
    background-color: $uni-bg-color-grey;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .upload-text {
      margin-top: 8rpx;
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
    }
  }
}

.submit-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-top: 1rpx solid $uni-border-color;

  .submit-btn {
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
