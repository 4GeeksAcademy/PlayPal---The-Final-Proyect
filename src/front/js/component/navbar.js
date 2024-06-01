import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Navbar.css';

export const Navbar = () => {
    const token = localStorage.getItem('jwt-token'); // Verificar la existencia del token

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">PlayPal</Link>
            </div>
            <div className="navbar-right">
                <Link to="/rooms" className="navbar-link">Rooms</Link>
                <Link to="/games" className="navbar-link">Games</Link>
                {token ? (
                    // Renderizar el componente de perfil cuando el usuario está loggeado
                    <Link to="/profile" className="navbar-link">Profile</Link>
                ) : (
                    // Renderizar los enlaces de login y create account cuando el usuario no está loggeado
                    <>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/signup" className="navbar-button">Create account</Link>
                    </>
                )}
            </div>
        </nav>
    );
};
