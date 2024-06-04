import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from "../store/appContext";
import "../../styles/ResetPassword.css"; // Asegúrate de importar el CSS

export const ResetPassword = () => {
    const { store, actions } = useContext(Context);
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const success = await actions.resetPassword(password);
        if (success) {
            alert("Password has been reset.");
            navigate("/login");
        } else {
            alert("Failed to reset password.");
        }
    };

    return (
        <div className="reset-password-container">
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit}>
                <label>New Password:</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};
