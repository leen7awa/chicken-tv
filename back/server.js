const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');  // Import the CORS middleware
const Order = require('./orderSchema'); // Import the Mongoose order model

const app = express();
const port = process.env.PORT || 8081;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from the frontend
  methods: ['GET', 'POST'],  // Allow only GET and POST methods
}));

// MongoDB connection setup
mongoose.connect('mongodb+srv://leenhawa670:UNguIsj3lR1DCYZb@cluster0.zhlfc.mongodb.net/restaurantOrdersDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server instance
const wss = new WebSocket.Server({ server });

// WebSocket connection logic
wss.on('connection', async (ws) => {
  console.log('New client connected');

  try {
    // Fetch current orders from MongoDB and send to the client
    const orders = await Order.find();
    ws.send(JSON.stringify(orders));
  } catch (error) {
    console.error('Error fetching orders:', error);
    ws.send(JSON.stringify({ error: 'Failed to load orders' }));
  }

  ws.on('message', async (message) => {
    console.log(`Received: ${message}`);

    // Parse the incoming message as JSON
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
          client.send(JSON.stringify(updatedOrders));
        }
      });
    } catch (error) {
      console.error('Error saving order to MongoDB:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
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

app.post('/createOrder', async (req, res) => {
  const { orderNumber, customerName, orderItems } = req.body;

  // Validate required fields
  if (!orderNumber || !customerName || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or invalid data' });
  }

  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    console.log('Order saved successfully:', newOrder);
    res.status(201).json({ message: 'Order created', order: newOrder });
  } catch (error) {
    console.error('Error while creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
