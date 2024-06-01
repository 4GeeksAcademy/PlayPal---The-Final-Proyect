import React, { useState } from 'react';
import '../../styles/Modals.css';

const PersonalInfoModal = ({ show, handleClose, handleNext, onInputChange, signUpData }) => {
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        onInputChange(e.target.name, e.target.value);
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setBirthDate(date);

        const age = calculateAge(date);
        if (age < 13) {
            setError('You must be at least 13 years old to sign up.');
        } else {
            setError('');
            onInputChange('age', age); // Set the calculated age in the signUpData
        }
    };

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className={`modal ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Get started by creating your account</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="mb-3">
                                <label htmlFor="first-name" className="form-labe l">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="first-name"
                                    name="firstName"
                                    value={signUpData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="last-name" className="form-labe l">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="last-name"
                                    name="lastName"
                                    value={signUpData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    value={signUpData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    value={signUpData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="birthdate" className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="birthdate"
                                    name="birthdate"
                                    value={birthDate}
                                    onChange={handleDateChange}
                                    required
                                />
                                {error && <div className="text-danger">{error}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="region" className="form-label">Region</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="region"
                                    name="region"
                                    value={signUpData.region}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="languages" className="form-label">Main Language</label>
                                <select
                                    className="form-select"
                                    id="languages"
                                    name="languages"
                                    value={signUpData.languages}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Portuguese">Portuguese</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Russian">Russian</option>
                                    <option value="Chinese">Chinese</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleNext}>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoModal;
