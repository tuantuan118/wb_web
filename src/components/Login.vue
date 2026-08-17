<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">账号</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="请输入账号"
            required
          />
        </div>
        <div class="input-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="remember-me">
          <input type="checkbox" id="remember" v-model="remember" />
          <label for="remember">记住我</label>
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="register-link">
          还没有账号？<a href="#" @click.prevent="showRegisterModal = true">立即注册</a>
        </div>
      </form>
    </div>

    <div class="modal-overlay" v-if="showRegisterModal" @click="closeModal">
      <div class="register-modal" @click.stop>
        <div class="modal-header">
          <h3>用户注册</h3>
          <button class="close-btn" @click="showRegisterModal = false">×</button>
        </div>
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <label for="reg-username">账号</label>
            <input
              type="text"
              id="reg-username"
              v-model="regUsername"
              placeholder="请输入账号"
              required
            />
          </div>
          <div class="input-group">
            <label for="reg-nickname">昵称</label>
            <input
              type="text"
              id="reg-nickname"
              v-model="regNickname"
              placeholder="请输入昵称（可选）"
            />
          </div>
          <div class="input-group">
            <label for="reg-password">密码</label>
            <input
              type="password"
              id="reg-password"
              v-model="regPassword"
              placeholder="请输入密码"
              required
            />
          </div>
          <div class="input-group">
            <label for="confirm-password">确认密码</label>
            <input
              type="password"
              id="confirm-password"
              v-model="confirmPassword"
              placeholder="请再次输入密码"
              required
            />
          </div>
          <div class="error-message" v-if="regErrorMsg">{{ regErrorMsg }}</div>
          <button type="submit" class="register-btn" :disabled="regLoading">
            {{ regLoading ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { login, register } from '@/api/user'
import { getUser } from '@/api/friend'
import { setToken, setUserInfo } from '@/api/request'

export default {
  name: 'LoginForm',
  data() {
    return {
      username: '',
      password: '',
      remember: false,
      errorMsg: '',
      loading: false,
      showRegisterModal: false,
      regUsername: '',
      regNickname: '',
      regPassword: '',
      confirmPassword: '',
      regErrorMsg: '',
      regLoading: false
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        this.errorMsg = '请输入账号和密码'
        return
      }

      this.errorMsg = ''
      this.loading = true
      try {
        const res = await login({
          account: this.username,
          password: this.password
        })
        setToken(res.token, this.remember)
        let userName = this.username
        try {
          const profile = await getUser({ id: res.userId })
          if (profile?.data?.userName) {
            userName = profile.data.userName
          }
        } catch {
          // 昵称拉取失败时沿用账号
        }
        setUserInfo(
          {
            userId: res.userId,
            account: this.username,
            userName
          },
          this.remember
        )
        this.$router.push('/message-board')
      } catch (err) {
        this.errorMsg = err.message || '登录失败'
      } finally {
        this.loading = false
      }
    },
    closeModal(e) {
      if (e.target.classList.contains('modal-overlay')) {
        this.showRegisterModal = false
      }
    },
    async handleRegister() {
      if (this.regPassword !== this.confirmPassword) {
        this.regErrorMsg = '两次输入的密码不一致'
        return
      }

      this.regErrorMsg = ''
      this.regLoading = true
      try {
        await register({
          account: this.regUsername,
          userName: this.regNickname || this.regUsername,
          password: this.regPassword
        })
        alert('注册成功！请使用新账号登录')
        this.showRegisterModal = false
        this.username = this.regUsername
        this.regUsername = ''
        this.regNickname = ''
        this.regPassword = ''
        this.confirmPassword = ''
      } catch (err) {
        this.regErrorMsg = err.message || '注册失败'
      } finally {
        this.regLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

.login-box {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 30px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me input {
  margin-right: 8px;
}

.login-btn, .register-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover, .register-btn:hover {
  background-color: #0056b3;
}

.login-btn:disabled, .register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #333;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.register-modal {
  background: white;
  border-radius: 10px;
  padding: 25px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}
</style>
