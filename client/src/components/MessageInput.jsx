import { useState, useRef } from 'react';
import EmojiPicker from './EmojiPicker';

export default function MessageInput({ onSend, onTyping, disabled }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      await onSend(trimmed);
      setText('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? text.length;
    const end = input?.selectionEnd ?? text.length;
    const nextText = text.slice(0, start) + emoji + text.slice(end);

    setText(nextText);
    onTyping();
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      input?.focus();
      const cursor = start + emoji.length;
      input?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      {error && <p className="message-input-error">{error}</p>}
      <div className="message-input-row">
        <div className="emoji-picker-anchor">
          <button
            type="button"
            className="emoji-toggle"
            disabled={disabled}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Insert emoji"
          >
            😊
          </button>
          {showEmojiPicker && (
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          maxLength={2000}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !text.trim()}>
          Send
        </button>
      </div>
    </form>
  );
}