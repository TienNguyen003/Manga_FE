import httpRequest from '~/lib/httpRequest';

const url = '/users';

export const userService = {
  // profile
  async getProfile() {
    return httpRequest.get(`${url}/myInfo`);
  },
  async getUserProfile(userId) {
    return httpRequest.get(`${url}/user?userId=${userId}`);
  },
  async updateProfile(data, userId) {
    return httpRequest.put(`${url}?userId=${userId}`, data);
  },
  async changePassword(data) {
    return httpRequest.post(`${url}/change-password`, data);
  },
  async getMySettings() {
    return httpRequest.get(`${url}/profile-setting/my`);
  },
  async createSettings(data) {
    return httpRequest.post(`${url}/profile-setting`, data);
  },
  async updateSettings(data, userId) {
    return httpRequest.put(`${url}/profile-setting?userId=${userId}`, data);
  },

  // user
  getAllUsersWithParams: async (params) => {
    return httpRequest.get(`${url}`, { params });
  },
  getAllUsers: async () => {
    return httpRequest.get(`${url}`);
  },
  createUser: async (data) => {
    return httpRequest.post(`${url}`, data);
  },
  updatePassword: async (data) => {
    return httpRequest.post(`${url}/change-password`, data);
  },
  resetPassword: async (data) => {
    return httpRequest.put(`${url}/reset-password`, data);
  },
  updateStatus: async (userId, status) => {
    return httpRequest.put(`${url}/status?id=${userId}&status=${status}`);
  },
  deleteUser: async (userId) => {
    return httpRequest.delete(`${url}?userId=${userId}`);
  }
};
