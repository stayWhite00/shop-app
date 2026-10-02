<template>
  <view class="member-container">
    <!-- 会员卡头部 -->
    <view class="member-header" :class="{ 'is-member': memberData.isMember }">
      <view class="member-card">
        <view class="card-top flex justify-between align-center">
          <view>
            <text class="level-name">{{
              memberData.levelName || "普通用户"
            }}</text>
            <text class="member-badge" v-if="memberData.isMember">VIP</text>
          </view>
          <text class="growth-text"
            >成长值: {{ memberData.member?.growthValue || 0 }}</text
          >
        </view>

        <!-- 等级进度条 -->
        <view
          class="progress-section"
          v-if="memberData.isMember && memberData.nextLevelName"
        >
          <view class="progress-info flex justify-between">
            <text class="cur-level">{{ memberData.levelName }}</text>
            <text class="next-level">{{ memberData.nextLevelName }}</text>
          </view>
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: progressPercent + '%' }"
            ></view>
          </view>
          <text class="progress-tip">
            还需{{
              memberData.nextLevelGrowth - memberData.growthProgress
            }}成长值升级
          </text>
        </view>

        <!-- 消费统计 -->
        <view class="stats-row flex" v-if="memberData.member">
          <view class="stat-item">
            <text class="stat-value"
              >¥{{ memberData.member.totalSpent || "0.00" }}</text
            >
            <text class="stat-label">累计消费</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{
              memberData.isMember ? "10x" : "1x"
            }}</text>
            <text class="stat-label">成长倍率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ memberData.member.points || 0 }}</text>
            <text class="stat-label">积分余额</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">Lv{{ memberData.member.level || 0 }}</text>
            <text class="stat-label">当前等级</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 未开通时的申请入口 -->
    <view class="apply-section card-box" v-if="!memberData.isMember">
      <view class="apply-title">🎉 免费开通会员</view>
      <view class="apply-desc"
        >开通后消费成长倍率提升至10倍，享受会员专属优惠券</view
      >
      <view class="apply-form">
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input
            v-model="applyForm.realName"
            placeholder="请输入真实姓名"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="form-label">性别</text>
          <view class="gender-group flex">
            <view
              class="gender-btn"
              :class="{ active: applyForm.gender === 1 }"
              @click="applyForm.gender = 1"
              >男</view
            >
            <view
              class="gender-btn"
              :class="{ active: applyForm.gender === 2 }"
              @click="applyForm.gender = 2"
              >女</view
            >
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">生日</text>
          <picker mode="date" @change="onBirthdayChange">
            <view class="form-input picker-text">{{
              applyForm.birthday || "请选择生日"
            }}</view>
          </picker>
        </view>
      </view>
      <button class="apply-btn" @click="handleApply">立即开通</button>
    </view>

    <!-- 等级规则 -->
    <view class="rules-section card-box">
      <view class="section-title">📊 等级规则</view>
      <view class="rules-list">
        <view
          class="rule-item flex justify-between"
          v-for="item in levelRules"
          :key="item.level"
        >
          <view class="rule-left flex align-center">
            <view class="level-badge" :class="'lv' + item.level"
              >Lv{{ item.level }}</view
            >
            <text class="rule-name">{{ item.name }}</text>
          </view>
          <text class="rule-growth">{{
            item.level === 0 ? "未开通会员" : "≥" + item.minGrowth + "成长值"
          }}</text>
        </view>
      </view>
      <view class="rate-tip">
        💡 非会员每消费1元获得<text class="highlight">1</text
        >成长值，会员每消费1元获得<text class="highlight">10</text>成长值
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { getMemberInfo, applyMember, getLevelRules } from "@/api/mall/member";

const { proxy } = getCurrentInstance();

const memberData = ref({ isMember: false, levelName: "普通用户" });
const levelRules = ref([]);
const applyForm = ref({ realName: "", gender: 0, birthday: "" });

const progressPercent = computed(() => {
  if (!memberData.value.nextLevelGrowth) return 0;
  return Math.min(
    100,
    Math.round(
      (memberData.value.growthProgress / memberData.value.nextLevelGrowth) *
        100,
    ),
  );
});

