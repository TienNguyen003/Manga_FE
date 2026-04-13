import httpRequest from '~/lib/httpRequest';

const url = '/community';

export const communityService = {
  getTopics: async () => {
    return httpRequest.get(`${url}/topics`);
  },
  getPosts: async (topicId) => {
    return httpRequest.get(`${url}/topics/${topicId}`);
  },
  getPostComments: async (postId) => {
    return httpRequest.get(`${url}/posts/${postId}/comments`);
  },
  getPostByAuthor: async (user_id) => {
    return httpRequest.get(`${url}/post/${user_id}`);
  },
  createPost: async(userID, data) => {
    return httpRequest.post(`${url}/posts?id=${userID}`, data);
  },
  commentPost: async(userID, data) => {
    return httpRequest.post(`${url}/comments?id=${userID}`, data);
  },
  reactPost: async(data, userId) => {
    return httpRequest.post(`${url}/reactions?id=${userId}`, data);
  },
};
