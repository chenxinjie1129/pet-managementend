<template>
  <div class="banner-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>轮播图管理</span>
          <el-button type="primary" @click="handleAdd">添加轮播图</el-button>
        </div>
      </template>

      <!-- 轮播图列表 -->
      <el-table
        v-loading="loading"
        :data="bannerList"
        border
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="序号"
          width="60"
          align="center"
        />
        <el-table-column
          prop="title"
          label="标题"
          min-width="120"
        />
        <el-table-column
          label="图片"
          width="180"
          align="center"
        >
          <template #default="scope">
            <el-image
              style="width: 160px; height: 80px"
              :src="scope.row.imageUrl"
              fit="cover"
              :preview-src-list="[scope.row.imageUrl]"
              @error="handleImageError"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><el-icon-picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><el-icon-loading /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkUrl"
          label="链接地址"
          min-width="180"
        />
        <el-table-column
          prop="sort"
          label="排序"
          width="80"
          align="center"
        />
        <el-table-column
          label="状态"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          width="180"
          align="center"
        >
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑轮播图对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="bannerFormRef"
        :model="bannerForm"
        :rules="bannerRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl">
          <el-upload
            class="banner-upload"
            action="#"
            :http-request="handleUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <img v-if="bannerForm.imageUrl" :src="bannerForm.imageUrl" class="upload-image" />
            <el-icon v-else class="upload-icon"><el-icon-plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：1200 x 400 像素，大小不超过 2MB</div>
        </el-form-item>
        <el-form-item label="链接地址" prop="linkUrl">
          <el-input v-model="bannerForm.linkUrl" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="bannerForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="bannerForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBannerList, addBanner, updateBanner, deleteBanner, updateBannerStatus, uploadImage } from '@/api/banner'

