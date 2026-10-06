<template>
  <view class="normal-login-container">
    <view class="logo-content align-center justify-center flex">
      <image style="width: 100rpx;height: 100rpx;" :src="globalConfig.appInfo.logo" mode="widthFix">
      </image>
      <text class="title">私域商城移动端注册</text>
    </view>
    <view class="login-form-content">
      <view class="input-item flex align-center">
        <view class="iconfont icon-user icon"></view>
        <input v-model="registerForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input v-model="registerForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input v-model="registerForm.confirmPassword" type="password" class="input" placeholder="请输入重复密码" maxlength="20" />
      </view>
      <view class="action-btn">
        <button @click="handleRegister()" class="register-btn cu-btn block bg-blue lg round">注册</button>
      </view>
    </view>
    <view class="xieyi text-center">
      <text @click="handleUserLogin" class="text-blue">使用已有账号登录</text>
    </view>
  </view>
</template>

<script setup>
  import { register } from '@/api/login'
  import { ref, getCurrentInstance } from "vue"
  import { useConfigStore } from '@/store'

  const { proxy } = getCurrentInstance()
  const globalConfig = useConfigStore().config

  const registerForm = ref({
    username: "",
    password: "",
    confirmPassword: ""
  })

  // 用户登录
  function handleUserLogin() {
    proxy.$tab.navigateTo(`/pages/login`)
  }

  // 注册方法
  async function handleRegister() {
    if (registerForm.value.username === "") {
      proxy.$modal.msgError("请输入您的账号")
    } else if (registerForm.value.password === "") {
      proxy.$modal.msgError("请输入您的密码")
    } else if (registerForm.value.confirmPassword === "") {
      proxy.$modal.msgError("请再次输入您的密码")
    } else if (registerForm.value.password !== registerForm.value.confirmPassword) {
      proxy.$modal.msgError("两次输入的密码不一致")
    } else {
      proxy.$modal.loading("注册中，请耐心等待...")
      userRegister()
    }
  }

  // 用户注册
  async function userRegister() {
    register(registerForm.value).then(res => {
      proxy.$modal.closeLoading()
      uni.showModal({
        title: "系统提示",
        content: "恭喜你，您的账号 " + registerForm.value.username + " 注册成功！",
        success: function (res) {
          if (res.confirm) {
            uni.redirectTo({ url: `/pages/login` })
          }
        }
      })
    })
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #ffffff;
  }

  .normal-login-container {
    width: 100%;

    .logo-content {
      width: 100%;
      font-size: 21px;
      text-align: center;
      padding-top: 15%;

      image {
        border-radius: 4px;
      }

      .title {
        margin-left: 10px;
      }
    }

    .login-form-content {
      text-align: center;
      margin: 20px auto;
      margin-top: 15%;
      width: 80%;

      .input-item {
        margin: 20px auto;
        background-color: #f5f6f7;
        height: 45px;
        border-radius: 20px;

        .icon {
          font-size: 38rpx;
          margin-left: 10px;
          color: #999;
        }

        .input {
          width: 100%;
          font-size: 14px;
          line-height: 20px;
          text-align: left;
          padding-left: 15px;
        }

      }

      .register-btn {
        margin-top: 40px;
        height: 45px;
      }

      .xieyi {
        color: #333;
        margin-top: 20px;
      }
      
      .login-code {
        height: 38px;
        float: right;
      
        .login-code-img {
          height: 38px;
          position: absolute;
          margin-left: 10px;
          width: 200rpx;
        }
      }
    }
  }
</style>