function onBirthdayChange(e) {
  applyForm.value.birthday = e.detail.value;
}

async function loadMemberInfo() {
  try {
    const res = await getMemberInfo();
    if (res.code === 200 && res.data) {
      memberData.value = res.data;
    }
  } catch (e) {
    console.error("获取会员信息失败", e);
  }
}

async function loadLevelRules() {
  try {
    const res = await getLevelRules();
    if (res.code === 200 && res.data) {
      levelRules.value = res.data.levels || [];
    }
  } catch (e) {}
}

async function handleApply() {
  if (!applyForm.value.realName.trim()) {
    return proxy.$modal.showToast("请输入真实姓名");
  }
  try {
    const res = await applyMember(applyForm.value);
    if (res.code === 200) {
      proxy.$modal.showToast("会员开通成功！");
      loadMemberInfo();
    } else {
      proxy.$modal.showToast(res.msg || "开通失败");
    }
  } catch (e) {
    proxy.$modal.showToast(e.msg || "开通失败");
  }
}

onMounted(() => {
  loadMemberInfo();
  loadLevelRules();
});
</script>

<style lang="scss" scoped>
.member-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.member-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 60rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;

  &.is-member {
    background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
  }
}

.member-card {
  color: #fff;

  .card-top {
    margin-bottom: 30rpx;

    .level-name {
      font-size: 38rpx;
      font-weight: bold;
    }

    .member-badge {
      background: rgba(255, 255, 255, 0.3);
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      margin-left: 12rpx;
    }

    .growth-text {
      font-size: 24rpx;
      opacity: 0.9;
    }
  }
}

.progress-section {
  margin-bottom: 30rpx;

  .progress-info {
    font-size: 22rpx;
    opacity: 0.9;
    margin-bottom: 10rpx;
  }

  .progress-bar {
    height: 12rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 6rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: #fff;
      border-radius: 6rpx;
      transition: width 0.5s;
    }
  }

  .progress-tip {
    font-size: 22rpx;
    opacity: 0.8;
    margin-top: 8rpx;
  }
}

.stats-row {
  justify-content: space-around;
  margin-top: 10rpx;

  .stat-item {
    text-align: center;

    .stat-value {
      font-size: 32rpx;
      font-weight: bold;
      display: block;
    }

    .stat-label {
      font-size: 22rpx;
      opacity: 0.8;
      margin-top: 6rpx;
    }
  }
}

.card-box {
  margin: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  &:first-of-type {
    margin-top: -30rpx;
  }
}

.apply-section {
  .apply-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }

  .apply-desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 30rpx;
  }
}

.apply-form {
  .form-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    .form-label {
      width: 150rpx;
      font-size: 28rpx;
      color: #333;
    }

    .form-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .picker-text {
      color: #999;
    }
  }

  .gender-group {
    gap: 20rpx;

    .gender-btn {
      padding: 8rpx 40rpx;
      border-radius: 30rpx;
      border: 1rpx solid #ddd;
      font-size: 26rpx;
      color: #666;

      &.active {
        background: #f5af19;
        color: #fff;
        border-color: #f5af19;
      }
    }
  }
}

.apply-btn {
  margin-top: 30rpx;
  background: linear-gradient(135deg, #f5af19, #f12711);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.rules-list {
  .rule-item {
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f9f9f9;

    &:last-child {
      border-bottom: none;
    }

    .level-badge {
      width: 60rpx;
      height: 40rpx;
      border-radius: 8rpx;
      text-align: center;
      line-height: 40rpx;
      font-size: 22rpx;
      color: #fff;
      margin-right: 16rpx;

      &.lv0 {
        background: #bbb;
      }
      &.lv1 {
        background: #67c23a;
      }
      &.lv2 {
        background: #909399;
      }
      &.lv3 {
        background: #e6a23c;
      }
      &.lv4 {
        background: #409eff;
      }
      &.lv5 {
        background: #f56c6c;
      }
    }

    .rule-name {
      font-size: 26rpx;
      color: #333;
    }

    .rule-growth {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.rate-tip {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
  background: #fffbe6;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;

  .highlight {
    color: #f5af19;
    font-weight: bold;
  }
}
</style>
