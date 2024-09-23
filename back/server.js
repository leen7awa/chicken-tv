const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const Order = require('./orderSchema'); // Import the Mongoose order model

const app = express();
const port = process.env.PORT || 8081;

// Trust the first proxy (Heroku)
app.set('trust proxy', 1);

// Middleware to parse JSON requests
app.use(express.json());

require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server instance
const wss = new WebSocket.Server({ server });

let clients = [];

// WebSocket connection logic
wss.on('connection', async (ws) => {
  console.log('New client connected');
  clients.push(ws);

  // When a new client connects, send them the current orders from the database
  try {
    const orders = await Order.find(); // Fetch current orders from MongoDB
    ws.send(JSON.stringify({ type: 'orders', data: orders }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to load orders' }));
  }

  // Handle incoming messages from clients
  ws.on('message', async (message) => {
    console.log(`Received: ${message}`);

    const orderUpdate = JSON.parse(message);
    const { orderNumber, customerName, orderItems, date, status } = orderUpdate;

    try {
      // Create and save new order to MongoDB
      const newOrder = new Order({
        orderNumber,
        customerName,
        orderItems,
        date,
        status
      });
      await newOrder.save();

      console.log('Order saved to MongoDB:', newOrder);

      // Fetch updated orders and broadcast to all clients
      const updatedOrders = await Order.find();
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'orders', data: updatedOrders }));
        }
      });
    } catch (error) {
      console.error('Error saving order to MongoDB:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws);
  });
});

// REST API to retrieve all orders from MongoDB
app.get('/orders', async (req, res) => {
  try {
    const allOrders = await Order.find();
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving orders from MongoDB' });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
