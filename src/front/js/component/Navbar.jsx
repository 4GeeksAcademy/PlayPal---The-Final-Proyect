import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../../styles/Navbar.css';
import SignUpModals from './SignUpModals.jsx'; // Importa el componente de modales
import { FiCoffee } from "react-icons/fi";
import playpalLogo from '../../img/logo.png';

export const Navbar = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const token = localStorage.getItem('jwt-token');
    const [showSignUpModals, setShowSignUpModals] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState('');

    useEffect(() => {
        const loadUserProfile = async () => {
            if (store.user && store.user.url_image) {
                setProfileImageUrl(store.user.url_image);
            } else if (localStorage.getItem('jwt-token')) {
                // Suponiendo que el token existe pero aún no se han cargado los datos del usuario
                const userData = await actions.getProfile();
                if (userData && userData.url_image) {
                    setProfileImageUrl(userData.url_image);
                }
            }
        };

        loadUserProfile();
    }, [store.user]);

    const handleLogout = () => {
        actions.logout();
        navigate('/');
    };

    const handleSignUpClick = () => {
        setShowSignUpModals(true);
    };

    const handleCloseModals = () => {
        setShowSignUpModals(false);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid container-max-width">
                <img src={playpalLogo} alt="PlayPal Logo" style={{ height: '40px' }} />
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                                <Link to="/buy-me-a-coffee" className="nav-link"> <FiCoffee style={{ fontSize: '24px' }}/></Link>
                                    </li>
                            <li className="nav-item">
                                <Link to="/" className="nav-link">Rooms</Link>
                            </li>
                            {/* <li className="nav-item">
                                <Link to="/games" className="nav-link">Games</Link>
                            </li> */}
                            {token ? (
                                <>
                                    <li className="nav-item">
                                        <Link to="/profile" className="nav-link">
                                            {profileImageUrl && <img src={profileImageUrl} alt="Profile" style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }} />}
                                            Profile
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <button onClick={handleLogout} className="btn nav-link">Logout</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link to="/login" className="nav-link">Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <button onClick={handleSignUpClick} className="join-room nav-link">Create account</button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
            {showSignUpModals && <SignUpModals handleClose={handleCloseModals} />}
        </>
    );
};
