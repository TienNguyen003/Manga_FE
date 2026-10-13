/**
 * AUTH STORAGE — single source of truth for the three values the backend reads
 * off every request.
 *
 *   token         -> `Authorization: Bearer <token>`   (required for writes)
 *   refreshToken  -> `GET /auth/refresh?token=`        (ROTATING, see below)
 *   userId        -> `X-User-Id`                       (anonymous reads only)
 *
 * WHY THIS IS A SEPARATE MODULE
 * -----------------------------
 * `httpRequest` (interceptors), `UserContext` (session state) and the auth
 * screens all need these three values. Centralising them keeps Rule 3 and
 * Rule 4 from drifting apart — the single biggest source of
 * `403 USER_ID_MISMATCH` and `401 TOKEN_REVOKED` bugs.
 *
 * ROTATING REFRESH TOKENS
 * ----------------------
 * Every `/auth/refresh` returns a NEW access token **and** a NEW refresh token.
 * Replaying a consumed refresh token fails with `401 TOKEN_REVOKED` and forces
 * a full re-login, so `setSession` always writes both together.
 */

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';
const USERNAME_KEY = 'username';
const USER_AVATAR_KEY = 'userAvatar';
const USER_KEY = 'user';

/** localStorage can throw (Safari private mode, sandboxed iframe). Never crash. */
const safeGet = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(value));
  } catch {
    /* storage unavailable — the session simply won't survive a reload */
  }
};

export const getToken = () => safeGet(TOKEN_KEY);
export const getRefreshToken = () => safeGet(REFRESH_TOKEN_KEY);

/** `userId` is stored as a string by UserContext but must go out as-is. */
export const getUserId = () => safeGet(USER_ID_KEY);

export const isAuthenticated = () => Boolean(safeGet(TOKEN_KEY));

/**
 * Persist a session. Pass `refreshToken` on every login AND every refresh —
 * `POST /auth/token` and `GET /auth/refresh` both return the pair.
 */
export function setSession({ token, refreshToken, id, username, urlImage, user } = {}) {
  if (token) safeSet(TOKEN_KEY, token);
  if (refreshToken) safeSet(REFRESH_TOKEN_KEY, refreshToken);
  if (id !== undefined && id !== null) safeSet(USER_ID_KEY, id);
  if (username !== undefined) safeSet(USERNAME_KEY, username || '');
  if (urlImage !== undefined) safeSet(USER_AVATAR_KEY, urlImage || '');
  if (user !== undefined) safeSet(USER_KEY, JSON.stringify(user ?? {}));
}

/** Read-only display fields UserContext hydrates from. */
export function getStoredProfile() {
  const raw = safeGet(USER_KEY);
  let user = null;
  try {
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }
  return {
    userId: safeGet(USER_ID_KEY),
    username: safeGet(USERNAME_KEY) || '',
    userAvatar: safeGet(USER_AVATAR_KEY) || '',
    userData: user,
  };
}

/**
 * Drop the session.
 *
 * NOTE — deliberately NOT `localStorage.clear()`: that would also wipe the
 * `cmx:*` reading-progress / reader-settings namespace, so a single expired
 * token would silently reset a reader's streak, goal and bookmarks on reload.
 * We remove exactly the auth keys (the checklist item is "xoa token").
 */
export function clearAuth() {
  [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, USERNAME_KEY, USER_AVATAR_KEY, USER_KEY].forEach((k) => safeSet(k, null));
}
