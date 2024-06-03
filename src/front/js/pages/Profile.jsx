import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import switchIcon from '../../img/switch.png';
import playstationIcon from '../../img/playstation.png';
import xboxIcon from '../../img/xbox.png';
import steamIcon from '../../img/steam.png';
import discordIcon from '../../img/discord.png';
import epicIcon from '../../img/epic.png';
import '../../styles/profile.css';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

export const Profile = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

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

    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const platforms = [
        { name: 'Xbox', icon: xboxIcon },
        { name: 'PSN', icon: playstationIcon },
        { name: 'Steam', icon: steamIcon },
        { name: 'Discord', icon: discordIcon },
        { name: 'Switch', icon: switchIcon },
        { name: 'Epic ID', icon: epicIcon }
    ];
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [editingImage, setEditingImage] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');

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



    //--------------PROFILE IMAGE HANDLERS------------------------------------------------------------------------------------------------------



    // Activa la edición de la imagen de perfil
    const handleEditPictureClick = () => {
        setEditingImage(true);
    };
    // Maneja el cambio de archivo seleccionado
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImageSrc(reader.result);
            setIsCropping(true);
        };
    };

    const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCroppedImage = async () => {
        if (!croppedAreaPixels) {
            console.error('No crop area defined.');
            return;
        }
        try {
            const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            console.log('Cropped image file:', croppedImageFile);

            const updatedProfile = await actions.editCloudinaryImage(croppedImageFile);
            if (!updatedProfile) {
                throw new Error('Failed to upload and update profile image');
            }

            setProfileData(updatedProfile);
            setImageFile(null);
            setEditingImage(false);
            setIsCropping(false);
            setImageSrc(null);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    // Cancela la edición de la imagen de perfil
    const handleCancelEditing = () => {
        setEditingImage(false);
        setImageFile(null);
        setIsCropping(false);
        setImageSrc(null);
    };

    // Sube la nueva imagen y actualiza el perfil
    const handleImageUpload = async () => {
        if (!imageFile) {
            console.error('No file selected.');
            return;
        }
        try {
            // Llama a la acción para subir la imagen y actualizar el perfil

            const updatedProfile = await actions.editCloudinaryImage(imageFile);
            if (!updatedProfile) {
                throw new Error('Failed to upload and update profile image');
            }

            // Actualiza el estado local con el perfil recién actualizado
            setProfileData(updatedProfile);
            setImageFile(null); // Limpia el archivo seleccionado
            setEditingImage(false); // Sale del modo de edición
            setIsCropping(false);
        } catch (error) {
            console.error(error.message || 'An unexpected error occurred.');
        }
    };


    //-----------HANDLER PARA EDITAR INFORMACION--------------------------------------------------------------------------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
        } else {
            setProfileData({ ...profileData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (profileData.password !== confirmPassword) {
            setError('Passwords do not match.');
            return; // Detiene la función si las contraseñas no coinciden
        }

        try {
            // Actualiza solo los datos del perfil, excluyendo la imagen
            const success = await actions.updateProfile(profileData);
            if (success) {
                const updatedProfile = await actions.getProfile(); // Recarga el perfil después de la actualización
                localStorage.setItem('username', updatedProfile.username); // Actualiza el nombre de usuario en localStorage
                setProfileData(updatedProfile);
                setIsEditing(false); // Salir del modo de edición
                setConfirmPassword('');
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    //------DELETING PROFILE HANDLERS-------------------------------------------------------------------------------------------------

    // Abre el modal de confirmación
    const handleDeleteClick = () => {
        setShowConfirmModal(true);
    };

    // Maneja la confirmación de la eliminación
    const handleConfirmDelete = async () => {
        try {
            const success = await actions.deleteProfile();
            if (success) {
                navigate('/signup');  // Navega al signup tras eliminar el perfil
                setShowConfirmModal(false);  // Cierra el modal
            } else {
                setError('Failed to delete profile. Please try again.');
                setShowConfirmModal(false);  // Asegura cerrar el modal incluso si hay error
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
            setShowConfirmModal(false);  // Cierra el modal en caso de error
        }
    };

    // Cierra el modal sin realizar acciones
    const handleCloseModal = () => {
        setShowConfirmModal(false);
    };

    //-------------------------------------------------------------------------------------------------------------------------------------

    return (
        <div className="container mt-3 profile-container" >
            <p style={{ marginLeft: '25px', marginTop: '15px', marginBottom: '20px' }}>
                Profile Settings
            </p>
            <div className="mb-3 row" style={{ marginLeft: '25px', marginRight: '25px' }}>
                {profileData.url_image && (
                    <img src={profileData.url_image} alt="Profile" className="profile-image" style={{ width: '100px', height: '100px' }} />
                )}
                <div className="col" style={{ marginLeft: '25px', marginTop: '20px' }}>
                    {!imageSrc ? (
                        <>
                            <input
                                type="file"
                                id="fileInput"
                                name="image"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                className="form-control"
                            />
                            <button className="join-room btn-secondary" onClick={() => document.getElementById('fileInput').click()}>
                                Edit Profile Picture
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={handleCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>
                            <div className="controls" style={{ padding: '10px' }}>
                                <label htmlFor="zoom">Zoom:</label>
                                <input
                                    type="range"
                                    id="zoom"
                                    name="zoom"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="button-container">
                                <button className="join-room button-save" onClick={handleSaveCroppedImage}>
                                    Save
                                </button>
                                <button className="withdraw" style={{ color: "white" }} onClick={handleCancelEditing}>
                                    Cancel
                                </button>
                            </div>

                        </>
                    )}
                </div>
            </div>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit} style={{ marginLeft: '25px', marginRight: '25px' }}>
                <div className="row">
                    {/** Username and Email */}
                    <div className="mb-3 col-6">
                        <label>Username:</label>
                        <input type="text" name="username" value={profileData.username} onChange={handleInputChange} readOnly={!isEditing} className="form-control" />
                    </div>
                    <div className="mb-3 col-6">
                        <label>
                            {isEditing ? "You cannot change your email address" : "Email:"}
                        </label>
                        <input
                            type="text"
                            name="email"
                            value={profileData.email}
                            readOnly // Este campo siempre es de solo lectura
                            className="form-control"
                        />
                    </div>
                </div>
                {/** First Name and Last Name */}
                <div className="row">
                    <div className="mb-3 col-6">
                        <label>First Name:</label>
                        <input type="text" name="first_name" value={profileData.first_name} onChange={handleInputChange} readOnly={!isEditing} className="form-control" />
                    </div>
                    <div className="mb-3 col-6">
                        <label>Last Name:</label>
                        <input type="text" name="last_name" value={profileData.last_name} onChange={handleInputChange} readOnly={!isEditing} className="form-control" />
                    </div>
                </div>
                {/** Password*/}
                {isEditing && (
                    <div className="row">
                        <div className="mb-3 col-6">
                            <label>Password:</label>
                            <input
                                type="password" // Cambiado a password para ocultar la entrada
                                name="password"
                                value={profileData.password}
                                onChange={handleInputChange}
                                className="form-control"
                                readOnly={!isEditing}
                            />
                        </div>
                        <div className="mb-3 col-6">
                            <label>Confirm Password:</label>
                            <input
                                type="password" // Cambiado a password para ocultar la entrada
                                name="confirmPassword" // Asegúrate de manejar este estado en tu componente
                                value={confirmPassword} // Este estado debe ser añadido y manejado en tus estados
                                onChange={(e) => setConfirmPassword(e.target.value)} // Añade y maneja el cambio específicamente para confirmPassword
                                className="form-control"
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>
                )}
                {/** Age and Gender */}
                <div className="row">
                    <div className="mb-3 col-6">
                        <label>Age:</label>
                        <input type="text" name="age" value={profileData.age} onChange={handleInputChange} readOnly={!isEditing} className="form-control" />
                    </div>
                    <div className="mb-3 col-6">
                        <label>Gender:</label>
                        <input type="text" name="gender" value={profileData.gender} onChange={handleInputChange} readOnly={!isEditing} className="form-control" />
                    </div>
                </div>
                {/** Bio */}
                <div className="row">
                    <div className="mb-3 col-12">
                        <label>About yourself:</label>
                        <textarea name="bio" value={profileData.bio} onChange={handleInputChange} readOnly={!isEditing} className="form-control" placeholder='type something...'></textarea>
                    </div>
                </div>
                {/** Gaming Profiles */}
                <div className="row">
                    {platforms.map((platform, index) => (
                        <div className="mb-3 col-4" key={index}>
                            <label>
                                <img src={platform.icon} alt={platform.name} style={{ width: '24px', marginRight: '10px' }} />
                            </label>
                            <input
                                type="text"
                                name={platform.name.replace(/\s/g, '').toLowerCase()}
                                value={profileData[platform.name.replace(/\s/g, '').toLowerCase()]}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className="form-control mb-3"
                            />
                        </div>
                    ))}
                </div>
                {/** Other Details */}
                <div className="row">
                    {["Region", "Timezone", "Languages"].map((detail, index) => (
                        <div className="mb-3 col-4" key={index}>
                            <label className="me-2">{detail}:</label>
                            <input
                                type="text"
                                name={detail.toLowerCase()}
                                value={profileData[detail.toLowerCase()]}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className="form-control mb-3"
                            />
                        </div>
                    ))}
                </div>
            </form>

            <div className="d-flex justify-content-end" style={{ marginLeft: '25px', marginRight: '25px' }}>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="join-room">
                        Edit Profile
                    </button>
                )}
                {isEditing && (
                    <div className="d-flex justify-content-between align-items-center button-group">
                        <div>
                            <button onClick={handleDeleteClick} className="btn btn-danger">
                                Delete Profile
                            </button>
                            {showConfirmModal && (
                                <div className="modal show" style={{ display: 'block' }}>
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Confirm Deletion</h5>
                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
                                            </div>
                                            <div className="modal-footer" >
                                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Delete Profile</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="d-flex">
                            <button onClick={handleSubmit} className="btn btn-primary mr-2">Update Profile</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel Changes</button>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-danger">{error}</p>}
        </div>
    );
};
