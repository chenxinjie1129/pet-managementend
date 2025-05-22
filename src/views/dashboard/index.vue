<template>
  <div class="dashboard-container">
    <!-- 侧边栏菜单 -->
    <el-aside width="200px">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><el-icon-menu /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><el-icon-user /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><el-icon-shopping-cart /></el-icon>
          <span>商品管理</span>
        </el-menu-item>

        <el-sub-menu index="/content">
          <template #title>
            <el-icon><el-icon-picture /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/content/banner">
            <el-icon><el-icon-picture-filled /></el-icon>
            <span>轮播图管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/store">
          <el-icon><el-icon-location /></el-icon>
          <span>门店管理</span>
        </el-menu-item>
        <el-menu-item index="/setting">
          <el-icon><el-icon-setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <div class="main-container">
      <el-header>
        <div class="header-container">
          <div class="title">萌宠之家管理后台</div>
          <div class="user-info">
            <span>{{ userInfo.name || '管理员' }}</span>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <el-avatar :size="32" :src="userInfo.avatar || ''">{{ userInfo.name ? userInfo.name.charAt(0) : 'A' }}</el-avatar>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <!-- 路由视图 -->
        <router-view v-if="$route.path !== '/dashboard'" />

        <!-- 仪表盘内容 -->
        <el-card v-if="$route.path === '/dashboard'">
          <template #header>
            <div class="card-header">
              <span>欢迎使用萌宠之家管理后台</span>
            </div>
          </template>
          <div class="dashboard-content">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                  <h2>用户总数</h2>
                  <div class="data-value">1,234</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                  <h2>商品总数</h2>
                  <div class="data-value">567</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                  <h2>订单总数</h2>
                  <div class="data-value">890</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="data-card">
                  <h2>今日访问</h2>
                  <div class="data-value">123</div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-main>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getUserInfo } from '@/api/auth'

export default {
  name: 'AdminDashboard',
  setup() {
    const store = useStore()
    const router = useRouter()

    // 获取用户信息
    const userInfo = computed(() => store.getters.userInfo)

    // 获取当前激活的菜单
    const activeMenu = computed(() => {
      return router.currentRoute.value.path
    })

    // 在组件挂载时获取最新的用户信息
    onMounted(async () => {
      try {
        if (userInfo.value && userInfo.value.id) {
          const response = await getUserInfo(userInfo.value.id)
          if (response.data.code === 200) {
            // 更新用户信息
            store.commit('SET_USER_INFO', response.data.data)
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      }
    })

    // 处理下拉菜单命令
    const handleCommand = (command) => {
      if (command === 'logout') {
        ElMessageBox.confirm('确定要退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('logout')
          router.push('/login')
        }).catch(() => {})
      } else if (command === 'profile') {
        // 跳转到个人信息页面
        // router.push('/profile')
      }
    }

    return {
      userInfo,
      activeMenu,
      handleCommand
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

/* 主内容区域样式 */
.main-container {
  flex: 1;
  margin-left: 200px; /* 与侧边栏宽度相同 */
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.3s;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
  height: 100vh; /* 占满整个视口高度 */
  position: fixed; /* 固定位置 */
  left: 0;
  top: 0;
  z-index: 10;
  transition: width 0.3s;
}

.el-menu {
  border-right: none;
  height: 100%; /* 菜单占满整个侧边栏 */
  transition: width 0.3s;
}

.el-menu-item {
  transition: all 0.3s;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  margin-right: 10px;
}

.dashboard-content {
  margin-top: 20px;
}

.data-card {
  text-align: center;
  color: #666;
}

.data-card h2 {
  font-size: 16px;
  margin-bottom: 10px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .el-row .el-col-6 {
    width: 50%;
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 768px) {
  .el-aside {
    width: 64px !important;
  }

  .el-menu {
    width: 64px;
  }

  .el-menu-item span {
    display: none;
  }

  .main-container {
    margin-left: 64px;
  }

  .el-row .el-col-6 {
    width: 100%;
  }
}
</style>
