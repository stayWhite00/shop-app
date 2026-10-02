<template>
  <view class="address-edit">
    <view class="form-section">
      <view class="form-item">
        <text class="label">收货人</text>
        <input
          v-model="formData.consignee"
          placeholder="请输入收货人姓名"
          class="input"
        />
      </view>

      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="formData.phone"
          type="number"
          placeholder="请输入手机号"
          class="input"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <text class="label">所在地区</text>
        <uni-data-picker
          :localdata="cityData"
          popup-title="请选择所在地区"
          :map="{ text: 'name', value: 'id' }"
          :value="regionValueString"
          @change="onDataPickerChange"
          class="data-picker-custom"
        >
          <view class="region-value">
            <text v-if="regionText" class="value-text">{{ regionText }}</text>
            <text v-else class="placeholder">请选择省市区</text>
            <uni-icons type="forward" size="16" color="#999"></uni-icons>
          </view>
        </uni-data-picker>
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          v-model="formData.detail"
          placeholder="请输入详细地址(街道、楼牌号等)"
          class="textarea"
          maxlength="200"
        ></textarea>
      </view>

      <view class="form-item">
        <text class="label">设为默认地址</text>
        <switch
          :checked="formData.isDefault === 1"
          @change="onDefaultChange"
          color="#E53935"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-button">
      <button class="save-btn" @click="saveAddress">保存</button>
    </view>
  </view>
</template>

<script>
import { addAddress, updateAddress, getAddressList } from "@/api/mall/user";
import { getRegionTree } from "@/api/system/region";

export default {
  data() {
    return {
      addressId: 0,
      formData: {
        consignee: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        detail: "",
        isDefault: 0,
      },
      regionValue: [],
      regionValueString: "",
      cityData: [],
    };
  },
  computed: {
    regionText() {
      if (
        this.formData.province &&
        this.formData.city &&
        this.formData.district
      ) {
        return `${this.formData.province} ${this.formData.city} ${this.formData.district}`;
      }
      return "";
    },
  },
  onLoad(options) {
    this.loadRegionData();
    if (options.id) {
      this.addressId = options.id;
      this.loadAddressDetail();
    }
  },
  methods: {
    // 加载地区树数据
    async loadRegionData() {
      try {
        const res = await getRegionTree();
        this.cityData = res.data;
      } catch (error) {
        console.error("加载地区数据失败:", error);
      }
    },

    // 加载地址详情
    async loadAddressDetail() {
      try {
        const res = await getAddressList();
        const address = res.data.find(
          (item) => item.addressId == this.addressId,
        );
        if (address) {
          this.formData = { ...address };
          this.regionValue = [address.province, address.city, address.district];
          this.regionValueString = `${address.province}-${address.city}-${address.district}`;
        }
      } catch (error) {
        console.error("加载地址失败:", error);
      }
    },

    // 地区选择改变
    onDataPickerChange(e) {
      if (!e.detail.value.length) return;
      const regionNames = e.detail.value.map((item) => item.text);
      this.formData.province = regionNames[0] || "";
      this.formData.city = regionNames[1] || "";
      this.formData.district = regionNames[2] || "";
      this.regionValue = regionNames;
      this.regionValueString = e.detail.value[e.detail.value.length - 1].value;
    },

    // 默认地址切换
    onDefaultChange(e) {
      this.formData.isDefault = e.detail.value ? 1 : 0;
    },

    // 保存地址
    async saveAddress() {
      // 表单验证
      if (!this.formData.consignee) {
        uni.showToast({
          title: "请输入收货人",
          icon: "none",
        });
        return;
      }

      if (!this.formData.phone || !/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        uni.showToast({
          title: "请输入正确的手机号",
          icon: "none",
        });
        return;
      }

      if (
        !this.formData.province ||
        !this.formData.city ||
        !this.formData.district
      ) {
        uni.showToast({
          title: "请选择所在地区",
          icon: "none",
        });
        return;
      }

      if (!this.formData.detail) {
        uni.showToast({
          title: "请输入详细地址",
          icon: "none",
        });
        return;
      }

      try {
        if (this.addressId) {
          await updateAddress(this.formData);
        } else {
          await addAddress(this.formData);
        }

        uni.showToast({
          title: "保存成功",
          icon: "success",
        });

        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        uni.showToast({
          title: "保存失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.address-edit {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: $uni-bg-color-grey;
}

.form-section {
  background-color: #fff;

  .form-item {
    padding: 32rpx;
    border-bottom: 1rpx solid $uni-border-color;
    display: flex;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 160rpx;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .input,
    .textarea {
      flex: 1;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .textarea {
      min-height: 120rpx;
    }

    .region-value {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .value-text {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
      }

      .placeholder {
        font-size: $uni-font-size-base;
        color: $uni-text-color-placeholder;
      }
    }
  }
}

.save-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-top: 1rpx solid $uni-border-color;

  .save-btn {
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
