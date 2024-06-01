import React, { useState, useContext } from 'react';
import { Context } from "../store/appContext";
import combinedFrame from '../../img/login-frame.png'; // Importa la imagen combinada correctamente
import { Link, useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Importación de los iconos
import '../../styles/LogIn.css';

export const LogIn = () => {
    const navigate = useNavigate();
    const { actions } = useContext(Context);
    const [logInData, setLogInData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña

    const handleInputChange = (e) => {
        setLogInData({ ...logInData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let success = await actions.submitLogInForm(logInData);
            if (success) {
                navigate('/');
            } else {
                setError('Failed to log in. Please try again.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="container-fluid login-page">
            <div className="row align-items-center justify-content-center">
                <div className="col-lg-6 col-md-8 col-sm-10 py-1 d-flex flex-column align-items-center">
                    <div className="login-form pb-1 rounded-1 col-12 d-flex flex-column align-items-center">
                        <div className="col-12 d-flex flex-column align-items-center">
                            <div className="col-12 text-center">
                                <p className="login-title text-white fs-2 fw-medium font-family-Inter col-12 m-0 px-3 py-2">Find Pals to Play Today!</p>
                            </div>
                            <div className="col-12 text-center">
                                <p className="text-white fs-6 fw-normal font-family-Inter col-12 m-0 px-3 py-2">Please sign in or create an account to start</p>
                            </div>
                        </div>
                        <form className="col-12 d-flex flex-column align-items-center" onSubmit={handleSubmit}>
                            <div className="col-12 mb-3">
                                <label className="text-white fs-6 fw-normal font-family-Inter col-12 m-0 px-3 py-2" htmlFor="email">Email Address</label>
                                <div className="rounded-1 col-12 align-items-center">
                                    <div className="px-1 py-1 bg-dark rounded-1 border border-1 border-primary col-12 align-items-center d-flex">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-control bg-dark text-white border-0"
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 mb-3">
                                <label className="text-white fs-6 fw-normal font-family-Inter col-12 m-0 px-3 py-2" htmlFor="password">Password</label>
                                <div className="rounded-1 col-12 align-items-center">
                                    <div className="px-1 py-1 bg-dark rounded-1 border border-1 border-primary col-12 align-items-center d-flex">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            className="form-control bg-dark text-white border-0"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 mb-3">
                                <button type="submit" className="btn login-btn">
                                    Login
                                </button>
                            </div>
                        </form>
                        <div className="col-12 text-center">
                            <p className="col-12 m-0 px-3 py-2">
                                <span className="text-white fs-6 fw-normal font-family-Inter">Don’t have an account? </span>
                                <Link to="/signup" className="text-white fs-6 fw-normal font-family-Inter text-decoration-underline">create a new account</Link>
                            </p>
                            <p className="col-12 m-0 px-3 py-2">
                                <span className="text-white fs-6 fw-normal font-family-Inter">Forgot your password? </span>
                                <Link to="/forgot-password" className="text-white fs-6 fw-normal font-family-Inter text-decoration-underline">Reset it here</Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5 d-none d-lg-block position-relative">
                    <img className="img-fluid larger-image" src={combinedFrame} alt="placeholder" />
                </div>
            </div>
        </div>
    );
};
