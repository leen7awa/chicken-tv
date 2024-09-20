import React, { useState, useEffect } from 'react';
import FilterIcon from '../icons/FilterIcon';
import './Header.css';

const Header = ({ title, imageUrl, onToggleStatuses }) => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // const [statuses, setStatuses] = useState([false, false, true, false]); // Default to four statuses

    const [statuses, setStatuses] = useState(
        title === 'דלפק' ? [false, false, true, false] : [true, true, true, true]
    );

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

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

    // Handle toggle of checkboxes and pass the statuses to the parent
    const handleStatusToggle = (index) => {
        const updatedStatuses = [...statuses];
        updatedStatuses[index] = !updatedStatuses[index];
        setStatuses(updatedStatuses);
        onToggleStatuses(updatedStatuses); // Pass updated statuses to the parent component
    };

    const statusLabels = title === 'דלפק'
        ? ['בהמתנה', 'בהכנה', 'מוכן']
        : ['בהמתנה', 'בהכנה', 'מוכן']; // Conditionally select statuses

    return (
        <nav className="flex bg-gray-800 text-[#ffa900] max-h-44 p-4 justify-between">

            {/* <button
                onClick={() => {
                    localStorage.clear();
                    localStorage.removeItem('orders');
                }}>
                clear local storage
            </button> */}

            <div className="flex-1">
                {!imageUrl && (
                    <div className="justify-start w-fit mx-auto text-center">
                        <div className="flex flex-col items-start justify-between">
                            {/* <img src="/icon.png" alt="" /> */}
                            <button className="text-base mt-2" onClick={toggleDropdown}>
                                <FilterIcon />
                            </button>
                            {dropdownOpen && (
                                <div className="flex flex-col bg-gray-700 absolute mt-8 mx-auto rounded-md shadow-lg py-2 space-y-4">
                                    {statusLabels.map((status, index) => (
                                        <label key={index} className="flex items-center cursor-pointer space-x-2">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={statuses[index]} // Bind to state
                                                onChange={() => handleStatusToggle(index)} // Toggle on change
                                            />
                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            <span className="text-sm font-medium">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 text-center text-3xl font-bold">
                {imageUrl ? <img src={imageUrl} alt="Logo" className="h-auto mx-auto" /> : title}
            </div>
            <div className="flex-1 text-right font-bold">
                <div>{currentDate}</div>
                <div className="lg:mr-16">{currentTime}</div>
            </div>
        </nav>
    );
};

export default Header;
