import { get, post } from '~/lib/httpRequest';

const url = '/mangas/ratings';

export const submitRating = (data) => post(url, data);

export const getRatingSummary = ({ mangaPath, userId }) => get(`${url}/summary`, { params: { mangaPath, userId } });

export const getMyRating = ({ userId, mangaPath }) => get(`${url}/my`, { params: { userId, mangaPath } });

export const getReviews = ({ mangaPath }) => get(`${url}/reviews`, { params: { mangaPath } });
