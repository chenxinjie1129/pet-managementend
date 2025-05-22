<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="title">萌宠之家管理后台</div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const store = useStore()
    const loginFormRef = ref(null)
    const loading = ref(false)

    // 表单数据
    const loginForm = reactive({
      username: '',
      password: ''
    })

    // 表单验证规则
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }

    // 登录方法
    const handleLogin = () => {
      loginFormRef.value.validate(async valid => {
        if (valid) {
          loading.value = true
          try {
            console.log('登录请求参数:', loginForm.username, loginForm.password);
            const response = await login(loginForm.username, loginForm.password);
            console.log('登录响应:', response);

            // 使用request.js后，响应已经被处理，直接使用response
            const { token, userId, username, nickname, avatar } = response.data

            // 构建用户信息对象
            const userInfo = {
              id: userId,
              username,
              nickname,
              avatar
            }

            // 存储token和用户信息
            store.dispatch('login', { token, userInfo })

            ElMessage({
              message: '登录成功',
              type: 'success'
            })

            // 跳转到首页
            router.push('/dashboard')
          } catch (error) {
            console.error('登录失败:', error)
            if (error.response && error.response.data) {
              ElMessage.error(error.response.data.message || '登录失败，请重试')
            } else {
              ElMessage.error(error.message || '登录失败，请重试')
            }
          } finally {
            loading.value = false
          }
        } else {
          return false
        }
      })
    }

    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #409eff;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}
</style>
