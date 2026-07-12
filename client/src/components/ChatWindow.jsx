import { useEffect, useState, useCallback } from 'react';
import { fetchMessages, sendMessage } from '../api/http';
import { useChatSocket } from '../hooks/useChatSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import OnlineUsersBar from './OnlineUsersBar';

export default function ChatWindow({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loadError, setLoadError] = useState('');
  const { connected, onlineUsers, typingUsers, incomingMessage, notifyTyping } =
    useChatSocket(username);

  useEffect(() => {
    let cancelled = false;
    fetchMessages()
      .then(({ messages: history }) => {
        if (!cancelled) setMessages(history);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!incomingMessage) return;
    setMessages((prev) => {
      if (prev.some((m) => m.id === incomingMessage.id)) return prev;
      return [...prev, incomingMessage];
    });
  }, [incomingMessage]);

  const handleSend = useCallback(
    async (text) => {
      await sendMessage({ username, text });
    },
    [username]
  );

  const visibleTypingUsers = typingUsers.filter((u) => u !== username);

  return (
    <div className="chat-window">
      <header className="chat-header">
        <h2>Realtime Chat</h2>
        <div className="chat-header-right">
          <span className="current-user">{username}</span>
          <button className="logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <OnlineUsersBar
        users={onlineUsers}
        currentUsername={username}
        connected={connected}
      />

      {loadError && <p className="load-error">{loadError}</p>}

      <MessageList messages={messages} currentUsername={username} />

      <TypingIndicator typingUsers={visibleTypingUsers} />

      <MessageInput onSend={handleSend} onTyping={notifyTyping} disabled={!connected} />
    </div>
  );
}
