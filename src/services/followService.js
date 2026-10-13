/**
 * MANGA FOLLOWS
 *
 *   POST   /mangas/follows          (idempotent)
 *   GET    /mangas/follows?userId=
 *   GET    /mangas/follows/status?userId=&mangaPath=
 *   PUT    /mangas/follows/progress ⚠️ BOTH FIELDS ARE REQUIRED:
 *                                     `lastReadChapter` AND `latestChapter`
 *   DELETE /mangas/follows
 *
 * The progress endpoint rejects the payload if `latestChapter` is missing — the
 * server needs it to compute "new chapters since you last read". It is filled
 * in from the manga detail response by the caller.
 *
 * Rule 3: writes must not send a `userId` (`403 USER_ID_MISMATCH` otherwise).
 */
import { get, post, put, del } from '~/lib/httpRequest';

const url = '/mangas/follows';

export const followManga = (data) => post(url, data);

export const getFollows = ({ userId } = {}) => get(url, { params: { userId } });

export const getFollowStatus = ({ userId, mangaPath } = {}) =>
  get(`${url}/status`, { params: { userId, mangaPath } });

/**
 * Update reading progress.
 * @param {object} data
 * @param {string} data.mangaPath
 * @param {string} data.lastReadChapter  required
 * @param {string} data.latestChapter   required
 */
export const updateProgress = (data) => put(`${url}/progress`, data);

export const unfollowManga = ({ mangaPath } = {}) => del(url, { params: { mangaPath } });

