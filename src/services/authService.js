/**
 * AUTH — Rule 8: always use the `GET` aliases, never the deprecated `POST` ones.
 *
 *   POST /auth/token                 -> login, returns token + refreshToken
 *   GET  /auth/introspect?token=     -> { valid, userId, username, roles[] }
 *   GET  /auth/refresh?token=        -> ROTATES: new token + new refreshToken
 *   GET  /auth/logout                -> revokes the current session
 *
 * Rule 4: the refresh response carries BOTH tokens. Callers must persist both
 * via `setSession` — saving only the access token makes the next refresh
 * replay a consumed refresh token and fail with `401 TOKEN_REVOKED`.
 */
import { get, post } from '~/lib/httpRequest';
import { getRefreshToken, setSession } from '~/lib/authStorage';

const url = '/auth';

/** `POST /auth/token` -> `data.result` = { id, username, urlImage, token, refreshToken, roles[], status } */
export const login = (credentials) => post(`${url}/token`, credentials);

/** `GET /auth/introspect` — the GET form; POST is deprecated. */
export const introspect = (token) => get(`${url}/introspect`, { params: { token } });

/**
 * Rotate the session. Returns `true` when a new pair was stored.
 * Uses the stored refresh token when none is supplied.
 */
export async function refreshSession(refreshToken = getRefreshToken()) {
  if (!refreshToken) return false;
  const { data } = await get(`${url}/refresh`, { params: { token: refreshToken } });
  const result = data?.result;
  if (!result?.token || !result?.refreshToken) return false;
  setSession({ token: result.token, refreshToken: result.refreshToken });
  return true;
}

/** `GET /auth/logout` — the GET form; POST is deprecated. */
export const logout = () => get(`${url}/logout`);

