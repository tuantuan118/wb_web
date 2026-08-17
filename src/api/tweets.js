import request from './request'

export function getFriendsTweets(params) {
  return request.get('/v1/tweets/get_friends_tweets', { params })
}

export function getTweets(params) {
  return request.get('/v1/tweets/get_tweets', { params })
}

export function sendTweets(data) {
  return request.post('/v1/tweets/send_tweets', data)
}

export function sendComments(data) {
  // Gateway expects Content (capital C); keep tweetsId as-is.
  const { content, ...rest } = data || {}
  return request.post('/v1/tweets/send_comments', {
    ...rest,
    ...(content !== undefined ? { Content: content } : {}),
  })
}

export function getComments(params) {
  // Gateway query param is TweetsId (capital T), not tweetsId.
  const { tweetsId, ...rest } = params || {}
  return request.get('/v1/tweets/get_comments', {
    params: {
      ...rest,
      ...(tweetsId !== undefined ? { TweetsId: tweetsId } : {}),
    },
  })
}

export function addLike(data) {
  return request.post('/v1/tweets/add_like', data)
}

export function cancelLike(data) {
  return request.post('/v1/tweets/cancel_like', data)
}

export function deleteTweets(data) {
  return request.post('/v1/tweets/delete_tweets', data)
}

export function deleteComments(data) {
  return request.post('/v1/tweets/delete_comments', data)
}
