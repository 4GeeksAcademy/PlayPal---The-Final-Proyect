import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/profile.css';

export const Profile = () => {
    const { store, actions } = useContext(Context);
    const [profileData, setProfileData] = useState(store.user || {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        age: '',
        region: '',
        timezone: '',
        languages: '',
        xbox: '',
        psn: '',
        steam: '',
        discord: '',
        nintendo: '',
        epic_id: '',
        bio: '',
        gender: '',
        url_image: '' // Añadir url_image al estado inicial
    });
    const [imageFile, setImageFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/login'); // Redirige si no hay userId en localStorage
                return;
            }
            const userData = await actions.getProfile(); // Llama a la acción para obtener los datos del perfil
            if (userData) {
                setProfileData(userData); // Actualiza el estado local con los datos obtenidos
            } else {
                navigate('/login'); // Redirige si no se pudieron obtener los datos del usuario
            }
        };

        fetchProfile(); // Ejecuta la función para obtener los datos del perfil al montar el componente
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            let updatedProfileData = { ...profileData };

            if (imageFile) {
                const imageUrl = await actions.uploadImageToCloudinary(imageFile);
                if (!imageUrl) {
                    throw new Error('Failed to upload image to Cloudinary');
                }
                updatedProfileData.url_image = imageUrl;
            }

            const success = await actions.updateProfile(updatedProfileData);
            if (success) {
                const updatedProfile = await actions.getProfile(); // Fetch the profile again after update
                localStorage.setItem('username', updatedProfile.username); // Update username in localStorage
                setProfileData(updatedProfile);
                setIsEditing(false);
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            const success = await actions.deleteProfile();
            if (success) {
                navigate('/signup');
            } else {
                setError('Failed to delete profile. Please try again.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div>
            <h1>Profile</h1>
            {!isEditing ? (
                <div>
                    {profileData.url_image && (
                        <img src={profileData.url_image} alt="Profile"  className="profile-image"/>
                    )}
                    <p>Email: {profileData.email}</p>
                    <p>Username: {profileData.username}</p>
                    <p>First Name: {profileData.first_name}</p>
                    <p>Last Name: {profileData.last_name}</p>
                    <p>Age: {profileData.age}</p>
                    <p>Region: {profileData.region}</p>
                    <p>Timezone: {profileData.timezone}</p>
                    <p>Languages: {profileData.languages}</p>
                    <p>Xbox: {profileData.xbox}</p>
                    <p>PSN: {profileData.psn}</p>
                    <p>Steam: {profileData.steam}</p>
                    <p>Discord: {profileData.discord}</p>
                    <p>Nintendo: {profileData.nintendo}</p>
                    <p>Epic ID: {profileData.epic_id}</p>
                    <p>Bio: {profileData.bio}</p>
                    <p>Gender: {profileData.gender}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                    />
                    <label>First Name:</label>
                    <input
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleInputChange}
                    />
                    <label>Last Name:</label>
                    <input
                        type="text"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleInputChange}
                    />
                    <label>Age:</label>
                    <input
                        type="number"
                        name="age"
                        value={profileData.age}
                        onChange={handleInputChange}
                    />
                    <label>Region:</label>
                    <input
                        type="text"
                        name="region"
                        value={profileData.region}
                        onChange={handleInputChange}
                    />
                    <label>Timezone:</label>
                    <input
                        type="text"
                        name="timezone"
                        value={profileData.timezone}
                        onChange={handleInputChange}
                    />
                    <label>Languages:</label>
                    <input
                        type="text"
                        name="languages"
                        value={profileData.languages}
                        onChange={handleInputChange}
                    />
                    <label>Xbox:</label>
                    <input
                        type="text"
                        name="xbox"
                        value={profileData.xbox}
                        onChange={handleInputChange}
                    />
                    <label>PSN:</label>
                    <input
                        type="text"
                        name="psn"
                        value={profileData.psn}
                        onChange={handleInputChange}
                    />
                    <label>Steam:</label>
                    <input
                        type="text"
                        name="steam"
                        value={profileData.steam}
                        onChange={handleInputChange}
                    />
                    <label>Discord:</label>
                    <input
                        type="text"
                        name="discord"
                        value={profileData.discord}
                        onChange={handleInputChange}
                    />
                    <label>Nintendo:</label>
                    <input
                        type="text"
                        name="nintendo"
                        value={profileData.nintendo}
                        onChange={handleInputChange}
                    />
                    <label>Epic ID:</label>
                    <input
                        type="text"
                        name="epic_id"
                        value={profileData.epic_id}
                        onChange={handleInputChange}
                    />
                    <label>Bio:</label>
                    <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                    ></textarea>
                    <label>Gender:</label>
                    <input
                        type="text"
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                    />
                    <label>Profile Image:</label>
                    <input type="file" name="image" onChange={handleFileChange} />
                    <button type="submit">Update Profile</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
            )}
            <button onClick={handleDelete}>Delete Profile</button>
            {error && <p>{error}</p>}
        </div>
    );
};
