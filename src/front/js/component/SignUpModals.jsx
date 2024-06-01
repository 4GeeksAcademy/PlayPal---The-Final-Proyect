import React, { useState, useContext } from 'react';
import { Context } from '../store/appContext';
import PersonalInfoModal from './PersonalInfoModal.jsx';
import FavoritePlatformModal from './FavoritePlatformModal.jsx';
import ProfileSetupModal from './ProfileSetupModal.jsx';

const SignUpModals = ({ handleClose }) => {
    const { actions } = useContext(Context);
    const [currentModal, setCurrentModal] = useState(1);
    const [signUpData, setSignUpData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
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

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setSignUpData({ ...signUpData, [field]: value });
    };

    const handleNext = () => setCurrentModal(currentModal + 1);
    const handlePrev = () => setCurrentModal(currentModal - 1);
    const closeAllModals = () => {
        setCurrentModal(1);
        handleClose();
    };

    const handleComplete = async () => {
        try {
            setLoading(true);
            let success = await actions.submitSignUpForm(signUpData);
            if (success) {
                handleClose();
            } else {
                setError('Failed to create user. Please try again.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {currentModal === 1 && (
                <PersonalInfoModal
                    show={currentModal === 1}
                    handleClose={closeAllModals}
                    handleNext={handleNext}
                    onInputChange={handleInputChange}
                    signUpData={signUpData}
                />
            )}
            {currentModal === 2 && (
                <FavoritePlatformModal
                    show={currentModal === 2}
                    handleClose={closeAllModals}
                    handleNext={handleNext}
                    handlePrev={handlePrev}
                    onInputChange={handleInputChange}
                />
            )}
            {currentModal === 3 && (
                <ProfileSetupModal
                    show={currentModal === 3}
                    handleClose={closeAllModals}
                    handlePrev={handlePrev}
                    signUpData={signUpData}
                    setSignUpData={setSignUpData}
                    onComplete={handleComplete}
                />
            )}
        </>
    );
};

export default SignUpModals;
