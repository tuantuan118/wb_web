<template>
  <div class="friends-page">
    <div class="top-menu">
      <div class="menu-nav">
        <router-link to="/message-board" class="nav-link">时间线</router-link>
        <router-link to="/my-tweets" class="nav-link">我的推文</router-link>
        <router-link
          to="/following"
          class="nav-link"
          :class="{ active: isFriendsSection }"
        >
          好友
        </router-link>
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
    <div v-if="successMsg" class="success-banner">{{ successMsg }}</div>

    <div class="content">
      <section class="panel tabs-panel">
        <nav class="sub-tabs">
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            :to="tab.path"
            class="sub-tab"
            :class="{ active: listType === tab.type }"
          >
            {{ tab.label }}
          </router-link>
        </nav>
      </section>

      <section class="panel search-panel">
        <h2>查找用户</h2>
        <form class="search-form" @submit.prevent="handleSearch">
          <input
            v-model="searchId"
            type="text"
            inputmode="numeric"
            placeholder="输入用户 ID 搜索"
            :disabled="searching"
          />
          <button type="submit" :disabled="searching || !searchId.trim()">
            {{ searching ? '搜索中...' : '搜索' }}
          </button>
        </form>
        <div v-if="searchResult" class="user-card">
          <div class="avatar user-avatar">
            {{ (searchResult.userName || searchResult.account || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="user-meta">
            <span class="name">{{ searchResult.userName || searchResult.account }}</span>
            <span class="account">
              @{{ searchResult.account }}
              <template v-if="friendIdOf(searchResult) != null">
                · ID {{ friendIdOf(searchResult) }}
              </template>
            </span>
          </div>
          <button
            v-if="!isSelf(searchResult)"
            class="action-btn"
            :disabled="actingId === friendIdOf(searchResult) || isFollowing(searchResult)"
            @click="handleFollow(searchResult)"
          >
            {{
              actingId === friendIdOf(searchResult)
                ? '关注中...'
                : isFollowing(searchResult)
                  ? '已关注'
                  : '关注'
            }}
          </button>
          <span v-else class="self-tag">自己</span>
        </div>
      </section>

      <section class="panel list-panel">
        <h2>{{ listTitle }}</h2>
        <div v-if="loading" class="tip">加载中...</div>
        <div v-else-if="users.length === 0" class="tip">{{ emptyText }}</div>
        <ul v-else class="friend-list">
          <li v-for="user in users" :key="friendKey(user)" class="user-card">
            <div class="avatar user-avatar">
              {{ (user.userName || user.account || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="user-meta">
              <span class="name">{{ user.userName || user.account || '用户' }}</span>
              <span class="account">
                <template v-if="user.account">@{{ user.account }} · </template>
                ID {{ friendIdOf(user) }}
              </span>
            </div>

            <!-- 我的关注 / 互相关注：取消关注 -->
            <button
              v-if="listType === 'following' || listType === 'mutual'"
              class="action-btn danger"
              :disabled="actingId === friendIdOf(user)"
              @click="handleUnfollow(user)"
            >
              {{ actingId === friendIdOf(user) ? '取消中...' : '取消关注' }}
            </button>

            <!-- 我的粉丝：未关注则回关，已关注则提示 -->
            <button
              v-else-if="listType === 'followers'"
              class="action-btn"
              :class="{ muted: isFollowing(user) }"
              :disabled="actingId === friendIdOf(user) || isFollowing(user)"
              @click="handleFollow(user)"
            >
              {{
                actingId === friendIdOf(user)
                  ? '关注中...'
                  : isFollowing(user)
                    ? '已关注'
                    : '回关'
              }}
            </button>
          </li>
        </ul>
        <button
          v-if="hasMore"
          class="load-more"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { getUser, followFriends, deleteFriend, getFriends } from '@/api/friend'
import { getAccount, getUserName, getUserId, clearAuth } from '@/api/request'

const TABS = [
  { path: '/following', type: 'following', label: '我的关注', relation: 1 },
  { path: '/followers', type: 'followers', label: '我的粉丝', relation: 2 },
  { path: '/friends', type: 'mutual', label: '我的朋友', relation: 3 }
]

const LIST_META = {
  following: {
    title: '我的关注',
    empty: '还没有关注任何人，去搜索关注吧'
  },
  followers: {
    title: '我的粉丝',
    empty: '还没有粉丝'
  },
  mutual: {
    title: '我的朋友（互相关注）',
    empty: '还没有互相关注的朋友'
  }
}

export default {
  name: 'FriendsPage',
  data() {
    return {
      tabs: TABS,
      searchId: '',
      searchResult: null,
      searching: false,
      users: [],
      followingIds: new Set(),
      loading: false,
      loadingMore: false,
      actingId: null,
      errorMsg: '',
      successMsg: '',
      page: 1,
      pageSize: 20,
      total: 0,
      currentUserId: getUserId()
    }
  },
  computed: {
    displayName() {
      return getUserName() || getAccount() || '用户'
    },
    listType() {
      return this.$route.meta.listType || 'following'
    },
    relation() {
      return this.$route.meta.relation || 1
    },
    isFriendsSection() {
      return ['following', 'followers', 'mutual'].includes(this.listType)
    },
    listTitle() {
      return LIST_META[this.listType]?.title || '列表'
    },
    emptyText() {
      return LIST_META[this.listType]?.empty || '暂无数据'
    },
    hasMore() {
      return this.users.length < this.total
    }
  },
  watch: {
    listType: {
      immediate: true,
      handler() {
        this.errorMsg = ''
        this.successMsg = ''
        this.loadList(true)
        this.loadFollowingIds()
      }
    }
  },
  methods: {
    normalizeUser(user) {
      if (!user) return null
      const id = user.friendId ?? user.id ?? user.Id
      return {
        ...user,
        id,
        friendId: id,
        account: user.account || user.Account || '',
        userName: user.userName || user.UserName || '',
        relation: user.relation || user.Relation || ''
      }
    },
    friendIdOf(user) {
      return user?.friendId ?? user?.id ?? null
    },
    friendKey(user) {
      return this.friendIdOf(user) ?? user.account
    },
    isSelf(user) {
      const id = this.friendIdOf(user)
      return (
        (id != null && id == this.currentUserId) ||
        (user.account && user.account === getAccount())
      )
    },
    isFollowing(user) {
      const id = this.friendIdOf(user)
      return id != null && this.followingIds.has(Number(id))
    },
    async loadFollowingIds() {
      try {
        const res = await getFriends({ relation: 1, pn: 1, pSize: 200 })
        const list = res.data || []
        this.followingIds = new Set(
          list
            .map((u) => Number(this.friendIdOf(this.normalizeUser(u))))
            .filter((id) => Number.isFinite(id))
        )
      } catch {
        // 不影响主列表
      }
    },
    async handleSearch() {
      const raw = this.searchId.trim()
      if (!raw) return
      const id = Number(raw)
      if (!Number.isFinite(id) || id <= 0 || String(id) !== raw) {
        this.errorMsg = '请输入有效的用户 ID（数字）'
        this.searchResult = null
        return
      }

      this.searching = true
      this.errorMsg = ''
      this.successMsg = ''
      this.searchResult = null
      try {
        const res = await getUser({ id })
        this.searchResult = this.normalizeUser(res.data)
        if (!this.searchResult) {
          this.errorMsg = '未找到该用户'
        }
      } catch (err) {
        this.errorMsg = err.message || '搜索失败'
      } finally {
        this.searching = false
      }
    },
    async handleFollow(user) {
      const friendId = this.friendIdOf(user)
      if (friendId == null || this.isFollowing(user)) return

      this.actingId = friendId
      this.errorMsg = ''
      this.successMsg = ''
      try {
        await followFriends({ friendId: Number(friendId) })
        this.successMsg = `已关注 ${user.userName || user.account}`
        await Promise.all([this.loadList(true), this.loadFollowingIds()])
      } catch (err) {
        this.errorMsg = err.message || '关注失败'
      } finally {
        this.actingId = null
      }
    },
    async handleUnfollow(user) {
      const friendId = this.friendIdOf(user)
      if (friendId == null) return
      if (!confirm('确定取消关注？')) return

      this.actingId = friendId
      this.errorMsg = ''
      this.successMsg = ''
      try {
        await deleteFriend({ friendId: Number(friendId) })
        this.successMsg = '已取消关注'
        await Promise.all([this.loadList(true), this.loadFollowingIds()])
      } catch (err) {
        this.errorMsg = err.message || '取消关注失败'
      } finally {
        this.actingId = null
      }
    },
    async loadList(reset = false) {
      if (reset) {
        this.page = 1
        this.loading = true
      } else {
        this.loadingMore = true
      }
      this.errorMsg = ''
      try {
        const res = await getFriends({
          relation: this.relation,
          pn: this.page,
          pSize: this.pageSize
        })
        const list = (res.data || []).map((u) => this.normalizeUser(u))
        this.total = res.count ?? list.length
        this.users = reset ? list : [...this.users, ...list]
      } catch (err) {
        this.errorMsg = err.message || '加载列表失败'
        if (reset) this.users = []
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    async loadMore() {
      if (!this.hasMore || this.loadingMore) return
      this.page += 1
      await this.loadList(false)
    },
    handleLogout() {
      clearAuth()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.friends-page {
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
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
  gap: 10px;
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

.user-avatar {
  background-color: #3498db;
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

.error-banner,
.success-banner {
  text-align: center;
  padding: 8px;
}

.error-banner {
  background: rgba(231, 76, 60, 0.9);
}

.success-banner {
  background: rgba(39, 174, 96, 0.9);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 2vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-sizing: border-box;
}

.panel {
  width: 70%;
  max-width: 720px;
  background: rgba(255, 255, 255, 0.88);
  color: #333;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
}

.tabs-panel {
  padding: 12px 16px;
}

.sub-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sub-tab {
  flex: 1;
  min-width: 96px;
  text-align: center;
  text-decoration: none;
  color: #555;
  font-weight: 600;
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
}

.sub-tab.active {
  background: #007bff;
  color: white;
}

.sub-tab:hover:not(.active) {
  background: rgba(0, 123, 255, 0.12);
  color: #007bff;
}

.panel h2 {
  margin: 0 0 16px;
  font-size: 1.2rem;
  color: #2c3e50;
}

.search-form {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-form input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-form button,
.action-btn,
.load-more {
  padding: 10px 16px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.search-form button:disabled,
.action-btn:disabled,
.load-more:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.danger {
  background-color: #dc3545;
}

.action-btn.muted {
  background-color: #95a5a6;
}

.tip {
  text-align: center;
  color: #666;
  padding: 20px 0;
}

.friend-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.friend-list .user-card:first-child {
  border-top: none;
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
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.name {
  font-weight: bold;
  color: #2c3e50;
}

.account {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.self-tag {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.load-more {
  display: block;
  margin: 16px auto 0;
}

@media (max-width: 640px) {
  .panel {
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

  .sub-tab {
    font-size: 0.9rem;
    padding: 8px 6px;
  }
}
</style>
