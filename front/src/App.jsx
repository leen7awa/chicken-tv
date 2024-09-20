import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Kitchen from './Kitchen';
import Restaurant from "./Restaurant";
import Counter from "./Counter";
import AddFromURL from "./AddFromURL";

function App() {

  /* 
  Status:
    0 - pending
    1 - prepping
    2 - ready
    3 - finish  
  */
  // localStorage.clear();
  // localStorage.removeItem('orders');
  // Function to retrieve orders from local storage
  const getOrdersFromLocalStorage = () => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [
      // {
      //   orderNumber: 1,
      //   customerName: 'משה',
      //   orderItems: ['2 בורגר קריספי', 'קולה','עוף','סלט קיסר','סלט עוף'],
      //   date: "2024-09-14T15:45:30",
      //   status: 0,
      // },
      // {
      //   orderNumber: 2,
      //   customerName: 'לין',
      //   orderItems: ['סלט', 'פסטה', '4 תפוזים'],
      //   date: "2024-09-14T17:33:12",
      //   status: 0,
      // },
    ];
  };

  const [orders, setOrders] = useState(getOrdersFromLocalStorage);

  // Save orders to local storage whenever the orders state updates
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const updateOrderStatus = (orderNumber, newStatus) => {
    console.log("Updating order:", orderNumber, "to status:", newStatus);

    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order =>
        order.orderNumber === orderNumber ? { ...order, status: newStatus } : order
      );
      console.log("Updated orders:", updatedOrders);
      return updatedOrders;
    });
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addurl" element={<AddFromURL />} />
          <Route path="/kitchen" element={<Kitchen orders={orders} setOrders={setOrders} />} />
          <Route path="/restaurant" element={<Restaurant orders={orders} setOrders={setOrders} />} />
          <Route path="/counter" element={<Counter orders={orders} setOrders={setOrders} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
