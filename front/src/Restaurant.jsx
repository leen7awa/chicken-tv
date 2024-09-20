import React, { useState, useEffect } from "react";
import RestaurantHeader from "./RestaurantHeader";

// Initialize WebSocket connection
const socket = new WebSocket('wss://chic-chicken-oss-929342691ddb.herokuapp.com/');

const Restaurant = ({ orders, setOrders }) => {
    const [readyOrders, setReadyOrders] = useState([]);
    const [preppingOrders, setPreppingOrders] = useState([]);

    useEffect(() => {
        socket.onmessage = (event) => {
            if (event.data instanceof Blob) {
                // Handle Blob data
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const messageData = JSON.parse(reader.result); // Assuming Blob contains JSON data
                        updateOrders(messageData);
                    } catch (error) {
                        console.error("Error processing Blob WebSocket message:", error);
                    }
                };
                reader.readAsText(event.data);
            } else {
                // Handle JSON string data
                try {
                    const messageData = JSON.parse(event.data);
                    updateOrders(messageData);
                } catch (error) {
                    console.error("Error processing WebSocket message:", error);
                }
            }
        };

        // WebSocket error handling
        socket.onerror = (error) => {
            console.error('WebSocket Error: ', error);
        };

        const updateOrders = (messageData) => {
            // Update the orders when a message is received from the WebSocket
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderNumber === messageData.orderNumber
                        ? { ...order, status: messageData.status }
                        : order
                )
            );
        };
    }, [setOrders]);

    // Filter orders based on their status
    useEffect(() => {
        const filteredPreppingOrders = orders.filter(order => order.status === 1);
        const filteredReadyOrders = orders.filter(order => order.status === 2);

        setPreppingOrders(filteredPreppingOrders);
        setReadyOrders(filteredReadyOrders);
    }, [orders]);

    const [images] = useState([
        "image1.jpg",
        "image2.jpg",
        "image3.jpg",
        "image4.jpg",
        "image5.jpg"
    ]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [images.length]);

    return (
        <>
            {/* Top section */}
            <RestaurantHeader />
            
            <div className="flex h-screen text-center text-4xl font-bold bg-yellow-100">
                {/* Prepping Orders Section */}
                <div className="flex-1">
                    <div className="flex-row p-4 font-normal text-2xl">
                        {preppingOrders.map(order => (
                            <div
                                key={order.orderNumber}
                                className="border-black border-b-2 p-2 justify justify-between flex"
                            >
                                <div className="font-bold text-3xl">{order.orderNumber}</div>
                                <div className="font-bold text-3xl">{order.customerName}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Image Carousel Section */}
                <div className="flex-grow flex w-32 justify-center items-center">
                    <div className="w-full h-full flex justify-center items-center">
                        <img
                            src={`/images/${images[currentImageIndex]}`}
                            alt={`Restaurant Image ${currentImageIndex + 1}`}
                            className="w-full h-full object-fill"
                        />
                    </div>
                </div>

                {/* Ready Orders Section */}
                <div className="flex-1">
                    <div className="flex-row gap-4 p-4 font-bold text-2xl">
                        {readyOrders.map(order => (
                            <div
                                key={order.orderNumber}
                                className="border-black border-b-2 p-2 justify justify-between flex"
                            >
                                <div className="font-bold text-3xl">{order.orderNumber}</div>
                                <div className="font-bold text-3xl">{order.customerName}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Restaurant;
