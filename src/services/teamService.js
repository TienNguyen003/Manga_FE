import httpRequest from '~/lib/httpRequest';

const url = '/teams';

export const teamService = {
  async getTeamList() {
    return httpRequest.get(url);
  },
  async getTeamById(id) {
    return httpRequest.get(`${url}/team?id=${id}`);
  },
  async createTeam(data) {
    return httpRequest.post(`${url}/create`, data);
  },
};
