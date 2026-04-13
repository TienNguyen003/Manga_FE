import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

function getInitialUser() {
  const storedUserId = localStorage.getItem('userId');
  const storedUsername = localStorage.getItem('username');
  const storedUserAvatar = localStorage.getItem('userAvatar');
  const storedUser = localStorage.getItem('user');

  if (storedUserId) {
    return {
      userId: storedUserId,
      username: storedUsername || '',
      userAvatar: storedUserAvatar || '',
      userData: storedUser ? JSON.parse(storedUser) : null,
    };
  }

  return {
    userId: null,
    username: '',
    userAvatar: '',
    userData: null,
  };
}

export function UserProvider({ children }) {
  const initialUser = getInitialUser();
  const [userId, setUserId] = useState(initialUser.userId);
  const [username, setUsername] = useState(initialUser.username);
  const [userAvatar, setUserAvatar] = useState(initialUser.userAvatar);
  const [userData, setUser] = useState(initialUser.userData);
  const [unreadCount, setUnreadCount] = useState(0);

  const login = (id, name, avatar, user) => {
    localStorage.setItem('userId', String(id));
    localStorage.setItem('username', name || '');
    localStorage.setItem('userAvatar', avatar || 'https://via.placeholder.com/40');
    localStorage.setItem('user', JSON.stringify(user));
    setUserId(String(id));
    setUsername(name || '');
    setUserAvatar(avatar || 'https://via.placeholder.com/40');
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('user');
    setUserId(null);
    setUsername('');
    setUnreadCount(0);
    setUserAvatar('');
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        username,
        userAvatar,
        userData,
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
