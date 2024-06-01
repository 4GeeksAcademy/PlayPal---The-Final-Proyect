import React, { useState, useEffect } from 'react';
import '../../styles/SearchBar.css';


export const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [mood, setMood] = useState('');
    const [dropdownTitle, setDropdownTitle] = useState('All');

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleMoodChange = (mood, title) => {
        setMood(mood);
        setDropdownTitle(title);
    };

    useEffect(() => {
        if (onSearch) {
            onSearch(searchTerm, mood);
        }
    }, [searchTerm, mood, onSearch]);

    return (
        <div className="search-bar">
            
            <input
                type="text"
                placeholder="Search rooms or games"
                value={searchTerm}
                onChange={handleInputChange}
                className="search-input"
            />
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle dropdown-toggle-split" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="dropdown-title">{dropdownTitle}</span>
                    
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li><button className="dropdown-item" type="button" onClick={() => handleMoodChange('', 'All')}>All</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => handleMoodChange('casual', 'Casual Rooms')}>Casual Rooms</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => handleMoodChange('hardcore', 'Hardcore Rooms')}>Hardcore Rooms</button></li>
                </ul>
            </div>
        </div>
    );
};
