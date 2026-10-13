/**
 * USERS & PROFILE
 *
 * ⚠️ `/users` is one of the two 1-BASED paginated endpoints (Rule 2). It takes
 * `pageNumber` (starts at 1 — the backend shifts it to 0 itself) together with
 * `limit`, and returns `{ content, page, ..., hasNext }`. Every OTHER endpoint
 * in the app uses `page` from 0.
 *
 * ⚠️ `users.status` is a NUMBER: `0` = active, `1` = banned. Never compare it
 * with a boolean — `status === true` is always false and silently treats every
 * account as banned (or active, depending on the check).
 *
 * Rule 8: `POST /users/change-password` is canonical; the `PUT` form is deprecated.
 */
import { get, post, put, del } from '~/lib/httpRequest';

const url = '/users';

/* ------------------------------------------------------------------ *
 * Status helpers — `status` is 0/1, never a boolean
 * ------------------------------------------------------------------ */
export const USER_STATUS_ACTIVE = 0;
export const USER_STATUS_BANNED = 1;

export const isUserActive = (user) => Number(user?.status) === USER_STATUS_ACTIVE;
export const isUserBanned = (user) => Number(user?.status) === USER_STATUS_BANNED;

export const userService = {
  /* --- profile --- */
  /** `GET /users/myInfo` -> includes `status` and `roles[]`. */
  getProfile: () => get(`${url}/myInfo`),

  /** Another reader's public profile. */
  getUserProfile: ({ userId } = {}) => get(`${url}/user`, { params: { userId } }),

  /** `PUT /users?id=&name=&email=` */
  updateProfile: ({ id, name, email, ...rest } = {}) => put(url, rest, { params: { id, name, email } }),

  /** Rule 8: POST is canonical. */
  changePassword: (data) => post(`${url}/change-password`, data),

  /* --- display settings --- */
  getMySettings: () => get(`${url}/profile-setting/my`),
  createSettings: (data) => post(`${url}/profile-setting`, data),
  updateSettings: ({ userId, ...data } = {}) => put(`${url}/profile-setting`, data, { params: { userId } }),

  /* --- administration --- */
  /**
   * ⚠️ 1-BASED `pageNumber`, paired with `limit`; returns a page object.
   *   admin: `pageNumber: 1`
   */
  getAllUsersWithParams: ({ pageNumber = 1, limit = 20, ...rest } = {}) =>
    get(url, { params: { pageNumber, limit, ...rest } }),

  getAllUsers: () => get(url),

  getUserById: ({ userId } = {}) => get(`${url}/user`, { params: { userId } }),

  createUser: (data) => post(url, data),

  updateUser: ({ id, ...data } = {}) => put(url, data, { params: { id } }),

  updatePassword: (data) => post(`${url}/change-password`, data),

  resetPassword: (data) => put(`${url}/reset-password`, data),

  /**
   * `PUT /users/status?id=&status=` — `0` active, `1` banned.
   * Broadcasting on `/topic/updateStt` is the server's job.
   *
   * ⚠️ An admin CANNOT ban themselves: the backend answers
   * `403 FORBIDDEN_RESOURCE`. Disable the control in the UI instead.
   */
  updateStatus: ({ id, status } = {}) => put(`${url}/status`, null, { params: { id, status } }),

  deleteUser: ({ id } = {}) => del(url, { params: { id } }),
};

export default userService;

