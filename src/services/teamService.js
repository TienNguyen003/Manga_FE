import httpRequest from '~/lib/httpRequest';

export const teamService = {
  async getTeamList() {
    return httpRequest.get('/team/list');
  },
  async createTeam(data) {
    return httpRequest.post('/team/create', data);
  },
};
