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
  async createPost(topicId, data) {
    return httpRequest.post(`/community/topic/${topicId}/post`, data);
  },
  async commentPost(postId, data) {
    return httpRequest.post(`/community/post/${postId}/comment`, data);
  },
  async reactPost(postId, data) {
    return httpRequest.post(`/community/post/${postId}/reaction`, data);
  },
};
