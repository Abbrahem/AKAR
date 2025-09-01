import { create } from 'zustand';
import io from 'socket.io-client';

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (userId) => {
    const socketURL = process.env.REACT_APP_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-url.herokuapp.com' 
        : 'http://localhost:5000');
    const socket = io(socketURL);
    
    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    set({ socket });
    return socket;
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emit: (event, data) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  },

  on: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.off(event, callback);
    }
  }
}));

export { useSocketStore };
