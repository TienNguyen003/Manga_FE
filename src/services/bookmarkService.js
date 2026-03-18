import { get, post, del } from '~/lib/httpRequest';

const url = '/mangas/bookmarks';

export const createBookmark = (data) => post(url, data);

export const getBookmarks = ({ userId }) => get(url, { params: { userId } });

export const getBookmarkStatus = ({ userId, mangaPath, chapterName }) => get(`${url}/status`, { params: { userId, mangaPath, chapterName } });

export const getBookmarkCount = ({ userId }) => get(`${url}/count`, { params: { userId } });

export const deleteBookmark = ({ userId, mangaPath, chapterName }) => del(url, { params: { userId, mangaPath, chapterName } });
