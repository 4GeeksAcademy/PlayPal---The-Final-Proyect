import React, { useState } from 'react';
import PayPalButton from '../component/PayPalButton.jsx';

export const BuyMeACoffee = () => {
    const [successMessage, setSuccessMessage] = useState('');

    const handleSuccess = (details) => {
        setSuccessMessage(`Transaction completed by ${details.payer.name.given_name}`);
    };

    return (
        <div>
            <h1>Buy Me a Coffee</h1>
            {successMessage && <p>{successMessage}</p>}
            <PayPalButton amount="5.00" onSuccess={handleSuccess} />
        </div>
    );
};
