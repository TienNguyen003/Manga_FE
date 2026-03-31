import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

function getInitialUser() {
  const storedUserId = localStorage.getItem('userId');
  const storedUsername = localStorage.getItem('username');
  const storedUserAvatar = localStorage.getItem('userAvatar');

  if (storedUserId) {
    return {
      userId: storedUserId,
      username: storedUsername || '',
      userAvatar: storedUserAvatar || '',
    };
  }

  return {
    userId: null,
    username: '',
    userAvatar: '',
  };
}

export function UserProvider({ children }) {
  const initialUser = getInitialUser();
  const [userId, setUserId] = useState(initialUser.userId);
  const [username, setUsername] = useState(initialUser.username);
  const [userAvatar, setUserAvatar] = useState(initialUser.userAvatar);
  const [unreadCount, setUnreadCount] = useState(0);

  const login = (id, name, avatar) => {
    localStorage.setItem('userId', String(id));
    localStorage.setItem('username', name || '');
    localStorage.setItem('userAvatar', avatar || 'https://via.placeholder.com/40');
    setUserId(String(id));
    setUsername(name || '');
    setUserAvatar(avatar || 'https://via.placeholder.com/40');
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userAvatar');
    setUserId(null);
    setUsername('');
    setUnreadCount(0);
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        username,
        userAvatar,
        unreadCount,
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
