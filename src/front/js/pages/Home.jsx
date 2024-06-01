import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Room } from '../component/Room.jsx';
import { SearchBar } from '../component/SearchBar.jsx';
import { Context } from "../store/appContext";
import { useNavigate } from 'react-router-dom';
import { IoIosAddCircleOutline } from "react-icons/io";
import '../../styles/RoomList.css';

export const Home = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [searchResults, setSearchResults] = useState([]);
    const [showMyRooms, setShowMyRooms] = useState(false);
    const token = localStorage.getItem('jwt-token');
    const username = localStorage.getItem('username');

    useEffect(() => {
        actions.fetchRooms();
    }, []);

    useEffect(() => {
        setSearchResults(store.rooms);
    }, [store.rooms]);

    const handleSearch = useCallback((searchTerm, mood) => {
        const results = actions.searchRooms(searchTerm, mood);
        setSearchResults(results);
    }, []);

    const handleCreateRoom = () => {
        navigate('/create-room');
    };

    const toggleRooms = (showMyRooms) => {
        setShowMyRooms(showMyRooms);
        if (showMyRooms) {
            const userRooms = store.rooms.filter(room => room.host_name === username);
            setSearchResults(userRooms);
        } else {
            setSearchResults(store.rooms);
        }
    };

    if (store.loadingRooms) {
        return <div>Loading...</div>;
    }

    return (
        <div className='container home-body d-flex flex-column'>
            <div className="home-header align-self-center">
                <div className='d-flex flex-column align-items-center'>
                    <h1 className='main-title align-self-center'>Find your next <span className="pals">pals</span> to play</h1>
                        <SearchBar onSearch={handleSearch} />
                </div>
            </div>
            <div className="home-buttons">
                {token && (
                    <div className='d-flex justify-content-between align-items-center mt-3'>
                        <div>
                            <button 
                                className={`toggle-button ${!showMyRooms ? 'active' : ''}`} 
                                onClick={() => toggleRooms(false)}>
                                All Rooms
                            </button>
                            <button 
                                className={`toggle-button ${showMyRooms ? 'active' : ''}`} 
                                onClick={() => toggleRooms(true)}>
                                My Rooms
                            </button>
                        </div>
                        <button onClick={handleCreateRoom} className="create-room-button"><IoIosAddCircleOutline /> Create new room</button>
                    </div>
                )}
            </div>
            <div className='room-cards'>
                {searchResults.length > 0 ? (
                    searchResults.map(room => (
                        <Room key={room.room_id} room={room} />
                    ))
                ) : (
                    <p>No rooms found</p>
                )}
            </div>
        </div>
    );
};
