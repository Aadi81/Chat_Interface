import { io } from 'socket.io-client';
import { SERVER_URL } from './http';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, { autoConnect: false });
  }
  return socket;
}
