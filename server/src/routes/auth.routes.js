const { Router } = require('express');

const router = Router();

// Dummy auth: any non-empty username "logs in". No password, no session token.
router.post('/login', (req, res) => {
  const username = String((req.body || {}).username || '').trim();

  if (!username) {
    return res.status(400).json({ error: 'username is required' });
  }
  if (username.length > 30) {
    return res.status(400).json({ error: 'username must be under 30 characters' });
  }

  res.json({ user: { username } });
});

module.exports = router;
