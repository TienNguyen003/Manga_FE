/**
 * REALTIME — SockJS + STOMP client (Rule 6).
 *
 * The server only ever pushes; the frontend never publishes. Connecting needs
 * no token. The tricky part is lifecycle: `connectStomp()` is async, so a
 * `subscribe()` called straight after it would silently do nothing because the
 * socket is not connected yet. Every call here therefore registers a pending
 * subscription that is attached automatically on connect and torn down by the
 * returned `unsubscribe()` — components must call that on unmount or the
 * handlers keep firing against dead state.
 */
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const WS_TOPICS = {
  comments: (mangaPath) => `/topic/comments/${mangaPath}`,
  commentReaction: (commentId) => `/topic/comments/reaction/${commentId}`,
  commentPost: (id) => `/topic/comments/post/${id}`,
  notifications: (userId) => `/topic/notifications/${userId}`,
  login: '/topic/login',
  updateStatus: '/topic/updateStt',
};

let stompClient = null;
/** Subscriptions registered before the socket finished connecting. */
let pending = [];

export const connectStomp = ({ onConnect, onDisconnect } = {}) => {
  const wsUrl = process.env.REACT_APP_WS_URL;
  if (!wsUrl) {
    console.warn('[realtime] REACT_APP_WS_URL chưa được cấu hình. Tính năng realtime bị tắt.');
    return null;
  }

  // Re-connecting would orphan the previous socket's subscriptions.
  if (stompClient) return stompClient;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    reconnectDelay: 5000,
    onConnect: () => {
      // Flush everything registered while the socket was still handshaking.
      const queued = pending;
      pending = [];
      queued.forEach((entry) => entry.attach());
      onConnect?.();
    },
    onDisconnect: () => {
      onDisconnect?.();
    },
    onStompError: (frame) => {
      console.error('[realtime] STOMP error', frame?.headers?.message);
    },
  });

  stompClient.activate();
  return stompClient;
};

/**
 * Subscribe to a topic. Returns a handle with `unsubscribe()` — always call it
 * in the effect cleanup. Safe to call before the socket is connected.
 */
export const subscribe = (topic, callback) => {
  if (!stompClient) {
    console.warn('[realtime] subscribe trước khi connect — sẽ không nhận được message');
    return { unsubscribe: () => {} };
  }

  const handle = { topic, callback, subscription: null };

  handle.attach = () => {
    if (!stompClient?.connected || handle.subscription) return;
    handle.subscription = stompClient.subscribe(topic, (msg) => {
      try {
        callback(JSON.parse(msg.body));
      } catch {
        callback(msg.body);
      }
    });
  };

  handle.detach = () => {
    pending = pending.filter((entry) => entry !== handle);
    try {
      handle.subscription?.unsubscribe();
    } catch {
      /* already torn down by the socket */
    }
    handle.subscription = null;
  };

  if (stompClient.connected) handle.attach();
  else pending.push(handle);

  return { unsubscribe: handle.detach };
};

export const disconnectStomp = () => {
  pending = [];
  stompClient?.deactivate();
  stompClient = null;
};

export const getStompClient = () => stompClient;
