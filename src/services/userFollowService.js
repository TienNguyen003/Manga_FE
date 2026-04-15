import httpRequest, { get } from '~/lib/httpRequest';

const url = '/users/follow';

export const userFollowService = {
  isFollow: async (params) => {
    return httpRequest.get(`${url}/check`, { params }); // params: { followerId, followingId }
  },

  getFollowCount: async (params) => {
    return httpRequest.get(`${url}/count`, { params }); // params: { userId }
  },

  getFollowers: async (params) => {
    return httpRequest.get(`${url}/followers`, { params }); // params: { userId, page, limit }
  },

  getFollowings: async (params) => {
    return httpRequest.get(`${url}/followings`, { params }); // params: { userId, page, limit }
  },

  followUser: async (data) => {
    return httpRequest.post(url, data); // data: { followerId, followingId }
  },

  unfollowUser: async (params) => {
    return httpRequest.delete(url, { params }); // params: { followerId, followingId }
  }
};
