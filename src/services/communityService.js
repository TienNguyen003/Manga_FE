import httpRequest from '~/lib/httpRequest';

const url = '/community';

export const communityService = {
  getTopics: async () => {
    return httpRequest.get(`${url}/topics`);
  },
  getPostComments: async (postId) => {
    return httpRequest.get(`${url}/posts/${postId}/comments`);
  },
  commentPost: async(userID, data) => {
    return httpRequest.post(`${url}/comments?id=${userID}`, data);
  },
  reactPost: async(data, userId) => {
    return httpRequest.post(`${url}/reactions?id=${userId}`, data);
  },

  // post
  getPostByAuthor: async (user_id) => {
    return httpRequest.get(`${url}/post/${user_id}`);
  },
  getPosts: async (topicId) => {
    return httpRequest.get(`${url}/topics/${topicId}`);
  },
  getPostById: async (postId) => {
    return httpRequest.get(`${url}/posts/${postId}`);
  },
  createPost: async(userID, data) => {
    return httpRequest.post(`${url}/posts?id=${userID}`, data);
  },
  updatePost: async(postId, data) => {
    return httpRequest.put(`${url}/posts/${postId}`, data);
  },
  deletePost: async(postId) => {
    return httpRequest.delete(`${url}/posts/${postId}`);
  },
};
