<template>
  <div class="social-signup-container">
    <div class="sign-btn" @click="weChatHandleClick('wechat')">
      <span class="wx-svg-container"><svg-icon icon-class="wechat" class="icon"/></span> 微信
    </div>
    <!--@click="tencentHandleClick('qq')"-->
    <div class="sign-btn" @click="tenCentHandleClick('qq')">
      <!--<a href="/api/auth/qq">-->
      <span class="qq-svg-container">
        <svg-icon icon-class="qq" class="icon"/>
      </span> QQ
      <!--</a>-->
    </div>
  </div>
</template>

<script>
// import openWindow from '@/utils/openWindow'
import { substringBetween } from '@/utils/auth'
export default {
  name: 'SocialSignin',
  data() {
    return {
      qqClientId: '101534681',
      qqClientSecret: '68f0c763d514df2deb47820d1258e54f',
      redirectUri: 'http://www.youchedongli.cn/auth/',
      test: 'callback( {"client_id":"101534681","openid":"5858203A07CED9E105033101E87FB362"} );'
    }
  },
  methods: {
    weChatHandleClick(thirdpart) {
      const result = substringBetween(this.test, '"openid":"', '"}')
      console.log(result)
      // this.$store.commit('SET_AUTH_TYPE', thirdpart)
      // const appid = 'xxxxx'
      // const redirect_uri = encodeURIComponent('xxx/redirect?redirect=' + window.location.origin + '/auth-redirect')
      // const url = 'https://open.weixin.qq.com/connect/qrconnect?appid=' + appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_login#wechat_redirect'
      // openWindow(url, thirdpart, 540, 540)
    },
    tenCentHandleClick(thirdPart) {
      const redirect_uri = encodeURIComponent(this.redirectUri + thirdPart)
      const url = 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=' + this.qqClientId + '&redirect_uri=' + redirect_uri
      window.location.href = url
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .social-signup-container {
    margin: 20px 0;
    .sign-btn {
      display: inline-block;
      cursor: pointer;
    }
    .icon {
      color: #fff;
      font-size: 24px;
      margin-top: 8px;
    }
    .wx-svg-container,
    .qq-svg-container {
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      padding-top: 1px;
      border-radius: 4px;
      margin-bottom: 20px;
      margin-right: 5px;
    }
    .wx-svg-container {
      background-color: #24da70;
    }
    .qq-svg-container {
      background-color: #6BA2D6;
      margin-left: 50px;
    }
  }
</style>
