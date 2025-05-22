import request from '@/utils/request'

// 获取轮播图列表
export const getBannerList = () => {
  return request({
    url: '/banner/list',
    method: 'get'
  })
}

// 获取轮播图详情
export const getBannerDetail = (id) => {
  return request({
    url: `/banner/${id}`,
    method: 'get'
  })
}

// 添加轮播图
export const addBanner = (data) => {
  return request({
    url: '/banner',
    method: 'post',
    data
  })
}

// 更新轮播图
export const updateBanner = (id, data) => {
  return request({
    url: `/banner/${id}`,
    method: 'put',
    data
  })
}

// 删除轮播图
export const deleteBanner = (id) => {
  return request({
    url: `/banner/${id}`,
    method: 'delete'
  })
}

// 批量删除轮播图
export const batchDeleteBanner = (ids) => {
  return request({
    url: '/banner/batch',
    method: 'delete',
    data: ids
  })
}

// 更新轮播图状态
export const updateBannerStatus = (id, status) => {
  return request({
    url: `/banner/${id}/status/${status}`,
    method: 'put'
  })
}

// 上传图片
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', 'banner')

  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    // 添加错误处理
    validateStatus: function () {
      // 允许所有状态码，在业务代码中处理错误
      return true
    }
  })
}
