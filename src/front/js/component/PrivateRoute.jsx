import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from '../store/appContext';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('jwt-token');
    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
