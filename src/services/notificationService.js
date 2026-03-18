import { get, put, del } from '~/lib/httpRequest';

const url = '/notifications';

export const getNotifications = ({ userId, isRead, pageNumber = 1, pageSize = 20 }) => get(url, { params: { userId, isRead, pageNumber, pageSize } });

export const getUnreadCount = (userId) => get(`${url}/unread-count`, { params: { userId } });

export const markRead = (userId, notificationId) => put(`${url}/read`, null, { params: { userId, notificationId } });

export const markAllRead = (userId) => put(`${url}/read-all`, null, { params: { userId } });

export const deleteNotification = ({ userId, notificationId }) => del(url, { params: { userId, notificationId } });

export const deleteAllNotifications = ({ userId }) => del(`${url}/all`, { params: { userId } });
