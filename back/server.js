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
  .catch(err => console.error('MongoDB connection error:', err));;


// MongoDB connection setup
// mongoose.connect('mongodb+srv://leenhawa670:UNguIsj3lR1DCYZb@cluster0.zhlfc.mongodb.net/restaurantOrdersDB?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server instance
const wss = new WebSocket.Server({ server });

// WebSocket connection logic
wss.on('connection', async (ws) => {
  console.log('New client connected');

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => ws.isAlive = true);

    setInterval(() => {
      wss.clients.forEach((client) => {
        if (!client.isAlive) return client.terminate();
        client.isAlive = false;
        client.ping();
      });
    }, 30000); // Ping every 30 seconds
  });


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

  // Send an immediate response to avoid Heroku timeout
  res.status(202).json({ message: 'Order received and is being processed.' });

  // Handle the actual database operation in the background
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    console.log('Order saved successfully:', newOrder);
  } catch (error) {
    console.error('Error while creating order:', error);
  }
});


// Start the server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
