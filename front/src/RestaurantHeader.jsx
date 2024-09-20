import React, { useState, useEffect } from 'react';
import './Header.css';

const RestaurantHeader = () => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const today = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            const date = today.toLocaleDateString('heb-US', options);

            const time = today.toLocaleTimeString('heb-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            setCurrentDate(date);
            setCurrentTime(time);
        };

        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <nav className="flex bg-gray-800 text-[#ffa900] max-h-44 p-4 justify-between">
            <div className="flex-1 text-left ml-16 text-3xl font-bold">
                <h2>הזמנות בהכנה</h2>
                <h2>جاري التحضير</h2>
                {/* הזמנות בהכנה
            <br/>الطلبات في التحضير */}
            </div>
            <div className="flex-1 text-center">
                <div style={{ fontSize: '18px', fontWeight: 'normal' }}>{currentDate}</div> {/* Smaller text */}
                <div style={{ fontSize: '18px', fontWeight: 'normal' }}>{currentTime}</div> {/* Smaller text */}
            </div>
            <div className="flex-1 text-right mr-16 text-3xl font-semibold">
                הזמנות מוכנות
                <br/>الطلبات الجاهزة
            </div>
        </nav>
    );
};

export default RestaurantHeader;
