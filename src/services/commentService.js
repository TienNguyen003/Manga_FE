/**
 * COMMENTS — `page` is 0-BASED and `result` is a plain array (Rule 2).
 *
 * `GET /mangas/comments?mangaPath=&page=&limit=`   -> Comment[]
 * `GET /mangas/comments/replies?commentId=`          -> Comment[] (flat —
 *                                                          the tree is built FE-side)
 * POST/PUT/DELETE /mangas/comments
 * POST /mangas/comments/like · /unlike
 *
 * Rule 3: `currentUserId` is a read-only convenience flag. Writes must NOT send
 * a `userId` that could disagree with the JWT (`403 USER_ID_MISMATCH`), so the
 * helpers below strip it from bodies.
 */
import { get, post, put, del } from '~/lib/httpRequest';

const url = '/mangas/comments';

/** `page` starts at 0. */
export const getComments = ({ mangaPath, chapterName, currentUserId, page = 0, limit = 20 } = {}) =>
  get(url, { params: { mangaPath, chapterName, currentUserId, page, limit } });

/** Flat list — build the reply tree in the UI. */
export const getReplies = ({ parentCommentId, commentId, currentUserId } = {}) =>
  get(`${url}/replies`, { params: { parentCommentId, commentId, currentUserId } });

/** Strip the caller id from a write body — the JWT is authoritative. */
const withoutUserId = ({ userId, ...body } = {}) => body;

export const postComment = (data) => post(url, withoutUserId(data));

export const updateComment = (data) => put(url, withoutUserId(data));

export const likeComment = (data) => post(`${url}/like`, withoutUserId(data));

export const unlikeComment = (data) => post(`${url}/unlike`, withoutUserId(data));

export const deleteComment = ({ commentId } = {}) => del(url, { params: { commentId } });

