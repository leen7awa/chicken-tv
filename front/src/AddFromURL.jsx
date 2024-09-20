import React, { useState, useEffect, useRef } from 'react';

const AddFromURL = () => {
    const [status] = useState(0);  // Default status
    const hasSaved = useRef(false);  // To track if the order is already saved
    const socket = new WebSocket('ws://localhost:8081');  // WebSocket connection

    // Retrieve parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('orderNumber');
    const customerName = urlParams.get('customerName');
    const orderItems = urlParams.get('orderItems');

    const currentDate = new Date().toLocaleString();  // Get current date and time

    useEffect(() => {
        if (!hasSaved.current) {
            if (orderNumber && customerName && orderItems) {
                const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
                const isOrderNumberExists = existingOrders.some(order => order.orderNumber === orderNumber);
    
                if (!isOrderNumberExists) {
                    // Parse the order items and keep only the name
                    const parsedOrderItems = orderItems.split(',').map(item => ({
                        name: item.trim()  // Only store the name of the item
                    }));
    
                    // Create new order object
                    const newOrder = {
                        orderNumber,
                        customerName,
                        orderItems: parsedOrderItems,  // Send only the name for each item
                        date: currentDate,
                        status,
                    };
    
                    // Prevent multiple submissions
                    hasSaved.current = true;

                    // WebSocket: Wait until the connection is open before sending the message
                    socket.onopen = () => {
                        socket.send(JSON.stringify(newOrder));  // Send new order through WebSocket
                    };
    
                    // Send the order data to the backend (MongoDB)
                    submitOrderToDatabase(newOrder);
    
                    // Save new order to localStorage
                    const updatedOrders = [...existingOrders, newOrder];
                    localStorage.setItem('orders', JSON.stringify(updatedOrders));
                } else {
                    console.log(`Order with orderNumber ${orderNumber} already exists.`);
                }
            }
        }
    }, [orderNumber, customerName, orderItems, status, currentDate, socket]);

    // Function to submit the order to the backend
    const submitOrderToDatabase = async (orderDetails) => {
        try {
            const response = await fetch('http://localhost:8081/createOrder', {
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

    return (
        <div className='bg-slate-300 justify justify-center'>
            <div className='container text-center'>
                <p>Order Number: {orderNumber}</p>
                <p>Customer Name: {customerName}</p>
                <p>Order Items: {orderItems}</p>
                <p>Date and Time: {currentDate}</p>
            </div>
        </div>
    );
};

export default AddFromURL;
