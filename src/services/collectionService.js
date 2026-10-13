/**
 * COLLECTIONS (bộ sưu tập / reading lists)
 *
 *   GET/POST/PUT/DELETE /mangas/collections[?collectionId=]
 *   GET  /mangas/collections/detail?userId=&collectionId=
 *   GET/POST/PUT/DELETE /mangas/collections/items[...]/note
 *   GET  /mangas/collections/count?userId=
 *
 * Rule 3: reads may carry `userId`; writes must not (`403 USER_ID_MISMATCH`).
 */
import { get, post, put, del } from '~/lib/httpRequest';

const url = '/mangas/collections';
const itemUrl = '/mangas/collections/items';

export const createCollection = (data) => post(url, data);

export const updateCollection = ({ collectionId, ...data }) => put(url, data, { params: { collectionId } });

export const getCollections = ({ userId } = {}) => get(url, { params: { userId } });

export const getCollectionDetail = ({ userId, collectionId } = {}) =>
  get(`${url}/detail`, { params: { userId, collectionId } });

export const deleteCollection = ({ collectionId } = {}) => del(url, { params: { collectionId } });

export const addCollectionItem = (data) => post(itemUrl, data);

export const updateCollectionItemNote = (data) => put(`${itemUrl}/note`, data);

export const deleteCollectionItem = ({ collectionId, mangaPath } = {}) =>
  del(itemUrl, { params: { collectionId, mangaPath } });

export const getCollectionCount = ({ userId } = {}) => get(`${url}/count`, { params: { userId } });

