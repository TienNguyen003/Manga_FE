import { get, post, del } from '~/lib/httpRequest';

const url = '/mangas/history';

export const saveHistory = (data) => post(url, data);

export const getHistory = ({ userId }) => get(url, { params: { userId } });

export const getContinueReading = ({ userId, limit = 6 }) => get(`${url}/continue`, { params: { userId, limit } });

export const getHistoryCount = ({ userId }) => get(`${url}/count`, { params: { userId } });

export const deleteHistory = ({ userId, mangaPath }) => del(url, { params: { userId, mangaPath } });
