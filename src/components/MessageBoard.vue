<template>
  <div class="message-board">
    <!-- 顶部菜单栏 -->
    <div class="top-menu">
      <div class="menu-title">留言板</div>
      <div class="user-profile">
        <span class="welcome-text">欢迎，{{ currentUser }}</span>
        <div class="profile-avatar" :class="currentUser === 'admin' ? 'admin-avatar' : 'user-avatar'">
          {{ currentUser.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>

    <ul>
      <li v-for="(msg, index) in messages" :key="index">
        <div class="message-header">
          <div class="avatar" :class="msg.user === 'admin' ? 'admin-avatar' : 'user-avatar'">
            {{ msg.user.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <span class="username">{{ msg.user }}</span>
            <span class="message-text">{{ msg.text }}</span>
          </div>
          <button class="icon-button" @click="toggleCommentInput(index)">
            <i class="comment-icon">💬</i>
          </button>
        </div>
        
        <!-- 评论列表 -->
        <div v-if="msg.comments && msg.comments.length > 0" class="comments-list">
          <div v-for="(comment, cIndex) in msg.comments" :key="cIndex" class="comment-item">
            <div class="comment-avatar" :class="comment.user === 'admin' ? 'admin-avatar' : 'user-avatar'">
              {{ comment.user.charAt(0).toUpperCase() }}
            </div>
            <div class="comment-content">
              <span class="comment-username">{{ comment.user }}</span>
              <span class="comment-text">{{ comment.text }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="msg.showCommentInput" class="comment-input">
          <input
            type="text"
            v-model="msg.comment"
            placeholder="输入你的评论"
          />
          <button @click="submitComment(index)">提交评论</button>
        </div>
      </li>
    </ul>
    <form @submit.prevent="handleSubmit">
      <div class="input-container">
        <input
          type="text"
          v-model="newMessage"
          placeholder="输入你的留言"
        />
        <button type="submit">提交</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'MessageBoard',
  data() {
    return {
      messages: [], // 存储留言的数组
      newMessage: '', // 当前输入的留言
      currentUser: 'user' // 默认当前用户为 user，可以切换为 admin
    };
  },
  methods: {
    handleSubmit() {
      if (!this.newMessage) return; // 如果留言为空，直接返回

      // 创建新留言对象，包含用户信息
      this.messages.push({ 
        text: this.newMessage, 
        user: this.currentUser, // 添加用户名
        showCommentInput: false, 
        comment: '',
        comments: [] // 添加评论数组
      });
      
      this.newMessage = ''; // 清空输入框
      
      // 模拟切换用户（在实际应用中，这里应该是固定的登录用户）
      this.currentUser = this.currentUser === 'admin' ? 'user' : 'admin';
    },
    toggleCommentInput(index) {
      this.messages[index].showCommentInput = !this.messages[index].showCommentInput; // 切换评论输入框的显示状态
    },
    submitComment(index) {
      if (!this.messages[index].comment) return; // 如果评论为空，直接返回
      
      // 确保comments数组存在
      if (!this.messages[index].comments) {
        this.$set(this.messages[index], 'comments', []);
      }
      
      // 添加评论到评论数组，包含用户信息
      this.messages[index].comments.push({
        text: this.messages[index].comment,
        user: this.currentUser // 添加评论用户名
      });
      
      console.log(`评论: ${this.messages[index].comment}`);
      this.messages[index].comment = ''; // 清空评论输入框
      this.messages[index].showCommentInput = false; // 隐藏评论输入框
      
      // 模拟切换用户
      this.currentUser = this.currentUser === 'admin' ? 'user' : 'admin';
    }
  }
};
</script>

<style scoped>
html, body {
  height: 100%; /* 确保 html 和 body 高度为 100% */
  margin: 0; /* 去掉默认的 margin */
  padding: 0; /* 去掉默认的 padding */
  overflow: hidden; /* 禁止 body 滚动，避免白边 */
}

.message-board {
  background-image: url('@/assets/back.png'); /* 替换为你的背景图片路径 */
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* 背景固定，不随内容滚动 */
  height: 100vh; /* 设置高度为 100vh，确保铺满整个屏幕 */
  width: 100vw; /* 设置宽度为 100vw，确保铺满整个视口 */
  display: flex;
  flex-direction: column; /* 使子元素垂直排列 */
  justify-content: flex-start; /* 从顶部开始排列 */
  padding: 0; /* 移除内边距，由子元素控制 */
  color: white; /* 文字颜色 */
  max-width: 100%; /* 设置最大宽度为 100% */
  margin: 0; /* 去掉默认的 margin */
  box-sizing: border-box; /* 确保padding不会增加元素的总宽高 */
  position: fixed; /* 固定定位，防止滚动出现白边 */
  top: 0;
  left: 0;
}

/* 顶部菜单栏样式 */
.top-menu {
  width: 100%;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
  box-sizing: border-box; /* 确保padding不会增加元素总高度 */
}

.menu-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.user-profile {
  display: flex;
  align-items: center;
  height: 100%; /* 确保高度与菜单栏一致 */
}

.welcome-text {
  margin-right: 10px;
  color: white;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
  margin: 10px 0; /* 添加上下边距 */
}

.profile-avatar:hover {
  transform: scale(1.1);
}

/* 留言列表容器调整 */
ul {
  list-style-type: none;
  padding: 2vh 2vw;
  margin: 0; /* 去掉默认的 margin */
  flex-grow: 1; /* 使留言记录占据剩余空间 */
  overflow-y: auto; /* 允许滚动 */
  -webkit-overflow-scrolling: touch; /* 使滚动在移动设备上更流畅 */
  width: 100%; /* 确保宽度与父容器一致 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中列表项 */
  box-sizing: border-box;
}

form {
  margin: 20px 2vw; /* 输入框与留言记录之间的间距 */
  width: 100%;
  box-sizing: border-box;
  padding: 0 2vw;
}

.input-container {
  display: flex; /* 使用 flexbox 布局 */
  justify-content: center; /* 水平居中 */
  width: 100%; /* 宽度为 100% */
  max-width: 100%; /* 确保不超出父容器 */
}

input {
  padding: 2vh; /* 使用视口单位增大输入框的内边距 */
  border: none;
  border-radius: 5px;
  margin-right: 1vw; /* 使用视口单位设置右边距 */
  flex: 1; /* 使输入框占据剩余空间 */
  max-width: 70%; /* 调整最大宽度 */
}

button {
  padding: 2vh 3vw; /* 使用视口单位增大按钮的内边距 */
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

li {
  background: rgba(255, 255, 255, 0.8);
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  color: #333; /* 改善文字可读性 */
  width: 70%; /* 与输入框宽度保持一致 */
  box-sizing: border-box; /* 确保padding不会增加元素总宽度 */
}

/* 留言头部样式 */
.message-header {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 头像样式 */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  margin-right: 10px;
  flex-shrink: 0;
}

.admin-avatar {
  background-color: #e74c3c; /* 管理员头像背景色 */
}

.user-avatar {
  background-color: #3498db; /* 普通用户头像背景色 */
}

/* 用户信息样式 */
.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: left;
}

.username {
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
}

.message-text {
  word-break: break-word;
}

/* 评论图标按钮 */
.icon-button {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-icon {
  font-style: normal;
  font-size: 1.2rem;
}

/* 评论列表样式 */
.comments-list {
  margin-top: 10px;
  width: 100%;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  padding: 8px;
  margin: 5px 0;
  margin-left: 20px; /* 缩进一格 */
}

.comment-avatar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  margin-right: 8px;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.comment-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.comment-username {
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 3px;
  color: #2c3e50;
}

.comment-text {
  font-size: 0.9rem;
  word-break: break-word;
}

/* 确保评论输入区域也对齐 */
.comment-input {
  width: 100%;
  margin-top: 8px;
  display: flex;
}

li div input {
  width: calc(100% - 80px); /* 为提交按钮留出空间 */
  margin-right: 8px;
  max-width: none; /* 覆盖父级的max-width限制 */
}
</style> 