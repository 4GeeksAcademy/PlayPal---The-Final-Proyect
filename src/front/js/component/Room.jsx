import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from "../store/appContext";
import fortniteImage from '../../img/Fortnite.png';
import xboxIcon from '../../img/xbox.png';
import switchIcon from '../../img/switch.png';
import playstationIcon from '../../img/playstation.png';
import pcIcon from '../../img/pc.png';
import { FaUser } from "react-icons/fa";
import '../../styles/Room.css';
import images from '../../img/images.js';

export const Room = ({ room }) => {
    const token = localStorage.getItem('jwt-token');
    const username = localStorage.getItem('username');
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const isHost = username === room.host_name;
    const participantsCount = room.participants ? room.participants.length : 0;
    const maxLength = 100; // Maximum number of characters before truncation
    const [selectedGame, setSelectedGame] = useState(null);

    const handleCardClick = () => {
        navigate(`/room/${room.room_id}`);
    };

    const handleEdit = () => {
        navigate(`/edit-room/${room.room_id}`);
    };

    const handleDelete = async () => {
        const success = await actions.deleteRoom(room.room_id);
        if (success) {
            actions.fetchRooms(); // Refresh the rooms list after deletion
        }
    };

    const handleGameSelect = (game) => {
        setSelectedGame(game);
    };

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substr(0, maxLength) + '...';
    };

    const truncatedDescription = truncateText(room.description, maxLength);

    const renderPlatformIcon = (platform) => {
        console.log('Platform:', platform); // Verifica el valor de platform
        if (!platform) return null; // Add check for undefined platform
        const iconStyle = { width: '26px', height: '26px', position: 'relative', top: '-5px' };
        switch (platform.toLowerCase()) {
            case 'xbox':
                return <img src={xboxIcon} alt="Xbox" style={iconStyle} />;
            case 'nintendo':
                return <img src={switchIcon} alt="Switch" style={iconStyle} />;
            case 'psn':
            case 'playstation':
                return <img src={playstationIcon} alt="Playstation" style={iconStyle} />;
            case 'pc':
                return <img src={pcIcon} alt="PC" style={iconStyle} />;
            default:
                return null;
        }
    };

    const gameKey = room.game_name ? room.game_name.toLowerCase().replace(/\s+/g, '-') : 'other';
    const imageSrc = images[gameKey] ? images[gameKey].default : null;

    console.log('Game name:', room.game_name); // Log the game name
    console.log('Game key:', gameKey); // Log the game key
    console.log('Image source:', imageSrc); // Log the image source

    return (
        <div className="room-card p-0 w-100" onClick={handleCardClick}>
            <div className="row g-0 col-12">
                <div className="col-md-4">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={room.game_name}
                            className="img-fluid p-0 w-100 height-auto rounded-start room-image"
                        />
                    ) : (
                        <p>Image not found</p> // Placeholder if image not found
                    )}
                </div>
                <div className="col-md-8 d-flex flex-column">
                    <div className="card-body">
                        <div>
                            <div className='d-flex justify-content-between'>
                                <h5 className="text-info font-family-Inter">{room.game_name || 'Unknown Game'}</h5>
                                <p className="text-info fs-6 fw-semibold font-family-Inter m-0 "><FaUser />  {participantsCount}/{room.room_size}</p>
                            </div>
                            <h4 className="text-white font-family-Inter">{room.room_name}</h4>
                            <p className="text-success-subtle font-family-Inter w-100">
                                {truncatedDescription}
                                {room.description.length > maxLength && (
                                    <span
                                        className="text-white text-opacity-75 fs-6 fw-normal  font-family-Inter text-decoration-underline"
                                        onClick={handleCardClick}
                                    >
                                        Continue Reading
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="card-footer mt-auto">
                            <p className="text-info font-family-Inter">
                                Starts: {room.date} at {room.time} | Duration: {room.duration} minutes
                            </p>
                            {renderPlatformIcon(room.platform)} {/* Agregar aquí el icono de la plataforma */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
