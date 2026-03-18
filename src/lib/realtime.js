import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const WS_TOPICS = {
  comments: (mangaPath) => `/topic/comments/${mangaPath}`,
  commentReaction: (commentId) => `/topic/comments/reaction/${commentId}`,
  notifications: (userId) => `/topic/notifications/${userId}`,
  login: '/topic/login',
  updateStatus: '/topic/updateStt',
};

let stompClient = null;

export const connectStomp = ({ onConnect, onDisconnect } = {}) => {
  const wsUrl = process.env.REACT_APP_WS_URL;
  if (!wsUrl) {
    console.warn('[realtime] REACT_APP_WS_URL chưa được cấu hình. Tính năng realtime bị tắt.');
    return null;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    reconnectDelay: 5000,
    onConnect: () => {
      onConnect?.();
    },
    onDisconnect: () => {
      onDisconnect?.();
    },
    onStompError: (frame) => {
      console.error('[realtime] STOMP error', frame);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const subscribe = (topic, callback) => {
  if (!stompClient?.connected) return null;
  return stompClient.subscribe(topic, (msg) => {
    try {
      callback(JSON.parse(msg.body));
    } catch {
      callback(msg.body);
    }
  });
};

export const disconnectStomp = () => {
  stompClient?.deactivate();
  stompClient = null;
};

export const getStompClient = () => stompClient;
