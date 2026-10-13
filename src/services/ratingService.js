/**
 * RATINGS & REVIEWS — 1 to 5 stars.
 *
 *   POST   /mangas/ratings
 *   GET    /mangas/ratings/summary?mangaPath=&userId=
 *   GET    /mangas/ratings/my?userId=&mangaPath=
 *   GET    /mangas/ratings/reviews?mangaPath=
 *   DELETE /mangas/ratings
 *
 * Rule 3: writes must not send a `userId` (`403 USER_ID_MISMATCH` otherwise).
 */
import { get, post, del } from '~/lib/httpRequest';

const url = '/mangas/ratings';

export const submitRating = (data) => post(url, data);

export const getRatingSummary = ({ mangaPath, userId } = {}) =>
  get(`${url}/summary`, { params: { mangaPath, userId } });

/** `null` result when the reader has not rated this comic yet. */
export const getMyRating = ({ userId, mangaPath } = {}) => get(`${url}/my`, { params: { userId, mangaPath } });

export const getReviews = ({ mangaPath } = {}) => get(`${url}/reviews`, { params: { mangaPath } });

export const deleteRating = ({ mangaPath } = {}) => del(url, { params: { mangaPath } });

