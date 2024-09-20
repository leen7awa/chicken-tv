import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import CounterIcon from "../icons/CounterIcon";
import KitchenIcon from "../icons/KitchenIcon";
import RestaurantIcon from "../icons/RestaurantIcon";
import Header from "./Header";
import './Home.css';
import OrderFormModal from "./OrderFormModal"; // Import the modal component

const Home = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const socketRef = useRef(null); // Use ref to store the WebSocket instance

  useEffect(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = today.toLocaleDateString('heb-US', options);
    setDate(currentDate);
  }, []);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, []);
  
  // const socket = new WebSocket('ws://localhost:8081');

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8081');

    // socketRef.current.onopen = () => {
    //   console.log("Connected to WebSocket server");
    // };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // socketRef.current.onclose = () => {
    //   console.log("WebSocket connection closed");
    // };

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Handle adding a new order
  const handleAddOrder = (newOrder) => {
    const formatDateTime = () => {
      const today = new Date();

      // Format date: dd/mm/yy
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = String(today.getFullYear()).slice(-2);

      // Format time: HH:mm:ss
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      const seconds = String(today.getSeconds()).padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const orderWithNumber = {
      ...newOrder,
      date: formatDateTime(),
      status: 0,
    };

    const updatedOrders = [...orders, orderWithNumber];
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setModalOpen(false); // Close the modal

    // Send the new order to the WebSocket server if connection is open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(orderWithNumber);
      socketRef.current.send(message);
      console.log("Order sent via WebSocket:", message);
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  };

  return (
    <>
      <div className="bg-[#ffa900] min-h-screen flex flex-col">
        <Header imageUrl="/icon.png" />

        {/* Button to open modal */}
        <div className="flex flex-1 w-fit ml-[550px] mt-8">
          <button
            className="border-2 border-gray-700 rounded-2xl bg-slate-200 h-fit px-8"
            onClick={() => setModalOpen(true)}
          >
            הוספת הזמנה
          </button>
          <button
            className="border-2 border-gray-700 rounded-2xl bg-slate-200 h-fit px-8"
            onClick={() => navigate(`/addurl?orderNumber=1&customerName=גוני&orderItems=פיצה,בורגר,סלט`)}
          >
            Add from URL
          </button>
        </div>

        <div className="flex-grow flex justify-center items-center">
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 items-center">
            <button className="btn btn-primary" onClick={() => navigate("/kitchen")}>
              <KitchenIcon className="btn-icon" />
              מטבח
            </button>

            <button className="btn btn-primary" onClick={() => navigate("/counter")}>
              <CounterIcon className="btn-icon" />
              דלפק
            </button>

            <button className="btn btn-primary" onClick={() => navigate("/restaurant")}>
              <RestaurantIcon className="btn-icon" />
              מסעדה
            </button>
          </div>
        </div>
      </div>

      {/* Modal for adding new order */}
      {modalOpen && (
        <OrderFormModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddOrder}
        />
      )}
    </>
  );
};

export default Home;
