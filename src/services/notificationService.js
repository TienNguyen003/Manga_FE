/**
 * NOTIFICATIONS — Rule 2: this is the ONE 1-based paginated endpoint.
 *
 *   pageNumber starts at 1 · pageSize · returns
 *   { content, page, size, totalElements, totalPages, hasNext }
 *
 * Everything else in the app uses `page` starting at 0. Do not "make this
 * consistent" — changing it shifts every page by one.
 *
 * Rule 3: `userId` is sent ONLY on reads (it allows anonymous personalised
 * reads). Writes must never carry a `userId` that could disagree with the JWT,
 * or the backend answers `403 USER_ID_MISMATCH`.
 *
 * `isRead` is 0/1, never a boolean.
 */
import { get, put, del } from '~/lib/httpRequest';

const url = '/notifications';

/** Page numbers are 1-based here. */
export const getNotifications = ({ userId, isRead, pageNumber = 1, pageSize = 20 } = {}) =>
  get(url, { params: { userId, isRead, pageNumber, pageSize } });

export const getUnreadCount = (userId) => get(`${url}/unread-count`, { params: { userId } });

/** Write — no `userId`: the backend reads the caller from the JWT. */
export const markRead = (notificationId) => put(`${url}/read`, null, { params: { notificationId } });

export const markAllRead = () => put(`${url}/read-all`);

export const deleteNotification = ({ notificationId }) => del(url, { params: { notificationId } });

export const deleteAllNotifications = () => del(`${url}/all`);

