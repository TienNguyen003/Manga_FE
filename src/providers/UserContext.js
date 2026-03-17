import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

const ENABLE_FAKE_LOGIN = process.env.REACT_APP_FAKE_LOGIN !== 'false';
const DEFAULT_FAKE_USER_ID = process.env.REACT_APP_FAKE_USER_ID || 'fa5f0fba-ea9b-477d-98bf-709597fcdfef';
const DEFAULT_FAKE_USERNAME = process.env.REACT_APP_FAKE_USERNAME || 'Khach demo';

function getInitialUser() {
  const storedUserId = localStorage.getItem('userId');
  const storedUsername = localStorage.getItem('username');

  if (storedUserId) {
    return {
      userId: storedUserId,
      username: storedUsername || '',
      isFakeUser: false,
    };
  }

  if (ENABLE_FAKE_LOGIN) {
    return {
      userId: DEFAULT_FAKE_USER_ID,
      username: DEFAULT_FAKE_USERNAME,
      isFakeUser: true,
    };
  }

  return {
    userId: null,
    username: '',
    isFakeUser: false,
  };
}

export function UserProvider({ children }) {
  const initialUser = getInitialUser();
  const [userId, setUserId] = useState(initialUser.userId);
  const [username, setUsername] = useState(initialUser.username);
  const [isFakeUser, setIsFakeUser] = useState(initialUser.isFakeUser);
  const [unreadCount, setUnreadCount] = useState(0);

  const login = (id, name) => {
    localStorage.setItem('userId', String(id));
    localStorage.setItem('username', name || '');
    setUserId(String(id));
    setUsername(name || '');
    setIsFakeUser(false);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUserId(null);
    setUsername('');
    setIsFakeUser(false);
    setUnreadCount(0);
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        username,
        unreadCount,
        isFakeUser,
        isLoggedIn: Boolean(userId),
        setUnreadCount,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
