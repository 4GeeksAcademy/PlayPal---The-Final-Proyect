import React, { useState } from 'react';
import PayPalButton from '../component/PayPalButton.jsx';
import '../../styles/BuyMeACoffee.css'; // Asegúrate de que este archivo de CSS esté bien configurado

export const BuyMeACoffee = () => {
    const [successMessage, setSuccessMessage] = useState('');

    const handleSuccess = (details) => {
        setSuccessMessage(`Transaction completed by ${details.payer.name.given_name}`);
    };

    return (
        <div className="coffee-container">
            <h1>Buy Us a Coffee</h1>
            <p className="support-message">
            "We play, just like you — whether it's saving princesses, building empires, or blasting through aliens. Think of this as dropping a coin into your game of choice, helping to keep our gaming universe ad-free and awesome. Chip in a coffee's worth to keep us in the game! Game on, and may the force be with you."
            </p>
            <div className="message-container">
                {successMessage && <p className="success-message">{successMessage}</p>}
            </div>
            <div className="paypal-button-container">
                <PayPalButton amount="5.00" onSuccess={handleSuccess} />
            </div>
        </div>
    );
};
