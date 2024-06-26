import React, { useState, useContext, useEffect } from 'react';
import { Context } from "../store/appContext";
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import '../../styles/BuyMeACoffee.css';

import { showSuccessAlert, showErrorAlert } from '../component/alerts.js';
import '../../styles/Alerts.css'; // Importa las funciones de alerta

export const CreateRoom = () => {
    const { store, actions } = useContext(Context);
    const token = localStorage.getItem('jwt-token');
    const [roomData, setRoomData] = useState({
        room_name: '',
        game_id: '',
        date: '',
        time: '',
        platform: '',
        description: '',
        mood: '',
        room_size: 4,
        user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        duration: ''  // Agregar este campo
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomData({
            ...roomData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedGame = store.games.find(game => game.name === roomData.game_id);

        console.log('Selected game is:', selectedGame);
        const gameId = selectedGame.game_id;
        console.log(gameId);

        // Convert date and time to UTC
        const localDateTime = `${roomData.date} ${roomData.time}`;
        const userTimezone = roomData.user_timezone;
        const utcDateTime = moment.tz(localDateTime, userTimezone).utc().format('YYYY-MM-DD HH:mm');

        // Validate that utcDateTime is not in the past
        const currentUtcTime = moment.utc().format('YYYY-MM-DD HH:mm');
        if (utcDateTime < currentUtcTime) {
            setError('The start time cannot be in the past.');
            return;
        }

        if (!selectedGame) {
            setError('Invalid game selected. Please try again.');
            return;
        }

        const formattedRoomData = {
            ...roomData,
            game_id: gameId,
            date: roomData.date.toString(),
            time: roomData.time.toString(),
            user_timezone: roomData.user_timezone,
            utc_start_time: utcDateTime  // Adding the UTC start time
        };
        console.log('FORMATTED ROOMDATA', formattedRoomData);
        const success = await actions.createRoom(formattedRoomData);
        if (success) {
            showSuccessAlert('Success', 'Room Created Successfully', () => navigate('/'));
        } else {
            showErrorAlert('Error', 'Something went wrong.');
        }
    };

    useEffect(() => {
        return () => {
            setRoomData({
                room_name: '',
                game_id: '',
                date: '',
                time: '',
                platform: '',
                description: '',
                mood: '',
                room_size: 4,
                user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                duration: ''  // Agregar este campo
            });
            setError(null);
        };
    }, []);

    // Ordenar los juegos alfabéticamente
    const sortedGames = [...store.games].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div>
            <div className="coffee-container">
                {token ? (
                    <div className="container mt-5">
                        <h2>Create a New Room</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="room_name" className="form-label">Room Name</label>
                                <input
                                    type="text"
                                    className="form-control mx-auto"
                                    id="room_name"
                                    name="room_name"
                                    value={roomData.room_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="game_id" className="form-label">Game</label>
                                <select
                                    className="form-control mx-auto"
                                    id="game_id"
                                    name="game_id"
                                    value={roomData.game_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a game</option>
                                    {sortedGames.map(game => (
                                        <option key={game.game_id} value={game.name}>{game.name}</option>
                                    ))}
                                    <option value="Other">Other</option> {/* Option Other is always present */}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="date" className="form-label">Date</label>
                                <input
                                    type="date"
                                    className="form-control mx-auto"
                                    id="date"
                                    name="date"
                                    value={roomData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="time" className="form-label">Time</label>
                                <input
                                    type="time"
                                    className="form-control mx-auto"
                                    id="time"
                                    name="time"
                                    value={roomData.time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="form-control mx-auto"
                                    id="duration"
                                    name="duration"
                                    value={roomData.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="platform" className="form-label">Platform</label>
                                <select
                                    className="form-control mx-auto"
                                    id="platform"
                                    name="platform"
                                    value={roomData.platform}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="All">All</option>
                                    <option value="Xbox">Xbox</option>
                                    <option value="PlayStation">PlayStation</option>
                                    <option value="PC">PC</option>
                                    <option value="Nintendo">Nintendo</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Description</label>
                                <textarea
                                    className="form-control mx-auto"
                                    id="description"
                                    name="description"
                                    value={roomData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="mood" className="form-label">Mood</label>
                                <select
                                    className="form-control mx-auto"
                                    id="mood"
                                    name="mood"
                                    value={roomData.mood}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select mood</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Hardcore">Hardcore</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="room_size" className="form-label">Available spots not including yourself.</label>
                                <input
                                    type="number"
                                    className="form-control mx-auto"
                                    id="room_size"
                                    name="room_size"
                                    value={roomData.room_size}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Create Room</button>
                        </form>
                    </div>
                ) : (
                    <div><p>nop</p></div>
                )}
            </div>
        </div>
    );
};
