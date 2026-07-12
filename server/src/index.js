require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const buildMessagesRouter = require('./routes/messages.routes');
const authRouter = require('./routes/auth.routes');
const { registerSocketHandlers } = require('./sockets');

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/messages', buildMessagesRouter(io));

// Centralized error handler for anything thrown/passed via next(err) in routes above.
app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Chat server listening on http://localhost:${PORT}`);
});
