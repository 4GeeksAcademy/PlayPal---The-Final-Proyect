import React, { useState, useContext } from 'react';
import { Context } from "../store/appContext";
import { useNavigate } from 'react-router-dom';


export const CreateRoom = () => {
    const { store, actions } = useContext(Context);
    const [roomData, setRoomData] = useState({
        room_name: '',
        game_id: '',
        date: '',
        time: '',
        platform: '',
        description: '',
        mood: '',
        room_size: 4 // Default room size
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

        // Find the game ID from the game name
        const selectedGame = store.games.find(game => game.name === roomData.game_id);
        console.log('Selected game is:', selectedGame)
        const gameId = selectedGame.game_id
        console.log(gameId)

        if (!gameId) {
            setError('Selected game is invalid.');
            return;
        }

        // Ensure date and time are strings and set the game_id to the gameId
        const formattedRoomData = {
            ...roomData,
            game_id: gameId,
            date: roomData.date.toString(),
            time: roomData.time.toString()
        };

        const success = await actions.createRoom(formattedRoomData);
        if (success) {
            navigate('/');
        } else {
            setError('Failed to create room. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Create a New Room</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="room_name" className="form-label">Room Name</label>
                    <input
                        type="text"
                        className="form-control"
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
                        className="form-control"
                        id="game_id"
                        name="game_id"
                        value={roomData.game_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a game</option>
                        {store.games.map(game => (
                            <option key={game.id} value={game.name}>{game.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                        type="date"
                        className="form-control"
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
                        className="form-control"
                        id="time"
                        name="time"
                        value={roomData.time}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="platform" className="form-label">Platform</label>
                    <select
                        className="form-control"
                        id="platform"
                        name="platform"
                        value={roomData.platform}
                        onChange={handleChange}
                        required
                    >
                        <option value="All">All</option>
                        <option value="Xbox">Xbox</option>
                        <option value="PSN">PSN</option>
                        <option value="PC">PC</option>
                        <option value="Google Play">Google Play</option>
                        <option value="Nintendo">Nintendo</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        className="form-control"
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
                        className="form-control"
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
                    <label htmlFor="room_size" className="form-label">Room Size</label>
                    <input
                        type="number"
                        className="form-control"
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
    );
};