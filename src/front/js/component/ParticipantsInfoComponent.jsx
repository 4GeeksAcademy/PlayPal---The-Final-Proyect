import React from 'react';

const ParticipantsView = ({ requests, participants =[], handleRequestAction }) => {
    // Filtrar las solicitudes aceptadas
    const acceptedParticipants = participants.filter(participant => participant.confirmed);

    return (
        <div className="room-requests">
            <h3>Join Requests</h3>
            <ul>
                {requests.map(request => (
                    <li className='d-flex justify-content-between' key={request.room_request_id}>
                        {request.participant_name} - {request.status}
                        <div className="gap-2">
                        <button className="btn btn-success join-room mx-2" onClick={() => handleRequestAction(request.room_request_id, 'accepted')}>Accept</button>
                        <button className="btn btn-danger withdraw" onClick={() => handleRequestAction(request.room_request_id, 'rejected')}>Reject</button>
                        </div>
                        
                    </li>
                ))}
            </ul>
            
            <h3>Accepted Participants</h3>
            <ul>
                {acceptedParticipants.map(participant => (
                    <li key={participant.participant_id}>
                        {participant.participant_name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantsView;



