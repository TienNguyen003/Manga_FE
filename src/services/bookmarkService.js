/**
 * BOOKMARKS — `page` is 0-BASED and `result` is a plain array (Rule 2).
 *
 *   GET    /mangas/bookmarks?userId=&page=&limit=   -> Bookmark[]
 *   GET    /mangas/bookmarks/status?userId=&mangaPath=&chapterName=
 *   POST   /mangas/bookmarks        (idempotent)
 *   DELETE /mangas/bookmarks
 *
 * Rule 3: reads may carry `userId` (anonymous personalised read); writes must
 * NOT, or the backend answers `403 USER_ID_MISMATCH`.
 */
import { get, post, del } from '~/lib/httpRequest';

const url = '/mangas/bookmarks';

/** Idempotent on the server — repeating it does not create a duplicate. */
export const createBookmark = (data) => post(url, data);

export const getBookmarks = ({ userId, page = 0, limit = 20 } = {}) =>
  get(url, { params: { userId, page, limit } });

/** `false` for anonymous readers — the UI must treat that as "not bookmarked". */
export const getBookmarkStatus = ({ userId, mangaPath, chapterName } = {}) =>
  get(`${url}/status`, { params: { userId, mangaPath, chapterName } });

export const getBookmarkCount = ({ userId } = {}) => get(`${url}/count`, { params: { userId } });

export const deleteBookmark = ({ mangaPath, chapterName } = {}) =>
  del(url, { params: { mangaPath, chapterName } });

