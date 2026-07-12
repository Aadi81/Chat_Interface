import { useEffect, useRef } from 'react';

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😜', '🤔', '😎',
  '😅', '😢', '😭', '😡', '😱', '🥳', '😴', '🤗', '🙄', '😇',
  '👍', '👎', '👏', '🙌', '🙏', '💪', '👋', '✌️', '🤝', '👌',
  '❤️', '🔥', '🎉', '✨', '💯', '⭐', '💔', '😻', '🥰', '🤝',
];

export default function EmojiPicker({ onSelect, onClose }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="emoji-picker" ref={pickerRef}>
      {EMOJIS.map((emoji, i) => (
        <button
          key={`${emoji}-${i}`}
          type="button"
          className="emoji-option"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}