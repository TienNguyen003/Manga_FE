/**
 * USER CONTEXT — who is signed in, and the unread badge count.
 *
 * The session itself lives in `~/lib/authStorage` so that the axios
 * interceptors, this context and the login screen can never disagree about
 * which token is current. This provider mirrors that state into React and adds
 * the derived flags the screens need.
 */
import React, { createContext, useCallback, useContext, useState } from 'react';

import { clearAuth, getStoredProfile, setSession } from '~/lib/authStorage';

const UserContext = createContext(null);

/** `users.status` is 0/1 — comparing it to a boolean is always wrong. */
export const USER_STATUS_ACTIVE = 0;
export const USER_STATUS_BANNED = 1;

export function UserProvider({ children }) {
  const initial = getStoredProfile();

  const [userId, setUserId] = useState(initial.userId);
  const [username, setUsername] = useState(initial.username);
  const [userAvatar, setUserAvatar] = useState(initial.userAvatar);
  const [userData, setUser] = useState(initial.userData);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Persist a successful sign-in.
   * @param {object} auth `data.result` from `POST /auth/token`
   */
  const login = useCallback((auth = {}) => {
    setSession({
      token: auth.token,
      // Rule 4: the refresh token MUST be stored too, otherwise the next
      // silent refresh replays a consumed token and fails with TOKEN_REVOKED.
      refreshToken: auth.refreshToken,
      id: auth.id,
      username: auth.username,
      urlImage: auth.urlImage,
      user: auth,
    });

    const avatar = auth.urlImage || 'https://via.placeholder.com/40';
    setUserId(auth.id !== undefined && auth.id !== null ? String(auth.id) : null);
    setUsername(auth.username || '');
    setUserAvatar(avatar);
    setUser(auth);
  }, []);

  /** Clear the session in both storage and React state. */
  const logout = useCallback(() => {
    clearAuth();
    setUserId(null);
    setUsername('');
    setUserAvatar('');
    setUser(null);
    setUnreadCount(0);
  }, []);

  const isLoggedIn = Boolean(userId);

  /** `status === 1` means an admin locked this account. */
  const isBanned = Number(userData?.status) === USER_STATUS_BANNED;

  const value = {
    userId,
    username,
    userAvatar,
    userData,
    unreadCount,
    isLoggedIn,
    isBanned,
    setUnreadCount,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

