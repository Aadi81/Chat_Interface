const { Router } = require('express');
const { getHistory, createMessage, ValidationError } = require('../controllers/messages.controller');

function buildMessagesRouter(io) {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      const { limit, before } = req.query;
      const messages = getHistory({ limit, before });
      res.json({ messages });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });

  router.post('/', (req, res) => {
    try {
      const message = createMessage(req.body || {});
      io.emit('message:new', message);
      res.status(201).json({ message });
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  return router;
}

module.exports = buildMessagesRouter;
