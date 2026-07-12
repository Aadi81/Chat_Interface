function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message-row ${isOwn ? 'own' : ''}`}>
      <div className="message-bubble">
        {!isOwn && <div className="message-author">{message.username}</div>}
        <div className="message-text">{message.text}</div>
        <div className="message-time">{formatTime(message.created_at)}</div>
      </div>
    </div>
  );
}
