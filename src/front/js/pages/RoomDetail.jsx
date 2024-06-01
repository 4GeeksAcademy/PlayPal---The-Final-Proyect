import React, { useContext, useEffect, useState,  useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import fortniteImage from '../../img/Fortnite.png';
import xboxIcon from '../../img/xbox.png';
import switchIcon from '../../img/switch.png';
import exit from '../../img/exit.png';
import playstationIcon from '../../img/playstation.png';
import pcIcon from '../../img/pc.png';
import { IoExitOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import '../../styles/RoomDetail.css';
import RoomDetailsView from '../component/RoomInfoComponent.jsx';
import ParticipantsView from '../component/ParticipantsInfoComponent.jsx';
import CommentsSection from '../component/CommentsSection.jsx';


export const RoomDetail = () => {
    const { store, actions } = useContext(Context);
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [showRequests, setShowRequests] = useState(false);
    const [requests, setRequests] = useState([]);
    const [requestStatus, setRequestStatus] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [room, setRoom] = useState(null);
    const [currentView, setCurrentView] = useState('details');
    const username = localStorage.getItem('username');
    const userId = parseInt(localStorage.getItem('userId'));
    const token = localStorage.getItem('jwt-token');
    const [isParticipant, setIsParticipant] = useState(false);
    const intervalRef = useRef(null);

    const fetchData = async () => {
        try {
            await actions.fetchRooms();
            const fetchedRoom = store.rooms.find(room => room.room_id === parseInt(roomId));
            setRoom(fetchedRoom);

            await Promise.all([
                checkRequestStatus(),
                fetchComments(),
                fetchRequests()
            ]);

            if (fetchedRoom && fetchedRoom.participants) {
                const participant = fetchedRoom.participants.some(p => p.participant_id === userId && p.confirmed);
                setIsParticipant(participant);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data: ", error);
            setLoading(false);
        }
    };

    const updateDataPeriodically = async () => {
        try {
            await Promise.all([
                fetchRequests(),
                fetchComments(),
                checkRequestStatus()
            ]);
        } catch (error) {
            console.error("Error updating data: ", error);
        }
    };

    useEffect(() => {

        fetchData();

        intervalRef.current = setInterval(() => {
            updateDataPeriodically();
        }, 7000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [token, roomId, userId, navigate]);

    useEffect(() => {
        if (room && room.participants) {
            const participant = room.participants.some(p => p.participant_id === userId && p.confirmed);
            setIsParticipant(participant);
        }
    }, [room, userId]);

    useEffect(() => {
        if (showRequests) {
            fetchRequests();
        }
    }, [showRequests]);

    const checkRequestStatus = async () => {
        const status = await actions.checkRequestStatus(roomId);
        setRequestStatus(status);
    };

    const fetchRequests = async () => {
        try {
            const fetchedRequests = await actions.fetchRoomRequests(roomId);
            setRequests(fetchedRequests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const fetchComments = async () => {
        try {
            const fetchedComments = await actions.getComments(roomId);
            setComments(fetchedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async () => {
        if (!token) {
            console.error('No JWT token found');
            return;
        }

        if (newComment.trim() === '') return;
        const isHost = room.host_name === username;
        const success = await actions.addComment(roomId, newComment, isHost);
        if (success) {
            setNewComment('');
            fetchComments();
        } else {
            alert('Failed to add comment.');
        }
    };

    const handleKickParticipant = async (participantId) => {
        if (!token) {
            console.error('No JWT token found');
            return;
        }

        const success = await actions.updateParticipantStatus(roomId, participantId, 'kicked');
        if (success) {
            setRoom(prevRoom => ({
                ...prevRoom,
                participants: prevRoom.participants.map(p =>
                    p.participant_id === participantId ? { ...p, confirmed: false, status: 'kicked' } : p
                ).filter(p => p.status !== 'kicked')
            }));
            alert('Participant kicked successfully!');
        } else {
            alert('Failed to kick participant.');
        }
    };

    const handleJoinRoom = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        const success = await actions.joinRoom(roomId);
        if (success) {
            alert('Join request sent successfully!');
            setRequestStatus('pending');
        } else {
            alert('Failed to send join request.');
        }
    };

    const handleAbandonRoom = async () => {
        if (!token) {
            console.error('No JWT token found');
            return;
        }

        const success = await actions.updateParticipantStatus(roomId, userId, 'abandoned');
        if (success) {
            setRoom(prevRoom => ({
                ...prevRoom,
                participants: prevRoom.participants.filter(p => p.participant_id !== userId)
            }));
            alert('You have successfully abandoned the room');
            navigate('/');
        } else {
            alert('Failed to abandon the room.');
        }
    };

    const handleWithdrawRequest = async () => {
        const success = await actions.withdrawRequest(roomId);
        if (success) {
            alert('Request withdrawn successfully!');
            setRequestStatus(null);
        } else {
            alert('Failed to withdraw request.');
        }
    };

    const handleToggleRequests = () => {
        setShowRequests(prevShowRequests => !prevShowRequests);
    };

    const handleRequestAction = async (requestId, action) => {
        const success = await actions.updateRoomRequest(roomId, requestId, action);
        if (success) {
            setRequests(prevRequests => prevRequests.filter(req => req.room_request_id !== requestId));
            if (action === 'accepted') {
                const participant = requests.find(req => req.room_request_id === requestId);
                setRoom(prevRoom => ({
                    ...prevRoom,
                    participants: [...prevRoom.participants, participant]
                }));
            }
        } else {
            alert('Failed to update request.');
        }
    };

    if (loading || !room) {
        return <div>Loading...</div>;
    }

    const formatDateTime = (startDate, startTime, endDate = null, endTime = null) => {
        const startDateTime = new Date(`${startDate} ${startTime}`);
        const formattedStart = startDateTime.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        if (endDate && endTime) {
            const endDateTime = new Date(`${endDate} ${endTime}`);
            const formattedEnd = endDateTime.toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
            return `Starts: ${formattedStart} | Finishes: ${formattedEnd}`;
        } else {
            return `Starts: ${formattedStart}`;
        }
    };

    const renderPlatformIcon = (platform) => {
        const iconStyle = { width: '26px', height: '26px', position: 'relative', top: '-5px' };
        switch (platform.toLowerCase()) {
            case 'xbox':
                return <img src={xboxIcon} alt="Xbox" style={iconStyle} />;
            case 'switch':
                return <img src={switchIcon} alt="Switch" style={iconStyle} />;
            case 'PlayStation':
                return <img src={playstationIcon} alt="PlayStation" style={iconStyle} />;
            case 'pc':
                return <img src={pcIcon} alt="PC" style={iconStyle} />;
            default:
                return null;
        }
    };

    const countPendingRequests = () => {
        return requests.filter(request => request.status === 'pending').length;
    };

    const handleToggleView = (view, fetchRequests = false) => {
        setCurrentView(view);
        if (fetchRequests) {
            handleToggleRequests();
        }
    };
    const isHost = room.host_name === username;
    const isParticipantOrHost = isHost || room.participants.some(p => p.participant_id === userId && p.confirmed);
    console.log(isParticipantOrHost)

    const participantsCount = room.participants ? room.participants.length : 0;

    const startDate = room.date;
    const startTime = room.time;
    const endDate = room.end_date || null;
    const endTime = room.end_time || null;

    const formattedDateTime = formatDateTime(startDate, startTime, endDate, endTime);
    console.log(requests)
    return (
        <div>
            <div className="back">
                <button className="go-back" onClick={() => navigate('/')}>Go back</button>
            </div>

            <div className={`${!isParticipantOrHost ? 'room-detail-small' : 'room-detail'}`}>
                <div className="room-header">
                    <img src={fortniteImage} alt="Room Image" className="room-image" />
                    <div className="room-info">
                        <div className='d-flex justify-content-between text-info'>
                            <p>{room.game_name}</p>
                            <p className="text-info fs-6 fw-semibold font-family-Inter m-0">
                                <FaUser /> {participantsCount}/{room.room_size}
                                {isParticipant && (
                                    <button className="exit-button">
                                        <img src={exit} alt="Exit Room" onClick={handleAbandonRoom} />
                                    </button>
                                )}
                            </p>
                        </div>
                        {isHost && (
                            <div className="room-pills">
                                <button className={`pill-detail ${currentView === 'details' ? 'active' : ''}`} onClick={() => handleToggleView('details')}>Room Details</button>
                                <button className={`pill-participants ${currentView === 'participants' ? 'active' : ''}`} onClick={() => handleToggleView('participants')}>
                                    Members & Requests ({countPendingRequests()})
                                </button>
                            </div>
                        )}
                        {currentView === 'details' && (
                            <RoomDetailsView
                                room={room}
                                className="p-0"
                                participantsCount={participantsCount}
                                formattedDateTime={formattedDateTime}
                                renderPlatformIcon={renderPlatformIcon}
                                handleKickParticipant={handleKickParticipant}
                                isHost={isHost}
                            />
                        )}
                        {currentView === 'participants' && (
                            <ParticipantsView
                            requests={requests}
                            participants={room.participants} // Aquí pasamos los participantes
                            handleRequestAction={handleRequestAction}
                        />
                        )}
                    </div>
                </div>
                {!isParticipantOrHost && (

                    <div className="room-actions">
                        <button className="back-btn btn btn-outline-primary" onClick={() => navigate('/')}>Go Back</button>
                        {requestStatus === 'None' && <button className="join-room" onClick={handleJoinRoom}>Join Room</button>}
                        {requestStatus === 'pending' && <button className='btn-danger withdraw' onClick={handleWithdrawRequest}>Withdraw Request</button>}
                    </div>
                )}
                {isParticipantOrHost && (
                    <CommentsSection
                        roomId={roomId}
                        token={token}
                        username={username}
                        room={room}
                        actions={actions}
                    />
                )}

                {isParticipantOrHost && !isHost && (
                    <div>
                        <button onClick={handleAbandonRoom}>Abandon Room</button>
                    </div>
                )}
            </div>
        </div>
    );
};
