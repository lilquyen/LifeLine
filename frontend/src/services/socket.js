import { io } from 'socket.io-client'
import { locals } from '../../../backend/app';

let socket;

export const connectSocket = () => {
    const token = localStorage.getItem('token');

    socket = io(import.meta.env.VITE_API_URL, {
        auth: { token }
      });
    
      socket.on('connect', () => console.log('Socket connected'));
      socket.on('connect_error', (err) => console.log('Socket error:', err.message));
    
      return socket;
    };
    
    export const getSocket = () => socket;
    export const disconnectSocket = () => socket?.disconnect();