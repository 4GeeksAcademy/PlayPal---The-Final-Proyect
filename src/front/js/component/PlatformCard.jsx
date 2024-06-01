import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import './Caromponent.css';

const CardComponent = ({ icon, platformName, onInputChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [username, setUsername] = useState('');

  const handleExpandClick = () => setExpanded(true);
  const handleCollapseClick = () => setExpanded(false);

  const handleInputChange = (e) => {
    setUsername(e.target.value);
    onInputChange(platformName, e.target.value);
  };

  return (
    <Card className={`custom-card ${expanded ? 'expanded' : ''}`} onClick={!expanded ? handleExpandClick : undefined}>
      <Card.Body>
        {expanded && <Button variant="link" className="close-button" onClick={handleCollapseClick}>X</Button>}
        <img src={icon} alt={`${platformName} icon`} className="platform-icon" />
        {expanded && (
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleInputChange}
            />
          </Form.Group>
        )}
      </Card.Body>
    </Card>
  );
};

export default CardComponent;
