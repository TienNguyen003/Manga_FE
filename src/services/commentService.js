import { get, post, del } from '~/lib/httpRequest';

const url = '/mangas/comments';

export const getComments = ({ mangaPath, chapterName, currentUserId }) => get(url, { params: { mangaPath, chapterName, currentUserId } });

export const getReplies = ({ parentCommentId, currentUserId }) => get(`${url}/replies`, { params: { parentCommentId, currentUserId } });

export const postComment = (data) => post(url, data);

export const likeComment = (data) => post(`${url}/like`, data);

export const unlikeComment = (data) => post(`${url}/unlike`, data);

export const deleteComment = ({ commentId, userId }) => del(url, { params: { commentId, userId } });
