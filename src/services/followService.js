import { get, post, put, del } from '~/lib/httpRequest';

const url = '/mangas/follows';

export const followManga = (data) => post(url, data);

export const getFollows = ({ userId }) => get(url, { params: { userId } });

export const getFollowStatus = ({ userId, mangaPath }) => get(`${url}/status`, { params: { userId, mangaPath } });

export const updateProgress = (data) => put(`${url}/progress`, data);

export const unfollowManga = ({ userId, mangaPath }) => del(url, { params: { userId, mangaPath } });
