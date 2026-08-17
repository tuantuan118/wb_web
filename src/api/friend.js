import request from './request'

/** 按用户 ID 查询：GET /v1/friend/get_user?id= */
export function getUser(params) {
  const id = params?.id ?? params?.friendId
  return request.get('/v1/friend/get_user', {
    params: { id }
  })
}

export function followFriends(data) {
  return request.post('/v1/friend/follow_friends', data)
}

export function deleteFriend(data) {
  return request.post('/v1/friend/delete_friend', data)
}

/**
 * 关系列表：GET /v1/friend/get_friends?relation=
 * relation: 1=我的关注(following) 2=我的粉丝(follower) 3=互相关注(mutual)
 */
export function getFriends(params = {}) {
  return request.get('/v1/friend/get_friends', {
    params: {
      relation: 1,
      pn: 1,
      pSize: 20,
      ...params
    }
  })
}
