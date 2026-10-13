/**
 * REPORTING VIOLATIONS
 *
 *   POST /report           -> { type, targetType, targetId, content }
 *   GET  /report/mine?page=&limit=   (`page` is 0-based)
 *
 * ⚠️ `reporterId` IS TAKEN FROM THE JWT. Sending it in the body is ignored, and
 * sending someone else's id does NOT impersonate them — the backend always
 * records the authenticated caller. So it is stripped here to make the contract
 * explicit and to avoid anyone believing they can file as another user.
 *
 * `type` values seen in the UI: OFFENSIVE, SPAM, COPYRIGHT, OTHER.
 * `targetType` values: COMMENT, POST, MANGA, USER.
 */
import { get, post } from '~/lib/httpRequest';

const REPORT_TYPES = ['OFFENSIVE', 'SPAM', 'COPYRIGHT', 'OTHER'];
const TARGET_TYPES = ['COMMENT', 'POST', 'MANGA', 'USER'];

/** `reporterId` is removed — the JWT decides who filed the report. */
export const reportService = {
  REPORT_TYPES,
  TARGET_TYPES,

  async sendReport({ reporterId, ...data } = {}) {
    return post('/report', data);
  },

  /** Reports filed by the signed-in reader. `page` starts at 0. */
  async getMyReports({ page = 0, limit = 20 } = {}) {
    return get('/report/mine', { params: { page, limit } });
  },
};

export default reportService;

