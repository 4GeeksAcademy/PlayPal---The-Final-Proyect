import React, { useState } from 'react';
import '../../styles/Modals.css'; // Importa los estilos
import CardContainer from './CardContainer.jsx';
import switchIcon from '../../img/switch.png';
import playstationIcon from '../../img/playstation.png';
import xboxIcon from '../../img/xbox.png';
import steamIcon from '../../img/steam.png';
import discordIcon from '../../img/discord.png';
import epicIcon from '../../img/epic.png';

const icons = [
    { icon: switchIcon, name: 'Switch' },
    { icon: playstationIcon, name: 'PlayStation' },
    { icon: xboxIcon, name: 'Xbox' },
    { icon: steamIcon, name: 'Steam' },
    { icon: discordIcon, name: 'Discord' },
    { icon: epicIcon, name: 'Epic' },
];

const FavoritePlatformModal = ({ show, handleClose, handleNext, handlePrev, onInputChange }) => {
    const handleInputChange = (platformName, value) => {
        onInputChange(platformName, value);
    };

    return (
        <div className={`modal ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
            <div className="modal-dialog favorite-plat">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Set up your profile</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <CardContainer
                            icons={icons}
                            onInputChange={handleInputChange}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handlePrev}>Back</button>
                        <button type="button" className="btn btn-primary" onClick={handleNext}>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FavoritePlatformModal;
