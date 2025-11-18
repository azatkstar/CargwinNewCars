import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || 'http://localhost:8001';
    const newSocket = io(BACKEND_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
};

export default useWebSocket;
