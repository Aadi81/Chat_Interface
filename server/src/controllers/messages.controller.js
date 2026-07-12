const db = require('../db');

const MAX_MESSAGE_LENGTH = 2000;

function getHistory({ limit = 50, before } = {}) {
  const safeLimit = Math.min(Number(limit) || 50, 200);

  const rows = before
    ? db
        .prepare(
          'SELECT id, username, text, created_at FROM messages WHERE id < ? ORDER BY id DESC LIMIT ?'
        )
        .all(before, safeLimit)
    : db
        .prepare(
          'SELECT id, username, text, created_at FROM messages ORDER BY id DESC LIMIT ?'
        )
        .all(safeLimit);

  return rows.reverse();
}

function createMessage({ username, text }) {
  const trimmedUsername = String(username || '').trim();
  const trimmedText = String(text || '').trim();

  if (!trimmedUsername) {
    throw new ValidationError('username is required');
  }
  if (!trimmedText) {
    throw new ValidationError('text is required');
  }
  if (trimmedText.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(`text must be under ${MAX_MESSAGE_LENGTH} characters`);
  }

  const info = db
    .prepare('INSERT INTO messages (username, text) VALUES (?, ?)')
    .run(trimmedUsername, trimmedText);

  return db
    .prepare('SELECT id, username, text, created_at FROM messages WHERE id = ?')
    .get(info.lastInsertRowid);
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

module.exports = { getHistory, createMessage, ValidationError };
