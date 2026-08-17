<template>
  <div class="message-board">
    <div class="top-menu">
      <div class="menu-nav">
        <router-link to="/message-board" class="nav-link" :class="{ active: feed === 'friends' }">
          时间线
        </router-link>
        <router-link to="/my-tweets" class="nav-link" :class="{ active: feed === 'mine' }">
          我的推文
        </router-link>
        <router-link to="/following" class="nav-link">好友</router-link>
      </div>
      <div class="user-profile">
        <span class="welcome-text">欢迎，{{ displayName }}</span>
        <div class="profile-avatar user-avatar">
          {{ displayName.charAt(0).toUpperCase() }}
        </div>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </div>

    <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

    <div v-if="loading" class="loading-tip">加载中...</div>

    <ul v-else>
      <li v-if="tweets.length === 0" class="empty-tip">{{ emptyText }}</li>
      <li v-for="tweet in tweets" :key="tweet.id">
        <div class="message-header">
          <div class="avatar user-avatar">
            {{ (tweet.userName || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <span class="username">{{ tweet.userName }}</span>
            <span class="message-time">{{ formatTime(tweet.sendTime) }}</span>
            <span class="message-text">{{ tweet.content }}</span>
          </div>
          <div class="action-buttons">
            <button
              class="icon-button like-button"
              :class="{ liked: likedIds.has(tweet.id) }"
              @click="toggleLike(tweet)"
              title="点赞"
            >
              ❤ {{ tweet.likeNum }}
            </button>
            <button class="icon-button" @click="toggleComments(tweet)" title="评论">
              <i class="comment-icon">💬 {{ tweet.commentsCount }}</i>
            </button>
            <button
              v-if="isOwn(tweet.userId)"
              class="icon-button delete-button"
              @click="handleDeleteTweet(tweet)"
              title="删除"
            >
              🗑
            </button>
          </div>
        </div>

        <div v-if="tweet.showComments" class="comments-list">
          <div v-if="tweet.loadingComments" class="comment-loading">加载评论...</div>
          <div v-for="comment in tweet.commentsList" :key="comment.id" class="comment-item">
            <div class="comment-avatar user-avatar">
              {{ (comment.userName || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="comment-content">
              <span class="comment-username">{{ comment.userName }}</span>
              <span class="comment-time">{{ formatTime(comment.sendTime) }}</span>
              <span class="comment-text">{{ comment.content }}</span>
            </div>
            <div class="comment-actions">
              <button
                class="icon-button like-button small"
                :class="{ liked: likedIds.has(comment.id) }"
                @click="toggleLike(comment)"
                title="点赞"
              >
                ❤ {{ comment.likeNum }}
              </button>
              <button
                v-if="isOwn(comment.userId)"
                class="icon-button delete-button small"
                @click="handleDeleteComment(tweet, comment)"
                title="删除"
              >
                🗑
              </button>
            </div>
          </div>
        </div>

        <div v-if="tweet.showCommentInput" class="comment-input">
          <input
            type="text"
            v-model="tweet.commentText"
            placeholder="输入你的评论"
            @keyup.enter="submitComment(tweet)"
          />
          <button @click="submitComment(tweet)" :disabled="tweet.submittingComment">
            {{ tweet.submittingComment ? '提交中...' : '提交评论' }}
          </button>
        </div>
      </li>
      <li v-if="tweets.length > 0 && hasMore" class="load-more-item">
        <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </li>
    </ul>

    <form @submit.prevent="handleSubmit">
      <div class="input-container">
        <input
          type="text"
          v-model="newMessage"
          placeholder="输入你的推文"
          :disabled="submitting"
        />
        <button type="submit" :disabled="submitting || !newMessage.trim()">
          {{ submitting ? '发送中...' : '发布' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import {
  getFriendsTweets,
  getTweets,
  sendTweets,
  sendComments,
  getComments,
  addLike,
  cancelLike,
  deleteTweets,
  deleteComments
} from '@/api/tweets'
import { getUserId, getAccount, getUserName, clearAuth } from '@/api/request'

const PAGE_SIZE = 20

export default {
  name: 'MessageBoard',
  data() {
    return {
      tweets: [],
      newMessage: '',
      loading: false,
      loadingMore: false,
      submitting: false,
      errorMsg: '',
      likedIds: new Set(),
      currentUserId: getUserId(),
      page: 1,
      total: 0
    }
  },
  computed: {
    displayName() {
      return getUserName() || getAccount() || '用户'
    },
    feed() {
      return this.$route.meta.feed || 'friends'
    },
    emptyText() {
      return this.feed === 'mine'
        ? '还没有推文，发一条吧'
        : '暂无好友推文，去关注好友或自己发一条吧'
    },
    hasMore() {
      return this.tweets.length < this.total
    }
  },
  watch: {
    feed: {
      immediate: true,
      handler() {
        this.loadTweets(true)
      }
    }
  },
  methods: {
    pickField(obj, ...keys) {
      for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key]
      }
      return undefined
    },
    toCount(value) {
      const n = Number(value)
      return Number.isFinite(n) ? n : 0
    },
    isOwn(userId) {
      return this.currentUserId != null && userId == this.currentUserId
    },
    formatTime(timestamp) {
      if (timestamp === undefined || timestamp === null || timestamp === '') return ''
      let ms = Number(timestamp)
      if (Number.isNaN(ms)) return ''
      // 兼容秒级时间戳
      if (ms > 0 && ms < 1e12) ms *= 1000
      const date = new Date(ms)
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleString('zh-CN')
    },
    normalizeItem(t) {
      const id = this.pickField(t, 'id', 'Id', 'ID')
      const userId = this.pickField(t, 'userId', 'UserId', 'user_id')
      const userName = this.pickField(t, 'userName', 'UserName', 'user_name') || ''
      const content = this.pickField(t, 'content', 'Content') || ''
      const sendTime = this.pickField(t, 'sendTime', 'SendTime', 'send_time')
      const likeNum = this.toCount(
        this.pickField(t, 'likeNum', 'LikeNum', 'like_num', 'likes', 'LikeCount')
      )
      const commentsCount = this.toCount(
        this.pickField(t, 'commentsCount', 'CommentsCount', 'comments_count', 'commentNum')
      )
      const isLiked = !!(
        this.pickField(t, 'isLiked', 'IsLiked', 'liked', 'Liked', 'hasLiked', 'HasLiked')
      )
      return {
        ...t,
        id,
        userId,
        userName,
        content,
        sendTime,
        likeNum,
        commentsCount,
        isLiked
      }
    },
    normalizeTweet(t) {
      const item = this.normalizeItem(t)
      const rawComments =
        this.pickField(t, 'commentsList', 'CommentsList', 'comments_list') || []
      return {
        ...item,
        showCommentInput: false,
        showComments: false,
        commentText: '',
        commentsList: Array.isArray(rawComments)
          ? rawComments.map((c) => this.normalizeItem(c))
          : [],
        loadingComments: false,
        submittingComment: false
      }
    },
    markLikedFromTweets(list) {
      const next = new Set(this.likedIds)
      list.forEach((t) => {
        if (t.isLiked || t.liked || t.hasLiked) {
          next.add(t.id)
        }
      })
      this.likedIds = next
    },
    async fetchPage(page) {
      const params = { pn: page, pSize: PAGE_SIZE }
      if (this.feed === 'mine') {
        return getTweets(params)
      }
      return getFriendsTweets(params)
    },
    async loadTweets(reset = true) {
      if (reset) {
        this.page = 1
        this.loading = true
      } else {
        this.loadingMore = true
      }
      this.errorMsg = ''
      try {
        const res = await this.fetchPage(this.page)
        const list = (res.data || []).map((t) => this.normalizeTweet(t))
        this.total = res.count ?? list.length
        this.tweets = reset ? list : [...this.tweets, ...list]
        this.markLikedFromTweets(list)
      } catch (err) {
        this.errorMsg = err.message || '加载推文失败'
        if (reset) this.tweets = []
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    async loadMore() {
      if (!this.hasMore || this.loadingMore) return
      this.page += 1
      await this.loadTweets(false)
    },
    async handleSubmit() {
      const content = this.newMessage.trim()
      if (!content) return

      this.submitting = true
      this.errorMsg = ''
      try {
        await sendTweets({ content })
        this.newMessage = ''
        await this.loadTweets(true)
      } catch (err) {
        this.errorMsg = err.message || '发布失败'
      } finally {
        this.submitting = false
      }
    },
    async toggleComments(tweet) {
      const isOpen = tweet.showComments || tweet.showCommentInput
      if (isOpen) {
        tweet.showComments = false
        tweet.showCommentInput = false
        return
      }
      tweet.showComments = true
      tweet.showCommentInput = true
      await this.loadComments(tweet)
    },
    async loadComments(tweet) {
      tweet.loadingComments = true
      try {
        const res = await getComments({ tweetsId: tweet.id, pn: 1, pSize: 50 })
        const list = (res.data || []).map((c) => this.normalizeItem(c))
        tweet.commentsList = list
        tweet.commentsCount = this.toCount(res.count ?? list.length)
        this.markLikedFromTweets(list)
      } catch (err) {
        this.errorMsg = err.message || '加载评论失败'
      } finally {
        tweet.loadingComments = false
      }
    },
    async submitComment(tweet) {
      const content = (tweet.commentText || '').trim()
      if (!content) return

      tweet.submittingComment = true
      this.errorMsg = ''
      try {
        await sendComments({ tweetsId: tweet.id, content })
        tweet.commentText = ''
        tweet.showCommentInput = true
        tweet.showComments = true
        await this.loadComments(tweet)
      } catch (err) {
        this.errorMsg = err.message || '评论失败'
      } finally {
        tweet.submittingComment = false
      }
    },
    async toggleLike(item) {
      this.errorMsg = ''
      const liked = this.likedIds.has(item.id)
      const prevNum = this.toCount(item.likeNum)
      const next = new Set(this.likedIds)

      if (liked) {
        next.delete(item.id)
        this.likedIds = next
        item.likeNum = Math.max(0, prevNum - 1)
      } else {
        next.add(item.id)
        this.likedIds = next
        item.likeNum = prevNum + 1
      }

      try {
        if (liked) {
          await cancelLike({ tweetsId: item.id })
        } else {
          await addLike({ tweetsId: item.id })
        }
      } catch (err) {
        const rollback = new Set(this.likedIds)
        if (liked) {
          rollback.add(item.id)
          item.likeNum = prevNum
        } else {
          rollback.delete(item.id)
          item.likeNum = prevNum
        }
        this.likedIds = rollback
        this.errorMsg = err.message || '操作失败'
      }
    },
    async handleDeleteTweet(tweet) {
      if (!confirm('确定删除这条推文？')) return
      this.errorMsg = ''
      try {
        await deleteTweets({ tweetsId: tweet.id })
        await this.loadTweets(true)
      } catch (err) {
        this.errorMsg = err.message || '删除失败'
      }
    },
    async handleDeleteComment(tweet, comment) {
      if (!confirm('确定删除这条评论？')) return
      this.errorMsg = ''
      try {
        await deleteComments({ tweetsId: comment.id })
        await this.loadComments(tweet)
      } catch (err) {
        this.errorMsg = err.message || '删除评论失败'
      }
    },
    handleLogout() {
      clearAuth()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.message-board {
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0;
  color: white;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

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
  box-sizing: border-box;
}

.menu-nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
}

.nav-link.active,
.nav-link:hover {
  color: white;
}

.user-profile {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 10px;
}

.welcome-text {
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
}

.logout-btn {
  padding: 6px 14px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #c82333;
}

.error-banner {
  background: rgba(231, 76, 60, 0.9);
  color: white;
  text-align: center;
  padding: 8px;
}

.loading-tip, .empty-tip {
  text-align: center;
  padding: 40px;
  color: white;
  flex: 1;
}

ul {
  list-style-type: none;
  padding: 2vh 2vw;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

form {
  margin: 20px 2vw;
  width: 100%;
  box-sizing: border-box;
  padding: 0 2vw;
}

.input-container {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100%;
}

input {
  padding: 2vh;
  border: none;
  border-radius: 5px;
  margin-right: 1vw;
  flex: 1;
  max-width: 70%;
}

button {
  padding: 2vh 3vw;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

li {
  background: rgba(255, 255, 255, 0.8);
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  color: #333;
  width: 70%;
  box-sizing: border-box;
}

.load-more-item {
  background: transparent;
  text-align: center;
  padding: 8px 0;
}

.load-more-btn {
  padding: 10px 24px;
}

.message-header {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

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

.user-avatar {
  background-color: #3498db;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: left;
}

.username {
  font-weight: bold;
  margin-bottom: 2px;
  color: #2c3e50;
}

.message-time {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.message-text {
  word-break: break-word;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
}

.icon-button {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 0.85rem;
}

.icon-button.small {
  font-size: 0.75rem;
  padding: 2px;
}

.like-button.liked {
  color: #e74c3c;
}

.delete-button {
  color: #e74c3c;
}

.comment-icon {
  font-style: normal;
  font-size: 0.9rem;
}

.comments-list {
  margin-top: 10px;
  width: 100%;
}

.comment-loading {
  font-size: 0.85rem;
  color: #666;
  padding: 4px 0;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  padding: 8px;
  margin: 5px 0;
  margin-left: 20px;
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
  margin-bottom: 2px;
  color: #2c3e50;
}

.comment-time {
  font-size: 0.7rem;
  color: #7f8c8d;
  margin-bottom: 3px;
}

.comment-text {
  font-size: 0.9rem;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 6px;
  flex-shrink: 0;
}

.comment-input {
  width: 100%;
  margin-top: 8px;
  display: flex;
}

li div input {
  width: calc(100% - 80px);
  margin-right: 8px;
  max-width: none;
}

@media (max-width: 640px) {
  li {
    width: 94%;
  }

  .menu-nav {
    gap: 10px;
  }

  .nav-link {
    font-size: 0.95rem;
  }

  .welcome-text {
    display: none;
  }
}
</style>
