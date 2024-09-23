import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AddFromURL = () => {
    const [status] = useState(0);  // Default status
    const hasSaved = useRef(false);  // To track if the order is already saved
    const navigate = useNavigate();  // Hook to navigate between routes
    const socket = useRef(null);  // UseRef for WebSocket to persist between renders

    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('orderNumber');
    const customerName = urlParams.get('customerName');
    const orderItems = urlParams.get('orderItems');

    const currentDate = new Date().toLocaleString();  // Get current date and time

    useEffect(() => {
        if (!hasSaved.current && orderNumber && customerName && orderItems) {
            // Initialize WebSocket
            socket.current = new WebSocket('wss://chic-chicken-oss-929342691ddb.herokuapp.com/');

            // WebSocket: Wait until the connection is open before sending the message
            socket.current.onopen = () => {
                const parsedOrderItems = orderItems.split(',').map(item => ({
                    name: item.trim()  // Only store the name of the item
                }));

                // Create new order object
                const newOrder = {
                    orderNumber,
                    customerName,
                    orderItems: parsedOrderItems,
                    date: currentDate,
                    status,
                };

                // Prevent multiple submissions
                hasSaved.current = true;

                // Send new order through WebSocket
                socket.current.send(JSON.stringify(newOrder));

                // Save new order to localStorage after WebSocket message is sent
                const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
                const updatedOrders = [...existingOrders, newOrder];
                localStorage.setItem('orders', JSON.stringify(updatedOrders));

                // Close window after 1 second
                // setTimeout(() => {
                window.close();
                // }, 1000);
            };

            // Handle WebSocket errors
            socket.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            // Close WebSocket when the component unmounts
            return () => {
                if (socket.current) {
                    socket.current.close();
                }
            };
        }
    }, [orderNumber, customerName, orderItems, currentDate, status]);

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
