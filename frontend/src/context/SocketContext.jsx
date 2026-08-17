import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const SocketContext = createContext(null);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, adminUser, logout } = useContext(AuthContext);
  // Use adminUser if user is not present (for admin dashboard)
  const activeUser = user || adminUser;
  
  const socketRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveNotifications, setLiveNotifications] = useState([]); // latest notifications from socket

  // Fetch initial unread count from API
  const fetchUnreadCount = useCallback(async () => {
    if (!activeUser) { setUnreadCount(0); return; }
    try {
      const { data } = await axios.get('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${activeUser.token}` }
      });
      setUnreadCount(data.count || 0);
    } catch (err) {
      // Silently fail — not critical
    }
  }, [activeUser]);

  const setupWebPush = useCallback(async () => {
    if (!activeUser || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const register = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let subscription = await register.pushManager.getSubscription();
      if (!subscription) {
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) return;

        subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      }

      await axios.post('/api/notifications/subscribe', subscription, {
        headers: { Authorization: `Bearer ${activeUser.token}` }
      });
    } catch (error) {
      console.error('Failed to setup Web Push:', error);
    }
  }, [activeUser]);

  useEffect(() => {
    fetchUnreadCount();
    setupWebPush();
  }, [fetchUnreadCount, setupWebPush]);

  useEffect(() => {
    if (!activeUser) {
      // Disconnect socket when logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setUnreadCount(0);
      setLiveNotifications([]);
      return;
    }

    // Connect to Socket.IO server
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      
      // Extract sessionId from JWT token
      let sessionId = null;
      if (activeUser.token) {
        try {
          const base64Url = activeUser.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          sessionId = payload.sessionId;
        } catch (e) {
          console.warn('Failed to parse sessionId from token', e);
        }
      }

      // Join the user's private room and session room
      socket.emit('join', { userId: activeUser.id, sessionId });
    });

    socket.on('notification', (notif) => {
      console.log('📨 Received real-time notification:', notif);
      // Increase unread count
      setUnreadCount(prev => prev + 1);
      // Add to live notifications list (for in-page display if on notifications tab)
      setLiveNotifications(prev => [notif, ...prev]);

      // Play notification sound
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.log('Audio autoplay prevented by browser', e));
      } catch (err) {
        console.error('Error playing sound', err);
      }
    });

    socket.on('force_logout', () => {
      console.log('🔌 Received force_logout from server. Logging out immediately.');
      logout();
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeUser]);

  // Call this when user reads notifications (to reset count)
  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Decrement unread count by 1
  const decrementUnread = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Clear live notifications (e.g. when navigating to notifications page)
  const clearLiveNotifications = useCallback(() => {
    setLiveNotifications([]);
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      unreadCount,
      setUnreadCount,
      resetUnreadCount,
      decrementUnread,
      liveNotifications,
      clearLiveNotifications,
      fetchUnreadCount,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
