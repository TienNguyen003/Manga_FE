import httpRequest from '~/lib/httpRequest';

export const communityService = {
  getTopics: async () => {
    return httpRequest.get('/community/topics');
  },
  getPosts: async (topicId) => {
    return httpRequest.get(`/community/topics/${topicId}`);
  },
  getPostComments: async (postId) => {
    return httpRequest.get(`/community/posts/${postId}/comments`);
  },
  async createPost(userID, data) {
    return httpRequest.post(`/community/posts?id=${userID}`, data);
  },
  async commentPost(userID, data) {
    return httpRequest.post(`/community/comments?id=${userID}`, data);
  },
  async reactPost(data, userId) {
    return httpRequest.post(`/community/reactions?id=${userId}`, data);
  },
};
