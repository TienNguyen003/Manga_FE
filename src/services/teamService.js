import { get, post, put, del } from '~/lib/httpRequest';

const url = '/teams';

export const teamService = {
  getTeamList: () => get(url),

  /** `GET /teams/team?id=` — singular path, query param for the id. */
  getTeamById: (id) => get(`${url}/team`, { params: { id } }),

  getTeamMembers: (teamId) => get(`${url}/${teamId}/members`),

  createTeam: (data) => post(`${url}/create`, data),
  addTeamMember: (teamId, userId) => post(`${url}/${teamId}/members`, null, { params: { userId } }),
  updateTeam: (teamId, data) => put(`${url}/${teamId}`, data),
  deleteTeam: (teamId) => del(`${url}/${teamId}`),
  updateTeamMember: (teamId, userId, params) => put(`${url}/${teamId}/members/${userId}`, null, { params }),
  removeTeamMember: (teamId, userId) => del(`${url}/${teamId}/members/${userId}`),
};

export default teamService;

