let socket;

export const connectWebSocket = () => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket('wss://chic-chicken-oss-929342691ddb.herokuapp.com/');
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onclose = () => {
      console.log('WebSocket closed. Attempting to reconnect...');
      setTimeout(() => connectWebSocket(), 5000);  // Retry after 5 seconds
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  return socket;
};
