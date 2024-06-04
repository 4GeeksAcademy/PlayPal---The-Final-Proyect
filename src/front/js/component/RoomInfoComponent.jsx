import React from 'react';
import '../../styles/RoomInfo.css';

const RoomDetailsView = ({ room, participantsCount, formattedDateTime, renderPlatformIcon, isHost }) => {

    return (
        <div className="">

            <p>{room.description}</p>
            <div className="formatted-datetime text-info">
                <p>{formattedDateTime}</p>
            </div>
            <ul className='participant-item'>
                {room.participants.map((participant, index) => (
                    <li key={participant.participant_id} className="paticipant-item" style={{ zIndex: index }} >
                        <img
                            src={participant.profile_image_url}
                            alt={`${participant.participant_name}'s profile`}
                            className="profile-image"
                        />

                    </li>
                ))}
            </ul>
            <p><strong>Host:</strong> {room.host_name}</p>
            <p className="text-info">Platforms: {renderPlatformIcon(room.platform)}</p>
        </div>
    );
};

export default RoomDetailsView;
