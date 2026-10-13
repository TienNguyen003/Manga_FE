/**
 * COMMUNITY (chủ đề · bài viết · bình luận · cảm xúc)
 *
 * ⚠️ TWO ENDPOINTS RETURN A NESTED ENVELOPE — reading `result` directly gives
 * you the wrapper, not the entity:
 *   GET /community/posts/{postId}           -> data.result.post
 *   GET /community/posts/{postId}/comments  -> data.result.comments
 * Everything else returns the entity directly under `result`.
 *
 * `page` is 0-BASED here (Rule 2).
 *
 * Rule 3: writes must not carry a `userId`/`?id=` that disagrees with the JWT
 * (`403 USER_ID_MISMATCH`). The author is resolved server-side.
 */
import { get, post, put, del } from '~/lib/httpRequest';

const url = '/community';

export const communityService = {
  /* --- topics --- */
  /** `GET /community/topics` -> data.result = Topic[] */
  getTopics: () => get(`${url}/topics`),

  /** `GET /community/topics/{topicId}` -> data.result = { posts, ... } */
  getTopic: (topicId) => get(`${url}/topics/${topicId}`),

  /* --- posts --- */
  /** `GET /community/posts?topicId=&page=&limit=` -> data.result = Post[] */
  getPosts: ({ topicId, page = 0, limit = 20 } = {}) => get(`${url}/posts`, { params: { topicId, page, limit } }),

  /** ⚠️ NESTED: `data.result.post` — not `data.result`. */
  getPostById: async (postId) => {
    const { data } = await get(`${url}/posts/${postId}`);
    return { post: data?.result?.post ?? null, raw: data?.result ?? null };
  },

  /** Posts written by one user. */
  getPostByAuthor: ({ userId, page = 0, limit = 20 } = {}) =>
    get(`${url}/post/${userId}`, { params: { page, limit } }),

  createPost: (data) => post(`${url}/posts`, data),
  updatePost: (postId, data) => put(`${url}/posts/${postId}`, data),
  deletePost: (postId) => del(`${url}/posts/${postId}`),

  /* --- comments --- */
  /** ⚠️ NESTED: `data.result.comments` — not `data.result`. */
  getPostComments: async (postId) => {
    const { data } = await get(`${url}/posts/${postId}/comments`);
    return { comments: data?.result?.comments ?? [], raw: data?.result ?? null };
  },

  commentPost: (data) => post(`${url}/comments`, data),

  /* --- reactions --- */
  reactPost: (data) => post(`${url}/reactions`, data),

  /** `GET /community/reactions/{postId}` -> aggregated reaction counts. */
  getReactions: (postId) => get(`${url}/reactions/${postId}`),
};

export default communityService;

