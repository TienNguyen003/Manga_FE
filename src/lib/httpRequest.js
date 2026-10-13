/**
 * HTTP CLIENT — the only axios instance in the app.
 *
 * RESPONSE SHAPE (Rule 1)
 * ----------------------
 * Every backend response — success or error — is the same envelope:
 *   { success, code, message, result, errors, timestamp, path }
 *
 * The response interceptor returns the **full axios response**, so callers
 * always read exactly one level of `data` before `result`:
 *
 *   const { data } = await getMangaDetail({ path: slug });
 *   const manga = data.result;
 *
 * Never `res.result` (skips the axios layer) and never `res.data.result`
 * (double unwrap). `result` is null for empty payloads, never a bare array,
 * so pair it with `?? []` — see `unwrapList` below.
 */
import axios from 'axios';
import { toast } from 'react-toastify';
import { clearAuth, getRefreshToken, getToken, getUserId, setSession } from '~/lib/authStorage';

const httpRequest = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

/* ------------------------------------------------------------------ *
 * Request — Rule 3: auth headers
 * ------------------------------------------------------------------ */

httpRequest.interceptors.request.use(
  (config) => {
    // Writes REQUIRE a JWT. Reads also work with X-User-Id alone (anonymous).
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const userId = getUserId();
    if (userId) config.headers['X-User-Id'] = userId;

    return config;
  },
  (error) => Promise.reject(error),
);

/* ------------------------------------------------------------------ *
 * Session rotation — Rule 4
 * ------------------------------------------------------------------ */

/**
 * One in-flight refresh shared by every concurrent 401, so a page that fires
 * six requests at once does not consume six refresh tokens (which would revoke
 * itself and log the user out).
 */
let refreshInFlight = null;

async function rotateSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        // Bare axios on purpose: this bypasses these interceptors, so a 401
        // here can never recurse back into the refresh path.
        const { data } = await axios.get('/auth/refresh', {
          baseURL: process.env.REACT_APP_BASE_URL,
          params: { token: refreshToken },
        });

        const result = data?.result;
        if (!result?.token || !result?.refreshToken) return false;

        // BOTH must be persisted — keeping only the access token guarantees the
        // next refresh replays a consumed token and fails with TOKEN_REVOKED.
        setSession({ token: result.token, refreshToken: result.refreshToken });
        return true;
      } catch (err) {
        console.warn('[http] refresh token thất bại, buộc đăng nhập lại', err?.response?.data?.code);
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

function redirectToLogin(reason) {
  if (typeof window === 'undefined') return;
  // Already on /login — reloading would loop and wipe the form being typed.
  if (window.location.pathname === '/login') return;
  window.location.href = reason ? `/login?reason=${reason}` : '/login';
}

/* ------------------------------------------------------------------ *
 * Response
 * ------------------------------------------------------------------ */

httpRequest.interceptors.response.use(
  // Rule 1: hand back the whole response so callers can destructure `data`.
  (response) => response,

  async (error) => {
    const { response, config } = error;
    const status = response?.status;
    const code = response?.data?.code;

    // Rule 4: a rejected token gets exactly ONE silent refresh + retry.
    // `RATE_LIMITED` is excluded — it's a 429 throttle, not a session problem,
    // and logging the user out mid-login is the classic bug here.
    if (status === 401 && code !== 'RATE_LIMITED') {
      if (config && !config.__retriedAfterRefresh && (await rotateSession())) {
        config.__retriedAfterRefresh = true;
        return httpRequest(config);
      }
      clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    // Admin locked the account -> `users.status === 1`.
    if (code === 'ACCOUNT_BANNED') {
      clearAuth();
      redirectToLogin('banned');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

/* ------------------------------------------------------------------ *
 * Envelope helpers — Rule 1
 * ------------------------------------------------------------------ */

/**
 * Read a list payload. The backend returns `[]` (never null) for empty lists,
 * but `result` itself is null for endpoints with nothing to send, so both
 * sides are normalised here and every list screen gets a renderable array.
 */
export const unwrapList = (response, fallback = []) => {
  const result = response?.data?.result;
  return Array.isArray(result) ? result : fallback;
};

/**
 * Read a paged payload. `/notifications` is 1-based and returns
 * `{ content, page, size, totalElements, totalPages, hasNext }`; `/users` uses
 * the same shape. Everything else returns a bare array — handled by the
 * Array branch. `hasNext` comes from the server; never recompute it here.
 */
export function unwrapPage(response) {
  const result = response?.data?.result;
  if (!result || Array.isArray(result)) {
    return {
      content: Array.isArray(result) ? result : [],
      hasNext: false,
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
    };
  }
  return {
    content: Array.isArray(result.content) ? result.content : [],
    hasNext: Boolean(result.hasNext),
    page: Number(result.page ?? 0),
    size: Number(result.size ?? 0),
    totalElements: Number(result.totalElements ?? 0),
    totalPages: Number(result.totalPages ?? 0),
  };
}

/** Domain error code, e.g. `PAYWALL_LOCKED`, `INSUFFICIENT_COINS`. */
export const errorCode = (error) => error?.response?.data?.code ?? null;

/** Server message (Vietnamese) for toasts — prefer over any generic string. */
export const errorMessage = (error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại!') =>
  error?.response?.data?.message || fallback;

/** Field-level validation errors from `VALIDATION_FAILED`. */
export const errorFields = (error) => error?.response?.data?.errors ?? [];

/* ------------------------------------------------------------------ *
 * Verb helpers — so services import one module, never raw axios
 * ------------------------------------------------------------------ */

export const get = (path, options = {}) => httpRequest.get(path, options);
export const post = (path, data = {}, options = {}) => httpRequest.post(path, data, options);
export const put = (path, data = {}, options = {}) => httpRequest.put(path, data, options);
export const del = (path, options = {}) => httpRequest.delete(path, options);

/** Surface a backend message in a toast — for screens with no local error UI. */
export const toastApiError = (error, fallback) => toast.error(errorMessage(error, fallback));

export default httpRequest;

