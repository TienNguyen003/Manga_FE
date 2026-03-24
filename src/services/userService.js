import httpRequest from '~/lib/httpRequest';

export const userService = {
  async getProfile() {
    return httpRequest.get('/user/profile');
  },
  async updateProfile(data) {
    return httpRequest.put('/user/profile', data);
  },
  async changePassword(data) {
    return httpRequest.post('/user/change-password', data);
  },
};
