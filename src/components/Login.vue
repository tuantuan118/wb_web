<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="请输入用户名"
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
        <button type="submit" class="login-btn">登录</button>
        <div class="register-link">
          还没有账号？<a href="#" @click.prevent="showRegisterModal = true">立即注册</a>
        </div>
      </form>
    </div>

    <!-- 注册弹窗 -->
    <div class="modal-overlay" v-if="showRegisterModal" @click="closeModal">
      <div class="register-modal" @click.stop>
        <div class="modal-header">
          <h3>用户注册</h3>
          <button class="close-btn" @click="showRegisterModal = false">×</button>
        </div>
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <label for="reg-username">用户名</label>
            <input 
              type="text" 
              id="reg-username" 
              v-model="regUsername" 
              placeholder="请输入用户名"
              required
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
          <button type="submit" class="register-btn">注册</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      username: '',
      password: '',
      remember: false,
      errorMsg: '',
      showRegisterModal: false,
      regUsername: '',
      regPassword: '',
      confirmPassword: '',
      regErrorMsg: ''
    };
  },
  methods: {
    handleLogin() {
      // 这里添加登录逻辑
      if (!this.username || !this.password) {
        this.errorMsg = '请输入用户名和密码';
        return;
      }
      
      // 模拟登录请求
      // 实际应用中，这里应该调用API进行身份验证
      console.log('登录信息:', {
        username: this.username,
        password: this.password,
        remember: this.remember
      });
      
      // 模拟登录成功，跳转到留言板页面
      this.$router.push('/message-board');
      
      // 如果登录失败，显示错误信息
      // this.errorMsg = '用户名或密码错误';
    },
    goToRegister() {
      this.showRegisterModal = true;
    },
    closeModal(e) {
      // 点击遮罩层关闭弹窗
      if (e.target.classList.contains('modal-overlay')) {
        this.showRegisterModal = false;
      }
    },
    handleRegister() {
      // 验证两次密码是否一致
      if (this.regPassword !== this.confirmPassword) {
        this.regErrorMsg = '两次输入的密码不一致';
        return;
      }
      
      // 模拟注册请求
      console.log('注册信息:', {
        username: this.regUsername,
        password: this.regPassword
      });
      
      // 模拟注册成功
      alert('注册成功！请使用新账号登录');
      this.showRegisterModal = false;
      
      // 清空注册表单
      this.regUsername = '';
      this.regPassword = '';
      this.confirmPassword = '';
      this.regErrorMsg = '';
    }
  }
};
</script>

<style scoped>
.login-container {
  background-image: url('@/assets/back.png'); /* 使用与留言板相同的背景 */
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

/* 弹窗样式 */
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