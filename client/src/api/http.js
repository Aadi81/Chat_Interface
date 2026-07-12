const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${SERVER_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new Error('Could not reach the server. Is it running?');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export function login(username) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function fetchMessages() {
  return request('/api/messages');
}

export function sendMessage({ username, text }) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ username, text }),
  });
}

export { SERVER_URL };
