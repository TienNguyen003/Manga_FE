import httpRequest from '~/lib/httpRequest';

const url = '/users';

export const userService = {
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
  }
};
