import axios from 'axios'

const TOKEN_KEY = 'wb_token'
const USER_ID_KEY = 'wb_userId'
const ACCOUNT_KEY = 'wb_account'
const USER_NAME_KEY = 'wb_userName'

let router = null

export function setRouter(r) {
  router = r
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token, remember = true) {
  const storage = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage
  other.removeItem(TOKEN_KEY)
  other.removeItem(USER_ID_KEY)
  other.removeItem(ACCOUNT_KEY)
  other.removeItem(USER_NAME_KEY)
  storage.setItem(TOKEN_KEY, token)
}

export function setUserInfo({ userId, account, userName }, remember = true) {
  const storage = remember ? localStorage : sessionStorage
  if (userId != null) storage.setItem(USER_ID_KEY, String(userId))
  if (account) storage.setItem(ACCOUNT_KEY, account)
  if (userName) storage.setItem(USER_NAME_KEY, userName)
}

export function getUserId() {
  const id = localStorage.getItem(USER_ID_KEY) || sessionStorage.getItem(USER_ID_KEY)
  return id ? Number(id) : null
}

export function getAccount() {
  return localStorage.getItem(ACCOUNT_KEY) || sessionStorage.getItem(ACCOUNT_KEY) || ''
}

export function getUserName() {
  return localStorage.getItem(USER_NAME_KEY) || sessionStorage.getItem(USER_NAME_KEY) || ''
}

export function clearAuth() {
  ;[localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY)
    s.removeItem(USER_ID_KEY)
    s.removeItem(ACCOUNT_KEY)
    s.removeItem(USER_NAME_KEY)
  })
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data && typeof data.code === 'number') {
      if (data.code === 401) {
        clearAuth()
        if (router) router.push('/login')
        return Promise.reject(new Error(data.msg || '鉴权失败'))
      }
      if (data.code !== 200) {
        return Promise.reject(new Error(data.msg || data.error || '请求失败'))
      }
    }
    return data
  },
  (error) => {
    const msg = error.response?.data?.msg || error.response?.data?.error || error.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export default request
