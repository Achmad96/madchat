import { io } from 'socket.io-client';
import { API_URL } from '@/configs/API';

export const socket = io(API_URL, {
  auth: {
    token: localStorage.getItem('token') || ''
  }
});
