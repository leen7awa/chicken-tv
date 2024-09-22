import React, { useState, useEffect } from 'react';
import StatusConvert from './StatusConvert';
import Header from './Header';
import OrderDetailsModal from './OrderDetailsModal'; // Import your modal component
import './card.css';

let socket; // Declare socket using let to allow reassignment

const Kitchen = ({ orders, setOrders }) => {
    const [statusFilters, setStatusFilters] = useState([true, true, true]); // Default to show all statuses
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null); // Store the selected order

    // Function to establish a WebSocket connection
    const connectWebSocket = () => {
        socket = new WebSocket('wss://chic-chicken-oss-929342691ddb.herokuapp.com/');

        socket.onopen = () => {
            console.log('WebSocket connection established');
            // Optional: Start sending ping messages to keep the connection alive
            // const pingInterval = setInterval(() => {
            //     if (socket.readyState === WebSocket.OPEN) {
            //         socket.send(JSON.stringify({ type: 'ping' }));
            //     }
            // }, 30000); // Send a ping every 30 seconds
        };

        socket.onmessage = (event) => {
            if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const messageData = JSON.parse(reader.result); // Assuming the blob contains JSON data
                        handleMessage(messageData);
                    } catch (error) {
                        console.error("Error processing Blob WebSocket message:", error);
                    }
                };
                reader.readAsText(event.data);
            } else {
                try {
                    const messageData = JSON.parse(event.data);
                    handleMessage(messageData);
                } catch (error) {
                    console.error("Error processing WebSocket message:", error);
                }
            }
        };

        socket.onclose = (event) => {
            console.error('Kitchen WebSocket closed: ', event.reason);
            setTimeout(() => connectWebSocket(), 5000); // Reconnect after 5 seconds
        };

        socket.onerror = (error) => {
            console.error('Kitchen WebSocket Error: ', error);
        };
    };

    const sendMessage = (updatedOrder) => {
        const message = JSON.stringify(updatedOrder);
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }
    
        setOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order =>
                order.orderNumber === updatedOrder.orderNumber ? updatedOrder : order
            );
            return updatedOrders;
        });
    };
    

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (socket) {
                socket.close(); // Clean up WebSocket connection on unmount
            }
        };
    }, []);

    const handleMessage = (messageData) => {
        setOrders(prevOrders => {
            const orderExists = prevOrders.some(order => order.orderNumber === messageData.orderNumber);

            if (orderExists) {
                return prevOrders.map(order =>
                    order.orderNumber === messageData.orderNumber ? { ...order, status: messageData.status } : order
                );
            } else {
                return [...prevOrders, messageData];
            }
        });
    };

    const filteredOrders = orders.filter((order) => statusFilters[order.status]);

    return (
        <>
            <div className="bg-[#ffa900] h-screen overflow-y-auto">
                <Header title='מטבח' onToggleStatuses={setStatusFilters} /> {/* Pass the toggle handler */}

                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '20px',
                        marginTop: '20px',
                        margin: '20px',
                        justifyContent: 'center'
                    }}
                >
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, orderIndex) => (
                            <div
                                key={orderIndex}
                                className="order-card"
                                style={{
                                    backgroundColor: 'wheat',
                                    border: '2px solid #1a1a1a',
                                    width: '300px',
                                    height: '200px',
                                    textAlign: 'center',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}>

                                <div className='flex flex-col h-full text-gray-800'>
                                    <div className='flex-col font-bold text-base overflow-hidden text-ellipsis'>
                                        <h2 className='text-xl'>מספר הזמנה {order.orderNumber}</h2>
                                        <h4 className='text-base'>שם לקוח: {order.customerName}</h4>
                                        <h4 className='text-base'>{order.date}</h4>
                                    </div>

                                    <div className='flex-1 mt-2 justify-center flex items-center'>
                                        <button
                                            className="px-4 py-1 bg-gray-600 font-bold rounded-2xl border-2 border-gray-800"
                                            onClick={() => {
                                                setSelectedOrder(order); // Set the whole order object
                                                setShowOrderDetails(true); // Show the modal
                                            }}
                                        >
                                            פרטי הזמנה
                                        </button>
                                    </div>

                                    <div className='flex-shrink flex sm:flex-row md:flex-row justify-between items-end p-4'>
                                        {[{ label: 'בהמתנה', status: 0 }, { label: 'בהכנה', status: 1 }, { label: 'מוכן', status: 2 }].map((button, index) => (
                                           <button
                                           key={index}
                                           className={`px-2 py-1 rounded-2xl font-semibold ${order.status === button.status ? 'text-black bg-red-500 border-2 border-gray-800' : 'bg-slate-300 text-gray-500'}`}
                                           onClick={() => sendMessage({ ...order, status: button.status })}>
                                           {button.label}
                                       </button>
                                       
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-gray-800 font-mono mt-44 text-3xl font-bold'>אין הזמנות</div>
                    )}
                </div>
            </div>

            {showOrderDetails && selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder} // Pass the selected order object
                    onClick={() => setShowOrderDetails(false)} // Close the modal
                />
            )}
        </>
    );
};

export default Kitchen;
