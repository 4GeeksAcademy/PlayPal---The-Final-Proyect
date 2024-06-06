import React from 'react';
import playpalLogo from '../../img/playpal-logo.png';
import '../../styles/LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <img src={playpalLogo} alt="Loading" className="loading-logo" />
        </div>
    );
};

export default LoadingScreen;