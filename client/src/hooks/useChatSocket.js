import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../api/socket';

const TYPING_STOP_DELAY = 1500;

export function useChatSocket(username) {
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!username) return undefined;

    const socket = getSocket();
    socket.connect();
    socket.emit('user:join', username);

    const handleConnect = () => {
      setConnected(true);
      socket.emit('user:join', username);
    };
    const handleDisconnect = () => setConnected(false);
    const handleMessage = (message) => setIncomingMessage(message);
    const handleOnlineUsers = (users) => setOnlineUsers(users);
    const handleTyping = ({ username: typingUser, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(typingUser) ? prev : [...prev, typingUser];
        }
        return prev.filter((u) => u !== typingUser);
      });
    };
    const handleConnectError = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message:new', handleMessage);
    socket.on('users:online', handleOnlineUsers);
    socket.on('typing:update', handleTyping);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message:new', handleMessage);
      socket.off('users:online', handleOnlineUsers);
      socket.off('typing:update', handleTyping);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
      clearTimeout(typingTimeoutRef.current);
    };
  }, [username]);

  const notifyTyping = useCallback(() => {
    const socket = getSocket();
    socket.emit('typing:start');
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop');
    }, TYPING_STOP_DELAY);
  }, []);

  return { connected, onlineUsers, typingUsers, incomingMessage, notifyTyping };
}
