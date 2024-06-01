const apiUrl = process.env.BACKEND_URL; // Ensure this does not end with a slash

const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            rooms: [],
            games: [],
            loadingRooms: false,
            user: null,
            requestStatus: null,
            comments: [] // New state to store comments
        },

        actions: {
            submitLogInForm: async (logInData) => {
                try {
                    let response = await fetch(`${apiUrl}/api/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(logInData)
                    });
                    if (!response.ok) {
                        throw new Error('Failed to log in');
                    }

                    let data = await response.json();
                    localStorage.setItem("jwt-token", data.token);
                    localStorage.setItem("userId", data.user_id); // Guardar userId en localStorage
                    localStorage.setItem("username", data.username)
                    setStore({ user: data });

                    return true;
                } catch (error) {
                    console.error('Error logging user in:', error);
                    return false;
                }
            },

            uploadImageToCloudinary: async (imageFile) => {
                const preset_name = 'sducy1dm';
                const cloud_name = 'dwnbekby9';
            
                const data = new FormData();
                data.append('file', imageFile);
                data.append('upload_preset', preset_name);
            
                try {
                    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                        method: 'POST',
                        body: data
                    });
            
                    if (!response.ok) {
                        throw new Error('Failed to upload image');
                    }
            
                    const file = await response.json();
                    const originalUrl = file.secure_url;
            
                    console.log("Original URL: ", originalUrl); // Verificar la URL original
            
                    return originalUrl;
                } catch (error) {
                    console.error('Error uploading image:', error);
                    return null;
                }
            },
            
                       
            submitSignUpForm: async (signUpData) => {
                try {
                    // Extrae imageFile de signUpData y guarda el resto de los datos en 'rest'
                    const { imageFile, ...rest } = signUpData;
            
                    let imageUrl = null;
                    if (imageFile) {
                        // Si hay un archivo de imagen, súbelo a Cloudinary usando la acción uploadImageToCloudinary
                        const originalUrl = await getActions().uploadImageToCloudinary(imageFile);
                        if (!originalUrl) throw new Error('Failed to upload image to Cloudinary');
            
                        console.log("Original URL from Cloudinary: ", originalUrl);
            
                        // Aplica transformaciones a la URL de la imagen
                        const transformations = 'ar_1:1,c_auto,g_auto,w_500,r_max';
                        imageUrl = originalUrl.replace('/upload/', `/upload/${transformations}/`);
            
                        console.log("Transformed URL: ", imageUrl); // Verificar la URL transformada
                    }
            
                    // Si no hay imagen, establecer un valor predeterminado o manejar el caso como prefieras
                    if (!imageUrl) {
                        imageUrl = 'default_image_url'; // Cambia esto según sea necesario
                    }
            
                    console.log("Image URL to be saved: ", imageUrl); // Verificar la URL antes de guardarla
            
                    // Crea el signUpData de datos para el registro, incluyendo la URL de la imagen si existe
                    const updatedSignUpData = { ...rest, url_image: imageUrl };
                    let response = await fetch(`${apiUrl}/api/signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedSignUpData)
                    });
            
                    if (!response.ok) {
                        throw new Error('Failed to create user');
                    }
            
                    return true;
                } catch (error) {
                    console.error('Error creating user:', error);
                    return false;
                }
            },
            
            
            
            requestResetPassword: async (email) => {
                const store = getStore();
                try {
                    const response = await fetch(`${apiUrl}/api/request-reset-password`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email })
                    });

                    if (!response.ok) throw new Error("Failed to request password reset");

                    const data = await response.json();
                    if (data.token) {
                        // Guardar el token de alguna manera, por ejemplo, en el localStorage
                        localStorage.setItem('resetToken', data.token);
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error(error);
                    return false;
                }
            },

            resetPassword: async (password) => {
                const store = getStore();
                try {
                    // Obtener el token desde el localStorage
                    const token = localStorage.getItem('resetToken');
                    if (!token) throw new Error("No reset token found");

                    const response = await fetch(`${apiUrl}/api/reset-password/${token}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ password })
                    });

                    if (!response.ok) throw new Error("Failed to reset password");

                    console.log("Password has been reset.");
                    // Eliminar el token del localStorage después de usarlo
                    localStorage.removeItem('resetToken');
                    return true;
                } catch (error) {
                    console.error(error);
                    return false;
                }
            },


            fetchRooms: async () => {
                const store = getStore();
                setStore({ loadingRooms: true });

                try {
                    let response = await fetch(`${apiUrl}/api/home`);
                    if (!response.ok) throw new Error("Couldn't fetch current rooms");
                    let roomsData = await response.json();
                    setStore({
                        rooms: roomsData,
                        loadingRooms: false
                    });
                    console.log(store.rooms);
                    return true;
                } catch (error) {
                    console.error(error);
                    setStore({ loadingRooms: false });
                    return false;
                }
            },

            searchRooms: (searchTerm, mood) => {
                const store = getStore();
                let filteredRooms = store.rooms;
                if (searchTerm) {
                    filteredRooms = filteredRooms.filter(room =>
                        room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        room.game_name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                if (mood) {
                    filteredRooms = filteredRooms.filter(room => room.mood.toLowerCase() === mood.toLowerCase());
                }
                return filteredRooms;
            },

            logout: () => {
                localStorage.removeItem('jwt-token');
                localStorage.removeItem('userId')
                localStorage.removeItem('username'); // Eliminar userId de localStorage
                setStore({ user: null });
            },

            getProfile: async () => {
                const store = getStore();
                const token = localStorage.getItem('jwt-token');
                const userId = localStorage.getItem('userId'); // Obtener userId de localStorage
                if (!token || !userId) return null;

                try {
                    const response = await fetch(`${apiUrl}/api/user/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to fetch profile data');
                    const data = await response.json();
                    setStore({ user: data });
                    return data;
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                    return null;
                }
            },

            updateProfile: async (profileData) => {
                const token = localStorage.getItem('jwt-token');
                const userId = localStorage.getItem('userId'); // Obtener userId de localStorage
                if (!token || !userId) return false;

                try {
                    const response = await fetch(`${apiUrl}/api/user/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(profileData)
                    });
                    if (!response.ok) throw new Error('Failed to update profile');
                    const data = await response.json();
                    setStore({ user: data });
                    return true;
                } catch (error) {
                    console.error('Error updating profile:', error);
                    return false;
                }
            },

            deleteProfile: async () => {
                const token = localStorage.getItem('jwt-token');
                const userId = localStorage.getItem('userId'); // Obtener userId de localStorage
                if (!token || !userId) return false;

                try {
                    const response = await fetch(`${apiUrl}/api/user/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to delete profile');
                    localStorage.removeItem('jwt-token');
                    localStorage.removeItem('userId'); // Eliminar userId de localStorage
                    setStore({ user: null });
                    return true;
                } catch (error) {
                    console.error('Error deleting profile:', error);
                    return false;
                }
            },

            createRoom: async (roomData) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return false;

                try {
                    const response = await fetch(`${apiUrl}/api/create_room`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(roomData)
                    });
                    if (!response.ok) throw new Error('Failed to create room');
                    const data = await response.json();
                    const store = getStore();
                    setStore({ rooms: [...store.rooms, data.room] });
                    return true;
                } catch (error) {
                    console.error('Error creating room:', error);
                    return false;
                }
            },

            deleteRoom: async (roomId) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return false;

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to delete room');
                    const store = getStore();
                    setStore({ rooms: store.rooms.filter(room => room.id !== roomId) });
                    return true;
                } catch (error) {
                    console.error('Error deleting room:', error);
                    return false;
                }
            },

            updateRoom: async (roomId, roomData) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return false;

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(roomData)
                    });
                    if (!response.ok) throw new Error('Failed to update room');
                    const data = await response.json();
                    const store = getStore();
                    setStore({ rooms: store.rooms.map(room => room.id === roomId ? data.room : room) });
                    return true;
                } catch (error) {
                    console.error('Error updating room:', error);
                    return false;
                }
            },

            fetchGames: async () => {
                try {
                    const store = getStore()
                    let response = await fetch(`${apiUrl}/api/games`);
                    if (!response.ok) throw new Error("Couldn't fetch games");
                    let gamesData = await response.json();
                    setStore({ games: gamesData });
                    console.log(store.games)
                    return true;
                } catch (error) {
                    console.error(error);
                    return false;
                }
            },
            initializeData: async () => {
                const store = setStore()
                setStore({ loading: true });
                try {
                    await Promise.all([getActions().fetchGames(), getActions().fetchRooms()]);
                    setStore({ loading: false });
                } catch (error) {
                    console.error('Error initializing data:', error);
                    setStore({ loading: false });
                    console.log(store)
                }
            },
            joinRoom: async (roomId) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return false;

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/join`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error joining room:', errorData);
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    return true;
                } catch (error) {
                    console.error('Error joining room:', error);
                    return false;
                }
            },

            fetchRoomRequests: async (roomId) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return [];

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/requests`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to fetch room requests');
                    const data = await response.json();
                    return data.requests;
                } catch (error) {
                    console.error('Error fetching room requests:', error);
                    return [];
                }
            },

            updateRoomRequest: async (roomId, requestId, status) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return false;

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/requests/${requestId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ status })
                    });
                    if (!response.ok) throw new Error('Failed to update room request');
                    return true;
                } catch (error) {
                    console.error('Error updating room request:', error);
                    return false;
                }
            },
            checkRequestStatus: async (roomId) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return null;

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/request_status`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to fetch request status');
                    const data = await response.json();
                    setStore({ requestStatus: data.request_status });
                    return data.request_status;
                } catch (error) {
                    console.error('Error fetching request status:', error);
                    return null;
                }
            },
            withdrawRequest: async (roomId) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return null;

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/withdraw_request`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to withdraw request');
                    const data = await response.json();
                    setStore({ requestStatus: null });
                    return true;
                } catch (error) {
                    console.error('Error withdrawing request:', error);
                    return false;
                }
            },

            getComments: async (roomId) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) return [];

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/comments`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) throw new Error('Failed to fetch comments');
                    const data = await response.json();

                    return data.comments;
                } catch (error) {
                    console.error('Error fetching comments:', error);
                    return [];
                }
            },
            addComment: async (roomId, content, isHost) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) {
                    console.error('No JWT token found');
                    return false;
                }

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/comments`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ content, isHost })
                    });
                    if (!response.ok) throw new Error('Failed to add comment');
                    return true;
                } catch (error) {
                    console.error('Error adding comment:', error);
                    return false;
                }
            },
            updateParticipantStatus: async (roomId, participantId, status) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) {
                    console.error('No JWT token found');
                    return false;
                }

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/update_participant_status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ participant_id: participantId, status })
                    });
                    if (!response.ok) throw new Error(`Failed to update participant status to ${status}`);
                    return true;
                } catch (error) {
                    console.error(`Error updating participant status to ${status}:`, error);
                    return false;
                }
            },

            updateParticipantStatus: async (roomId, participantId, status) => {
                const token = localStorage.getItem('jwt-token');
                if (!token) {
                    console.error('No JWT token found');
                    return false;
                }

                try {
                    const response = await fetch(`${apiUrl}/api/room/${roomId}/update_participant_status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ participant_id: participantId, status })
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error updating participant status:', errorData);
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    return true;
                } catch (error) {
                    console.error('Error updating participant status:', error);
                    return false;
                }
            },

        }
    };
};

export default getState;
