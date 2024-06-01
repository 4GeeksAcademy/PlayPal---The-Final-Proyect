import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'; // Una función que escribiremos para obtener la imagen recortada
import '../../styles/Modals.css'; // Importa los estilos


const ProfileSetupModal = ({ show, handleClose, handlePrev, signUpData, setSignUpData, onComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [isCropping, setIsCropping] = useState(false);



    const handleChange = (e) => {
        setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
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
            setCroppedImage(croppedImage);
            setSignUpData({ ...signUpData, imageFile: croppedImage });
            setIsCropping(false); // Salir del modo de recorte y ocultar el Cropper
            setImageSrc(null); // Ocultar el Cropper
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!croppedImage) {
            await handleComplete(); // Obtener la imagen recortada si aún no se ha hecho
        }
        onComplete(); // Continuar con el flujo de completar el registro
    };

    return (
        <div className={`modal ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Set up your profile</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="imageFile" className="form-label">Upload Profile Picture</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="imageFile"
                                    name="imageFile"
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
                                    </div>
                                )}


                            </div>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    name="username"
                                    value={signUpData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="bio" className="form-label">About Yourself</label>
                                <textarea
                                    className="form-control"
                                    id="bio"
                                    name="bio"
                                    value={signUpData.bio}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="gender" className="form-label">Gender</label>
                                <select
                                    className="form-select"
                                    id="gender"
                                    name="gender"
                                    value={signUpData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">Complete</button>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className={`btn ${isCropping ? 'btn-success' : 'btn-secondary'}`}
                            onClick={isCropping ? handleComplete : handlePrev}
                        >
                            {isCropping ? 'Confirm Crop' : 'Go Back'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetupModal;
