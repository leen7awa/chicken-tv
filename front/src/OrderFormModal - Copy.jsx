import React, { useState, useEffect, useRef } from "react";
import './modal.css';

const OrderFormModal = ({ onClose, onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderItems, setOrderItems] = useState('');
  const hasSaved = useRef(false);  // To track if the order has already been saved
  const socket = new WebSocket('wss://chic-chicken-oss-929342691ddb.herokuapp.com/');  // WebSocket connection

  const formatDateTime = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = () => {
    const itemsArray = orderItems.split(',').map(item => ({
      name: item.trim()  // Only store the name of the item
    }));

    const newOrder = {
      orderNumber,
      customerName,
      orderItems: itemsArray,  // Send only the name for each item
      date: formatDateTime(),
      status: 0,
    };

    onSubmit(newOrder);
    submitOrderToDatabase(newOrder);  // Save the order to the database
  };

  // Function to submit the order to the backend
  const submitOrderToDatabase = async (orderDetails) => {
    try {
      const response = await fetch('https://chic-chicken-backend.herokuapp.com/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),  // Send the order details as JSON
      });
      const data = await response.json();
      console.log('Order submitted successfully to the database:', data);
    } catch (error) {
      console.error('Error submitting order to the database:', error);
    }
  };

  // This useEffect will handle sending the message via WebSocket and saving to local storage
  useEffect(() => {
    if (!hasSaved.current && orderNumber && customerName && orderItems) {
      const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
      const isOrderNumberExists = existingOrders.some(order => order.orderNumber === orderNumber);

      if (!isOrderNumberExists) {
        const newOrder = {
          orderNumber,
          customerName,
          orderItems: orderItems.split(',').map(item => ({
            name: item.trim()  // Only store the name of the item
          })),
          date: formatDateTime(),
          status: 0,
        };

        const updatedOrders = [...existingOrders, newOrder];
        localStorage.setItem('orders', JSON.stringify(updatedOrders));

        // Emit WebSocket message to inform other components
        socket.onopen = () => {
          socket.send(JSON.stringify(newOrder));
        };

        hasSaved.current = true;
      } else {
        console.log(`Order with orderNumber ${orderNumber} already exists.`);
      }
    }
  }, [orderNumber, customerName, orderItems, socket]);

  return (
    <div className="modal-overlay">
      <div className="flex flex-col text-sm modal-content space-y-2 bg-[#fff2cd] border-2 border-gray-800 p-4">
        <h4>הוסף הזמנה חדשה</h4>
        <div className="flex flex-col space-y-2 text-end">
          <label>
            מספר הזמנה
            <input
              type="text"
              className="border w-full p-2"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </label>
          <label>
            שם לקוח
            <input
              type="text"
              className="border w-full p-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
          <label>
            פריטי הזמנה (מופרדים בפסיקים):
            <input
              type="text"
              className="border w-full p-2 text-end"
              value={orderItems}
              onChange={(e) => setOrderItems(e.target.value)}
              placeholder="לדוגמה: בורגר, צ'יפס, קולה"
            />
          </label>
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            שמור
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFormModal;
