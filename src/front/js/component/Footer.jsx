import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css'; // Asegúrate de que el camino al archivo CSS es correcto
import { CiCoffeeCup } from "react-icons/ci";


export const Footer = () => {
    return (
        <footer className="footer ">
            <div className="container-fluid d-flex justify-content-center">
                <Link to="/buy-me-a-coffee" className="join-room">Buy Us a <CiCoffeeCup />
                </Link>
            </div>
        </footer>
    );
};
