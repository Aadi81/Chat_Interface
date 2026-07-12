/**
 * Tracks which username each connected socket belongs to, so we can
 * broadcast an accurate online-user list and clean up on disconnect.
 */
const onlineUsers = new Map(); // socket.id -> username

function broadcastOnlineUsers(io) {
  const usernames = [...new Set(onlineUsers.values())];
  io.emit('users:online', usernames);
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('user:join', (username) => {
      const trimmed = String(username || '').trim();
      if (!trimmed) return;

      onlineUsers.set(socket.id, trimmed);
      socket.data.username = trimmed;
      broadcastOnlineUsers(io);
    });

    socket.on('typing:start', () => {
      const username = socket.data.username;
      if (!username) return;
      socket.broadcast.emit('typing:update', { username, isTyping: true });
    });

    socket.on('typing:stop', () => {
      const username = socket.data.username;
      if (!username) return;
      socket.broadcast.emit('typing:update', { username, isTyping: false });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      broadcastOnlineUsers(io);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
    });
  });
}

module.exports = { registerSocketHandlers };
