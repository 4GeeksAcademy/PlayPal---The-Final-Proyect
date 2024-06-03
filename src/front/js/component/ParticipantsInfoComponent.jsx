import React, { useState } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import xboxIcon from '../../img/xbox.png';
import switchIcon from '../../img/switch.png';
import playstationIcon from '../../img/playstation.png';
import pcIcon from '../../img/pc.png';
import discordIcon from '../../img/discord.png';

const renderPlatformIcon = (platform) => {
    if (!platform) {
        return null; // Si platform es undefined o null, no renderizar nada
    }
    const iconStyle = { width: '26px', height: '26px', position: 'relative', top: '-5px' };
    switch (platform.toLowerCase()) {
        case 'xbox':
            return <img src={xboxIcon} alt="Xbox" style={iconStyle} />;
        case 'switch':
        case 'nintendo':
            return <img src={switchIcon} alt="Switch" style={iconStyle} />;
        case 'psn':
        case 'playstation':
            return <img src={playstationIcon} alt="PlayStation" style={iconStyle} />;
        case 'steam':
        case 'pc':
            return <img src={pcIcon} alt="PC" style={iconStyle} />;
        case 'discord':
            return <img src={discordIcon} alt="Discord" style={iconStyle} />; // Assuming you have a Discord icon
        case 'epic_id':
            return <img src={pcIcon} alt="Epic" style={iconStyle} />; // Change the icon accordingly
        default:
            return null;
    }
};

const ParticipantsView = ({ requests, participants, handleRequestAction, handleKickParticipant }) => {
    const [showMenu, setShowMenu] = useState(null);

    const toggleMenu = (participant_id) => {
        setShowMenu(showMenu === participant_id ? null : participant_id);
    };

    return (
        <div className="participants-view">
            <h3>Participants</h3>
            <div className="">
                {participants.map(participant => (
                    <div key={participant.participant_id} className="participant d-flex justify-content-between align-items-center">
                        <div className='align-items-center'>
                            <img
                                src={participant.profile_image_url}
                                alt={`${participant.participant_name}'s profile`}
                                className="profile-image"
                            />
                            <strong>{participant.participant_name}</strong>
                        </div>
                        <div className='d-flex align-items-center p-2 m-0' >
                            <div className='d-flex align-items-center' style={{ marginRight: '10px' }}  >
                                <div>
                                    {renderPlatformIcon(participant.platform)}
                                </div>
                                <div style={{ marginLeft: '5px' }}>
                                    {participant.platform_id}
                                </div>
                            </div>
                            <div>
                                {participant.discord_id && (
                                    <span style={{ marginRight: '10px' }}>
                                        {renderPlatformIcon('discord')}
                                        {participant.discord_id}
                                    </span>
                                )}
                            </div>
                            <div className="menu-container" style={{ position: 'relative' }}>
                                <FaEllipsisV onClick={() => toggleMenu(participant.participant_id)} style={{ cursor: 'pointer' }} />
                                {showMenu === participant.participant_id && (
                                    <div className="menu" style={{ position: 'absolute', right: 0, top: '20px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', zIndex: 1000 }}>
                                        <button onClick={() => handleKickParticipant(participant.participant_id)} style={{ display: 'block', width: '100%', padding: '5px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            Kick
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <h3>Requests</h3>
            <div className="requests-list">
                {requests.map(request => (
                    <div key={request.room_request_id} className="request d-flex justify-content-between align-items-center">
                        <div className='d-flex align-items-center'>
                        <img
                            src={request.profile_image_url}
                            alt={`${request.participant_name}'s profile`}
                            className="profile-image"
                        />
                        <p>
                            <strong>{request.participant_name}</strong>
                        </p>
                        </div>
                      
                        <div className="d-flex ">
                            <button className="join-room mx-3" onClick={() => handleRequestAction(request.room_request_id, 'accepted')}>Accept</button>
                            <button className="withdraw" onClick={() => handleRequestAction(request.room_request_id, 'rejected')}>Reject</button>
                        </div>


                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParticipantsView;
