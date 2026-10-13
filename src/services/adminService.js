/**
 * ADMIN — every endpoint here requires `ROLE_ADMIN`.
 *
 * ⚠️ ADMINS CANNOT TARGET THEMSELVES. The backend answers
 * `403 FORBIDDEN_RESOURCE` for `PUT|DELETE /admin/users/{id}` and for revoking
 * one's own `ADMIN` role. `isSelf()` below lets screens DISABLE those controls
 * instead of letting the user click into a guaranteed error.
 *
 * ⚠️ ADS: only the READ endpoint is public.
 *   ✅ `GET  /admin/ads?targetUrl=&endAt=`        no token required
 *   ❌ `GET|POST|PUT|DELETE /admin/ads/manage`    ROLE_ADMIN
 * `/admin/ads/{id}/impression` and `/click` are public counters — fire them
 * once per rendered ad / once per click.
 *
 * NOT YET IMPLEMENTED SERVER-SIDE (no controller exists — do not call):
 *   `/admin/mangas/**`, `/admin/manga-ops/pipeline`, `/admin/teams/**`,
 *   `/admin/topics`, `/admin/posts`.
 * Swagger UI is the source of truth for what actually exists.
 */
import { get, post, put, del } from '~/lib/httpRequest';

const baseUrl = '/admin';

/**
 * True when `targetId` is the signed-in admin.
 * @param {*} targetId  id being acted upon
 * @param {*} currentId id of the signed-in admin
 */
export const isSelf = (targetId, currentId) => {
  if (targetId === null || targetId === undefined || currentId === null || currentId === undefined) return false;
  return String(targetId) === String(currentId);
};

export const adminService = {
  isSelf,

  /* --- dashboard & stats --- */
  /** 19 headline metrics. */
  getDashboardOverview: (keyword = '') => get(`${baseUrl}/dashboard/overview`, { params: { keyword } }),
  /** 5 series x 14 days for the charts. */
  getStatsCharts: () => get(`${baseUrl}/stats/charts`),
  getStatsSummary: () => get(`${baseUrl}/stats/summary`),
  getAuditActions: (params) => get(`${baseUrl}/stats/audit-actions`, { params }),

  /* --- users --- */
  getUsers: (params) => get(`${baseUrl}/users`, { params }),

  /** ⚠️ `403 FORBIDDEN_RESOURCE` when `userId` is you — disable the button. */
  banUser: (userId) => put(`${baseUrl}/users/${userId}/ban`),
  unbanUser: (userId) => put(`${baseUrl}/users/${userId}/unban`),

  /** ⚠️ Also `403` when revoking your own `ADMIN` role. */
  updateUserRole: (userId, roleName) => put(`${baseUrl}/users/${userId}/role`, null, { params: { roleName } }),

  deleteUser: (userId) => del(`${baseUrl}/users/${userId}`),
  resetUserPassword: (userId, data) => put(`${baseUrl}/users/${userId}/reset-password`, data),

  /* --- badges (admin-granted, distinct from achievements) --- */
  getBadges: (params) => get(`${baseUrl}/badges`, { params }),
  getBadge: (badgeId) => get(`${baseUrl}/badges/${badgeId}`),
  createBadge: (data) => post(`${baseUrl}/badges`, data),
  updateBadge: (badgeId, data) => put(`${baseUrl}/badges/${badgeId}`, data),
  deleteBadge: (badgeId) => del(`${baseUrl}/badges/${badgeId}`),
  assignBadge: (badgeId, params) => post(`${baseUrl}/badges/${badgeId}/assign`, null, { params }),
  unassignBadge: (badgeId, params) => del(`${baseUrl}/badges/${badgeId}/assign`, { params }),

  /* --- ads --- */
  /** ✅ PUBLIC — no token needed. Used by the reader page. */
  getAds: (params) => get(`${baseUrl}/ads`, { params }),
  /** Fire ONCE per rendered ad. */
  trackAdImpression: (adId) => post(`${baseUrl}/ads/${adId}/impression`),
  /** Fire ONCE per user click on the ad. */
  trackAdClick: (adId) => post(`${baseUrl}/ads/${adId}/click`),

  /** ❌ ROLE_ADMIN — the management CRUD lives under `/manage`. */
  getAdsForManage: (params) => get(`${baseUrl}/ads/manage`, { params }),
  createAd: (data) => post(`${baseUrl}/ads/manage`, data),
  updateAd: (adId, data) => put(`${baseUrl}/ads/manage/${adId}`, data),
  deleteAd: (adId) => del(`${baseUrl}/ads/manage/${adId}`),

  /* --- reports --- */
  getReports: ({ status, page = 0, limit = 20 } = {}) =>
    get(`${baseUrl}/reports`, { params: { status, page, limit } }),
  getReportsByTarget: ({ targetType, targetId } = {}) =>
    get(`${baseUrl}/reports/target`, { params: { targetType, targetId } }),
  /** NEW -> IN_REVIEW -> RESOLVED -> ARCHIVED */
  updateReportStatus: ({ reportId, status } = {}) =>
    put(`${baseUrl}/reports/${reportId}/status`, null, { params: { status } }),
  getReportsStats: () => get(`${baseUrl}/reports-stats`),

  /* --- RBAC --- */
  getRbacMatrix: () => get(`${baseUrl}/rbac/matrix`),
  getRolePermissions: (roleName) => get(`${baseUrl}/rbac/roles/${roleName}/permissions`),
  updateRolePermissions: (roleName, permissions) =>
    put(`${baseUrl}/rbac/roles/${roleName}/permissions`, { permissions }),

  /* --- security --- */
  getSecurityAuditLogs: (params) => get(`${baseUrl}/security/audit-logs`, { params }),
  getSecurityEvents: (params) => get(`${baseUrl}/security/events`, { params }),
  getSuspiciousUsers: ({ userId } = {}) => get(`${baseUrl}/security/suspicious`, { params: { userId } }),

  /* --- ops --- */
  getOpsIncidents: ({ status, page = 0, limit = 20 } = {}) =>
    get(`${baseUrl}/ops/incidents`, { params: { status, page, limit } }),
  createIncident: (data) => post(`${baseUrl}/ops/incidents`, data),
  updateIncident: (incidentId, data) => put(`${baseUrl}/ops/incidents/${incidentId}`, data),

  /* --- collection audit --- */
  getCollectionAuditCases: ({ status, page = 0, limit = 20 } = {}) =>
    get(`${baseUrl}/collections/audit-cases`, { params: { status, page, limit } }),
  createCollectionAuditCase: (data) => post(`${baseUrl}/collections/audit-cases`, data),
  updateCollectionAuditCase: (caseId, data) => put(`${baseUrl}/collections/audit-cases/${caseId}`, data),

  /* --- recommendation controls (pin / boost / hide) --- */
  getRecommendationControls: (targetType) => get(`${baseUrl}/recommendations/controls`, { params: { targetType } }),
  updateRecommendationControls: (data) => put(`${baseUrl}/recommendations/controls`, data),
  deleteRecommendationControl: (controlId) => del(`${baseUrl}/recommendations/controls/${controlId}`),
};

export default adminService;

