/**
 * READING HISTORY — `page` is 0-BASED, `result` is a plain array (Rule 2).
 *
 *   POST   /mangas/history
 *   GET    /mangas/history?userId=
 *   DELETE /mangas/history
 *   GET    /mangas/history/continue   -> "đọc tiếp" rail
 *   GET    /mangas/history/count
 *
 * Rule 3: writes must not send a `userId` (`403 USER_ID_MISMATCH` otherwise).
 */
import { get, post, del } from '~/lib/httpRequest';

const url = '/mangas/history';

export const saveHistory = (data) => post(url, data);

export const getHistory = ({ userId, page = 0, limit = 20 } = {}) =>
  get(url, { params: { userId, page, limit } });

/** "Continue reading" — the newest chapter the reader left off. */
export const getContinueReading = ({ userId, limit = 6 } = {}) =>
  get(`${url}/continue`, { params: { userId, limit } });

export const getHistoryCount = ({ userId } = {}) => get(`${url}/count`, { params: { userId } });

export const deleteHistory = ({ mangaPath } = {}) => del(url, { params: { mangaPath } });

