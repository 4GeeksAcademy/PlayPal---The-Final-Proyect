import React, { useState, useEffect } from 'react';
import '../../styles/CommentsSection.css';

const CommentsSection = ({ roomId, token, username, room, actions }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchComments();
    }, []);

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

    const timeAgo = (timestamp) => {
        const commentDate = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - commentDate) / 1000);

        if (diffInSeconds < 60) {
            return 'moments ago';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    };


    return (
        <div className="comments-section room-info">
            <h3>Comments</h3>
            <div className="comments-list">
                {comments.map(comment => (
                    <div key={comment.comment_id} className="comment">
                        <p><strong>{comment.username}</strong> <small>{timeAgo(comment.created_at)}</small> <br />
                            {comment.content}</p>

                    </div>
                ))}
            </div>
            <div className="add-comment">
            <div className="form-group">
                    <textarea
                        className="form-control comment-box"
                        id="exampleFormControlTextarea1"
                        placeholder="Start typing..."
                        rows="3"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                </div>
                <button className='join-room mt-3 mx-0' onClick={handleAddComment}>Add Comment</button>
            </div>
        </div>
    );
};

export default CommentsSection;
