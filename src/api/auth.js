import request from '@/utils/request'

// 登录API
export const login = (username, password) => {
  return request({
    url: '/admin/login',
    method: 'post',
    params: {
      username,
      password
    }
  })
}

// 获取当前用户信息
export const getUserInfo = (userId) => {
  return request({
    url: '/admin/info',
    method: 'get',
    params: {
      userId
    }
  })
}

// 登出
export const logout = () => {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}