export default {
  name: 'BannerManagement',
  setup() {
    // 轮播图列表
    const bannerList = ref([])
    const loading = ref(false)

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加轮播图')
    const bannerFormRef = ref(null)
    const submitLoading = ref(false)

    // 表单数据
    const bannerForm = reactive({
      id: null,
      title: '',
      imageUrl: '',
      linkUrl: '',
      sort: 0,
      status: 1
    })

    // 表单验证规则
    const bannerRules = {
      title: [
        { required: true, message: '请输入轮播图标题', trigger: 'blur' },
        { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
      ],
      imageUrl: [
        { required: true, message: '请上传轮播图图片', trigger: 'change' }
      ],
      linkUrl: [
        { max: 255, message: '链接长度不能超过255个字符', trigger: 'blur' }
      ]
    }

    // 获取轮播图列表
    const fetchBannerList = async () => {
      loading.value = true
      try {
        const res = await getBannerList()
        bannerList.value = res.data
      } catch (error) {
        console.error('获取轮播图列表失败:', error)
        ElMessage.error('获取轮播图列表失败')
      } finally {
        loading.value = false
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }

    // 添加轮播图
    const handleAdd = () => {
      resetForm()
      dialogTitle.value = '添加轮播图'
      dialogVisible.value = true
    }

    // 编辑轮播图
    const handleEdit = (row) => {
      resetForm()
      dialogTitle.value = '编辑轮播图'
      Object.assign(bannerForm, row)
      dialogVisible.value = true
    }

    // 删除轮播图
    const handleDelete = (row) => {
      ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteBanner(row.id)
          ElMessage.success('删除成功')
          fetchBannerList()
        } catch (error) {
          console.error('删除轮播图失败:', error)
          ElMessage.error('删除轮播图失败')
        }
      }).catch(() => {})
    }

    // 更改轮播图状态
    const handleStatusChange = async (row) => {
      try {
        await updateBannerStatus(row.id, row.status)
        ElMessage.success('状态更新成功')
      } catch (error) {
        console.error('更新轮播图状态失败:', error)
        ElMessage.error('更新轮播图状态失败')
        // 恢复原状态
        row.status = row.status === 1 ? 0 : 1
      }
    }

    // 重置表单
    const resetForm = () => {
      bannerForm.id = null
      bannerForm.title = ''
      bannerForm.imageUrl = ''
      bannerForm.linkUrl = ''
      bannerForm.sort = 0
      bannerForm.status = 1
      if (bannerFormRef.value) {
        bannerFormRef.value.resetFields()
      }
    }

    // 上传前校验
    const beforeUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    }

    // 自定义上传
    const handleUpload = async (options) => {
      try {
        console.log('开始上传图片:', options.file.name)
        const res = await uploadImage(options.file)
        console.log('上传图片响应:', res)

        // 检查响应结构
        if (res.data && res.data.url) {
          // 获取原始URL
          const originalUrl = res.data.url
          console.log('原始图片URL:', originalUrl)

          // 转换为静态资源URL
          // 例如：将 http://localhost:8080/api/uploads/banner/2025/05/21/079d609899764182ad761a582ac39894.jpeg
          // 转换为 http://localhost:8080/static/image/banner/2025/05/21/079d609899764182ad761a582ac39894.jpeg
          let staticUrl = originalUrl

          // 检查是否是上传路径格式
          if (originalUrl.includes('/uploads/')) {
            // 提取路径部分
            const pathMatch = originalUrl.match(/\/uploads\/(.+)/)
            if (pathMatch && pathMatch[1]) {
              const pathParts = pathMatch[1].split('/')
              if (pathParts.length >= 4) {
                const [directory, year, month, day, ...rest] = pathParts
                const filename = rest.join('/')
                staticUrl = `${window.location.origin}/static/image/${directory}/${year}/${month}/${day}/${filename}`
              }
            }
          }

          console.log('转换后的静态资源URL:', staticUrl)

          // 使用原始URL，因为后端已经修改了配置
          bannerForm.imageUrl = originalUrl
          console.log('设置图片URL:', bannerForm.imageUrl)
          ElMessage.success('图片上传成功')

          // 测试图片URL是否可访问
          const img = new Image()
          img.onload = () => console.log('图片URL可以访问')
          img.onerror = (e) => {
            console.error('图片URL无法访问:', e)
            // 尝试使用静态资源URL
            console.log('尝试使用静态资源URL:', staticUrl)
            bannerForm.imageUrl = staticUrl
          }
          img.src = bannerForm.imageUrl
        } else {
          console.error('图片上传响应格式错误:', res)
          ElMessage.error('图片上传失败: 响应格式错误')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        // 显示详细错误信息
        if (error.response && error.response.data) {
          ElMessage.error(`图片上传失败: ${error.response.data.message || JSON.stringify(error.response.data)}`)
        } else {
          ElMessage.error(`图片上传失败: ${error.message || '未知错误'}`)
        }
      }
    }

    // 提交表单
    const submitForm = () => {
      bannerFormRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true
          try {
            if (bannerForm.id) {
              // 更新
              await updateBanner(bannerForm.id, bannerForm)
              ElMessage.success('更新成功')
            } else {
              // 新增
              await addBanner(bannerForm)
              ElMessage.success('添加成功')
            }
            dialogVisible.value = false
            fetchBannerList()
          } catch (error) {
            console.error('保存轮播图失败:', error)
            ElMessage.error('保存轮播图失败')
          } finally {
            submitLoading.value = false
          }
        }
      })
    }

    // 处理图片加载错误
    const handleImageError = (e) => {
      console.error('图片加载失败:', e)

      // 获取当前图片URL
      const originalUrl = e.target.src
      console.log('加载失败的图片URL:', originalUrl)

      // 尝试转换为静态资源URL
      if (originalUrl.includes('/uploads/')) {
        // 提取路径部分
        const pathMatch = originalUrl.match(/\/uploads\/(.+)/)
        if (pathMatch && pathMatch[1]) {
          const pathParts = pathMatch[1].split('/')
          if (pathParts.length >= 4) {
            const [directory, year, month, day, ...rest] = pathParts
            const filename = rest.join('/')
            const staticUrl = `${window.location.origin}/static/image/${directory}/${year}/${month}/${day}/${filename}`

            console.log('尝试使用静态资源URL:', staticUrl)

            // 设置新的URL
            e.target.src = staticUrl
          }
        }
      }
    }

    // 组件挂载时获取数据
    onMounted(() => {
      fetchBannerList()
    })

    return {
      bannerList,
      loading,
      dialogVisible,
      dialogTitle,
      bannerForm,
      bannerRules,
      bannerFormRef,
      submitLoading,
      formatDate,
      handleAdd,
      handleEdit,
      handleDelete,
      handleStatusChange,
      beforeUpload,
      handleUpload,
      submitForm,
      handleImageError
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-upload {
  display: flex;
  flex-direction: column;
}

.upload-image {
  width: 300px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 300px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}
</style>
