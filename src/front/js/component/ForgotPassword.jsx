import React, { useState, useContext } from 'react';
import { Context } from "../store/appContext";
import "../../styles/ForgotPassword.css"; // Asegúrate de importar el CSS

export const ForgotPassword = () => {
    const { store, actions } = useContext(Context);
    const [email, setEmail] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const success = await actions.requestResetPassword(email);
        if (success) {
            alert("Password reset email sent.");
        } else {
            alert("Failed to send password reset email.");
        }
    };

    return (
        <div className="forgot-password-container">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};
