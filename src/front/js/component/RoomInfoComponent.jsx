import React from 'react';
import '../../styles/RoomInfo.css';

const RoomDetailsView = ({ room, participantsCount, formattedDateTime, renderPlatformIcon, handleKickParticipant, isHost }) => {
    
    return (
        <div className="">
            <div className="formatted-datetime text-info">
                <p>{formattedDateTime}</p>
            </div>
            <p>{room.description}</p>
            <p><strong>Participants:</strong></p>
            <ul>
                {room.participants.map(participant => (
                    <li key={participant.participant_id}>
                        {participant.participant_name}
                        {isHost && (
                            <button className="kick-button" onClick={() => handleKickParticipant(participant.participant_id)}>Kick</button>
                        )}
                    </li>
                ))}
            </ul>
            <p><strong>Host:</strong> {room.host_name}</p>
            <p className="text-info">Platforms: {renderPlatformIcon(room.platform)}</p>
        </div>
    );
};

export default RoomDetailsView;
