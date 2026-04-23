import httpRequest from '~/lib/httpRequest';

const baseUrl = '/admin';

export const adminService = {
  getDashboardOverview: (keyword = '') => httpRequest.get(`${baseUrl}/dashboard/overview`, { params: { keyword } }),

  getUsers: (params) => httpRequest.get(`${baseUrl}/users`, { params }),
  banUser: (userId) => httpRequest.put(`${baseUrl}/users/${userId}/ban`),
  unbanUser: (userId) => httpRequest.put(`${baseUrl}/users/${userId}/unban`),
  updateUserRole: (userId, roleName) => httpRequest.put(`${baseUrl}/users/${userId}/role`, null, { params: { roleName } }),

  getBadges: (params) => httpRequest.get(`${baseUrl}/badges`, { params }),
  getBadge: (badgeId) => httpRequest.get(`${baseUrl}/badges/${badgeId}`),
  createBadge: (data) => httpRequest.post(`${baseUrl}/badges`, data),
  updateBadge: (badgeId, data) => httpRequest.put(`${baseUrl}/badges/${badgeId}`, data),
  deleteBadge: (badgeId) => httpRequest.delete(`${baseUrl}/badges/${badgeId}`),
  assignBadge: (badgeId, params) => httpRequest.post(`${baseUrl}/badges/${badgeId}/assign`, null, { params }),
  unassignBadge: (badgeId, params) => httpRequest.delete(`${baseUrl}/badges/${badgeId}/assign`, { params }),

  getAds: (params) => httpRequest.get(`${baseUrl}/ads`, { params }),
  getAd: (adId) => httpRequest.get(`${baseUrl}/ads/${adId}`),
  createAd: (data) => httpRequest.post(`${baseUrl}/ads`, data),
  updateAd: (adId, data) => httpRequest.put(`${baseUrl}/ads/${adId}`, data),
  toggleAd: (adId) => httpRequest.put(`${baseUrl}/ads/${adId}/toggle`),
  deleteAd: (adId) => httpRequest.delete(`${baseUrl}/ads/${adId}`),

  getComics: () => httpRequest.get(`${baseUrl}/mangas/comics`),
  getCommentModeration: (status) => httpRequest.get(`${baseUrl}/mangas/comments`, { params: { status } }),
  getReviewModeration: (status) => httpRequest.get(`${baseUrl}/mangas/reviews`, { params: { status } }),
  moderateComment: (commentId, action) => httpRequest.put(`${baseUrl}/mangas/comments/${commentId}`, null, { params: { action } }),
  moderateReview: (reviewId, action) => httpRequest.put(`${baseUrl}/mangas/reviews/${reviewId}`, null, { params: { action } }),
  getModerationPipeline: (status) => httpRequest.get(`${baseUrl}/manga-ops/pipeline`, { params: { status } }),
  executeModerationAction: (data) => httpRequest.post(`${baseUrl}/manga-ops/pipeline/action`, data),

  getTeams: (params) => httpRequest.get(`${baseUrl}/teams`, { params }),
  getTeam: (teamId) => httpRequest.get(`${baseUrl}/teams/${teamId}`),
  createTeam: (data) => httpRequest.post(`${baseUrl}/teams`, data),
  updateTeam: (teamId, data) => httpRequest.put(`${baseUrl}/teams/${teamId}`, data),
  deleteTeam: (teamId) => httpRequest.delete(`${baseUrl}/teams/${teamId}`),
  getTeamMembers: (teamId) => httpRequest.get(`${baseUrl}/teams/${teamId}/members`),
  addTeamMember: (teamId, userId) => httpRequest.post(`${baseUrl}/teams/${teamId}/members/${userId}`),
  deleteTeamMember: (teamId, userId) => httpRequest.delete(`${baseUrl}/teams/${teamId}/members/${userId}`),

  getTopics: (params) => httpRequest.get(`${baseUrl}/topics`, { params }),
  getTopic: (topicId) => httpRequest.get(`${baseUrl}/topics/${topicId}`),
  createTopic: (data) => httpRequest.post(`${baseUrl}/topics`, data),
  updateTopic: (topicId, data) => httpRequest.put(`${baseUrl}/topics/${topicId}`, data),
  deleteTopic: (topicId) => httpRequest.delete(`${baseUrl}/topics/${topicId}`),
  getPosts: (params) => httpRequest.get(`${baseUrl}/posts`, { params }),
  moderatePost: (postId, action) => httpRequest.put(`${baseUrl}/posts/${postId}`, null, { params: { action } }),
  getReports: (status) => httpRequest.get(`${baseUrl}/reports`, { params: { status } }),
  resolveReport: (reportId, action) => httpRequest.put(`${baseUrl}/reports/${reportId}`, null, { params: { action } }),

  getRecommendationControls: (targetType) => httpRequest.get(`${baseUrl}/recommendations/controls`, { params: { targetType } }),
  updateRecommendationControls: (data) => httpRequest.put(`${baseUrl}/recommendations/controls`, data),
  getRbacMatrix: () => httpRequest.get(`${baseUrl}/rbac/matrix`),
  updateRbacRolePermissions: (roleName, permissions) => httpRequest.put(`${baseUrl}/rbac/roles/${roleName}/permissions`, { permissions }),

  getSessions: (userId) => httpRequest.get(`${baseUrl}/security/sessions`, { params: { userId } }),
  terminateSession: (sessionId) => httpRequest.put(`${baseUrl}/security/sessions/${sessionId}/terminate`),
  getFollowFlags: (threshold) => httpRequest.get(`${baseUrl}/security/follow-flags`, { params: { threshold } }),

  getCollectionAuditCases: (status) => httpRequest.get(`${baseUrl}/collections/audit-cases`, { params: { status } }),
  createCollectionAuditCase: (data) => httpRequest.post(`${baseUrl}/collections/audit-cases`, data),
  updateCollectionAuditCase: (caseId, data) => httpRequest.put(`${baseUrl}/collections/audit-cases/${caseId}`, data),

  getOpsMetrics: () => httpRequest.get(`${baseUrl}/ops/metrics`),
  getIncidents: (status) => httpRequest.get(`${baseUrl}/ops/incidents`, { params: { status } }),
  createIncident: (data) => httpRequest.post(`${baseUrl}/ops/incidents`, data),
  updateIncident: (incidentId, data) => httpRequest.put(`${baseUrl}/ops/incidents/${incidentId}`, data),

  getSecurityAuditLogs: (params) => httpRequest.get(`${baseUrl}/security/audit-logs`, { params }),
  createSecurityAuditLog: (data) => httpRequest.post(`${baseUrl}/security/audit-logs`, data),

  getStatsCharts: () => httpRequest.get(`${baseUrl}/stats/charts`),
};
