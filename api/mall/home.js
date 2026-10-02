import request from '@/utils/request'

// 获取首页轮播图
export function getHomeBanner() {
  return request({
    url: '/api/home/banner',
    method: 'get'
  })
}
