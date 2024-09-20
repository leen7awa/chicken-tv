import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import CounterIcon from "../icons/CounterIcon";
import KitchenIcon from "../icons/KitchenIcon";
import RestaurantIcon from "../icons/RestaurantIcon";
import Header from "./Header";
import './Home.css';
import OrderFormModal from "./OrderFormModal"; // Import the modal component
import AddFromURL from "./AddFromURL";

const Home = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);

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

  const handleAddOrder = (newOrder) => {

    const orderWithNumber = {
      ...newOrder,
    };

    const updatedOrders = [...orders, orderWithNumber];
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders)); // Using localStorage here
    setModalOpen(false); // Close the modal
  };

  return (
    <>
      <div className="bg-[#ffa900] min-h-screen flex flex-col">
        <Header imageUrl="/icon.png" />

        {/* Button to open modal */}
        <div className="flex flex-1 w-fit mx-auto mt-8 space-x-4">
          <button
            className="border-2 border-gray-700 rounded-2xl bg-slate-200 h-fit px-8"
            onClick={() => setModalOpen(true)}
          >
            הוספת הזמנה
          </button>
          <button
            className="border-2 border-gray-700 rounded-2xl bg-slate-200 h-fit px-8"
            onClick={() => navigate(`/addurl?orderNumber=15&customerName=גוני&orderItems=פיצה,בורגר,סלט`)}
          >
            add from url
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
