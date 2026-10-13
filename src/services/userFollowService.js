/**
 * USER-SIDE FOLLOWS (distinct from `/mangas/follows`, which follows comics).
 *
 *   GET    /users/follow/check?targetUserId=
 *   GET    /users/follow/count?userId=
 *   GET    /users/follow/followers?userId=&page=&limit=
 *   GET    /users/follow/followings?userId=&page=&limit=   <- canonical name
 *          (`/followings` also resolves; prefer the full path.)
 *   POST   /users/follow
 *   DELETE /users/follow
 *
 * `page` is 0-BASED (Rule 2).
 */
import { get, post, del } from '~/lib/httpRequest';

const url = '/users/follow';

export const userFollowService = {
  /** `params: { targetUserId }` */
  isFollow: ({ targetUserId, followerId } = {}) => get(`${url}/check`, { params: { targetUserId, followerId } }),

  /** `params: { userId }` — follower + following counts. */
  getFollowCount: ({ userId } = {}) => get(`${url}/count`, { params: { userId } }),

  getFollowers: ({ userId, page = 0, limit = 20 } = {}) =>
    get(`${url}/followers`, { params: { userId, page, limit } }),

  getFollowings: ({ userId, page = 0, limit = 20 } = {}) =>
    get(`${url}/followings`, { params: { userId, page, limit } }),

  followUser: (data) => post(url, data),

  unfollowUser: ({ followerId, followingId } = {}) => del(url, { params: { followerId, followingId } }),
};

export default userFollowService;

