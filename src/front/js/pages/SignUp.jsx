import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'; // Asegúrate de tener la función cropImage en este archivo
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Importación de los iconos
import "../../styles/SignUp.css";

export const SignUp = () => {
    const navigate = useNavigate();
    const { actions } = useContext(Context);

    const [signUpData, setSignUpData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '', // Campo adicional para confirmar la contraseña
        age: '',
        region: '',
        timezone: '',
        languages: '',
        xbox: '',
        psn: '',
        steam: '',
        discord: '',
        nintendo: '',
        epicId: '',
        bio: '',
        gender: '',
        admin: false,
        imageFile: null
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!signUpData.email) {
            errors.email = 'Email is required';
        }
        if (!signUpData.username) {
            errors.username = 'Username is required';
        }
        if (!signUpData.firstName) {
            errors.firstName = 'First Name is required';
        }
        if (!signUpData.lastName) {
            errors.lastName = 'Last Name is required';
        }
        if (!signUpData.password) {
            errors.password = 'Password is required';
        }
        if (!signUpData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (signUpData.password !== signUpData.confirmPassword) {
            errors.passwordMatch = 'Passwords do not match';
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSignUpData({ ...signUpData, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Clear error message when user starts typing

        if (name === 'password') {
            evaluatePasswordStrength(value);
        }
    };

    const evaluatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[\W_]/.test(password)) strength += 1;

        setPasswordStrength(strength);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSignUpData({ ...signUpData, imageFile: file });

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImageSrc(reader.result);
            setIsCropping(true); // Cambiar a modo de recorte cuando se carga una imagen
        };
    };

    const handleComplete = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            const croppedImageUrl = URL.createObjectURL(croppedImage);
            setCroppedImage(croppedImageUrl);
            setSignUpData({ ...signUpData, imageFile: croppedImage });
            setIsCropping(false); // Salir del modo de recorte y ocultar el Cropper
            setImageSrc(null); // Ocultar el Cropper
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            try {
                if (isCropping) {
                    await handleComplete(); // Asegurar que la imagen recortada esté lista
                }
                let success = await actions.submitSignUpForm(signUpData);
                if (success) {
                    navigate('/login');
                } else {
                    setErrors({ common: 'Failed to create user. Please try again.' });
                }
            } catch (error) {
                setErrors({ common: 'An unexpected error occurred. Please try again.' });
            } finally {
                setLoading(false);
            }
        }
    };

    const getPasswordStrengthColor = (strength) => {
        switch (strength) {
            case 1:
                return "red";
            case 2:
                return "orange";
            case 3:
                return "yellow";
            case 4:
                return "lightgreen";
            case 5:
                return "green";
            default:
                return "red";
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h4 className="card-title text-center mb-4">Sign Up</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={signUpData.email}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                            id="username"
                            name="username"
                            value={signUpData.username}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            id="firstName"
                            name="firstName"
                            value={signUpData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                            id="lastName"
                            name="lastName"
                            value={signUpData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password:</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`form-control ${errors.password ? 'is-invalid' : ''} ${errors.passwordMatch ? 'is-invalid' : ''}`}
                                id="password"
                                name="password"
                                value={signUpData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </span>
                        </div>
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        <div className="password-strength">
                            <div
                                className="password-strength-bar"
                                style={{
                                    width: `${(passwordStrength / 5) * 100}%`,
                                    backgroundColor: getPasswordStrengthColor(passwordStrength)
                                }}
                            />
                        </div>
                        <p className="password-recommendations">
                            Password should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.
                        </p>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password:</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''} ${errors.passwordMatch ? 'is-invalid' : ''}`}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={signUpData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </span>
                        </div>
                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                    {errors.passwordMatch && <div className="alert alert-danger">{errors.passwordMatch}</div>}
                    <div className="mb-3">
                        <label htmlFor="age" className="form-label">Age:</label>
                        <input
                            type="number"
                            className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                            id="age"
                            name="age"
                            value={signUpData.age}
                            onChange={handleInputChange}
                            required
                            min="13"
                        />
                        {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="gender" className="form-label">Gender:</label>
                        <select
                            className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                            id="gender"
                            name="gender"
                            value={signUpData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="bio" className="form-label">Bio:</label>
                        <textarea
                            className={`form-control ${errors.bio ? 'is-invalid' : ''}`}
                            id="bio"
                            name="bio"
                            value={signUpData.bio}
                            onChange={handleInputChange}
                        ></textarea>
                        {errors.bio && <div className="invalid-feedback">{errors.bio}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="languages" className="form-label">Languages:</label>
                        <select
                            className={`form-control ${errors.languages ? 'is-invalid' : ''}`}
                            id="languages"
                            name="languages"
                            value={signUpData.languages}
                            onChange={handleInputChange}
                        >
                            <option value="">Select</option>
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                        </select>
                        {errors.languages && <div className="invalid-feedback">{errors.languages}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="region" className="form-label">Region:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.region ? 'is-invalid' : ''}`}
                            id="region"
                            name="region"
                            value={signUpData.region}
                            onChange={handleInputChange}
                        />
                        {errors.region && <div className="invalid-feedback">{errors.region}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="timezone" className="form-label">Timezone:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.timezone ? 'is-invalid' : ''}`}
                            id="timezone"
                            name="timezone"
                            value={signUpData.timezone}
                            onChange={handleInputChange}
                        />
                        {errors.timezone && <div className="invalid-feedback">{errors.timezone}</div>}
                    </div>
                    <h5 className="mt-4">Platform Usernames (optional):</h5>
                    <p>Add your available usernames for the following platforms:</p>
                    <div className="mb-3">
                        <label htmlFor="xbox" className="form-label">Xbox:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.xbox ? 'is-invalid' : ''}`}
                            id="xbox"
                            name="xbox"
                            value={signUpData.xbox}
                            onChange={handleInputChange}
                        />
                        {errors.xbox && <div className="invalid-feedback">{errors.xbox}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="psn" className="form-label">PSN:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.psn ? 'is-invalid' : ''}`}
                            id="psn"
                            name="psn"
                            value={signUpData.psn}
                            onChange={handleInputChange}
                        />
                        {errors.psn && <div className="invalid-feedback">{errors.psn}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discord" className="form-label">Discord:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.discord ? 'is-invalid' : ''}`}
                            id="discord"
                            name="discord"
                            value={signUpData.discord}
                            onChange={handleInputChange}
                        />
                        {errors.discord && <div className="invalid-feedback">{errors.discord}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="steam" className="form-label">Steam:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.steam ? 'is-invalid' : ''}`}
                            id="steam"
                            name="steam"
                            value={signUpData.steam}
                            onChange={handleInputChange}
                        />
                        {errors.steam && <div className="invalid-feedback">{errors.steam}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nintendo" className="form-label">Nintendo:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.nintendo ? 'is-invalid' : ''}`}
                            id="nintendo"
                            name="nintendo"
                            value={signUpData.nintendo}
                            onChange={handleInputChange}
                        />
                        {errors.nintendo && <div className="invalid-feedback">{errors.nintendo}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="epicId" className="form-label">Epic ID:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.epicId ? 'is-invalid' : ''}`}
                            id="epicId"
                            name="epicId"
                            value={signUpData.epicId}
                            onChange={handleInputChange}
                        />
                        {errors.epicId && <div className="invalid-feedback">{errors.epicId}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="image" className="form-label">Profile Image:</label>
                        <input
                            type="file"
                            className="form-control"
                            id="image"
                            name="image"
                            onChange={handleFileChange}
                        />
                        {imageSrc && isCropping && (
                            <div>
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                    onZoomChange={setZoom}
                                />
                                <button type="button" className="btn btn-success mt-2" onClick={handleComplete}>
                                    Confirm Crop
                                </button>
                            </div>
                        )}
                        {croppedImage && (
                            <img src={croppedImage} alt="Cropped" className="profile-image" />
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-3">Sign Up</button>
                    {loading && <p className="text-center mt-3">
                        <span className="dot-flashing-container">
                            <span className="dot-flashing"></span>
                        </span>
                    </p>}
                    {errors.common && <p className="alert alert-danger mt-3">{errors.common}</p>}
                </form>
            </div>
        </div>
    );
};
