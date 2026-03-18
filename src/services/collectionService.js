import { get, post, put, del } from '~/lib/httpRequest';

const url = '/mangas/collections';
const itemUrl = '/mangas/collections/items';

export const createCollection = (data) => post(url, data);

export const updateCollection = ({ collectionId, ...data }) => put(url, data, { params: { collectionId } });

export const getCollections = ({ userId }) => get(url, { params: { userId } });

export const getCollectionDetail = ({ userId, collectionId }) => get(`${url}/detail`, { params: { userId, collectionId } });

export const deleteCollection = ({ userId, collectionId }) => del(url, { params: { userId, collectionId } });

export const addCollectionItem = (data) => post(itemUrl, data);

export const updateCollectionItemNote = (data) => put(`${itemUrl}/note`, data);

export const deleteCollectionItem = ({ userId, collectionId, mangaPath }) => del(itemUrl, { params: { userId, collectionId, mangaPath } });

export const getCollectionCount = ({ userId }) => get(`${url}/count`, { params: { userId } });
