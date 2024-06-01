import React, { useState } from 'react';
import '../../styles/CardComponent.css';

const CardComponent = ({ icon, platformName, onInputChange, onExpand }) => {
  const [expanded, setExpanded] = useState(false);
  const [username, setUsername] = useState('');

  const handleExpandClick = () => {
      setExpanded(true);
      onExpand(platformName, true);
  };

  const handleCollapseClick = (e) => {
      e.stopPropagation();
      setExpanded(false);
      onExpand(platformName, false);
  };

  const handleInputChange = (e) => {
      const value = e.target.value;
      setUsername(value);
      onInputChange(platformName, value); // Asegurarnos de pasar el nombre de la plataforma y el valor
  };

  return (
      <div className={`custom-card ${expanded ? 'expanded' : ''}`} onClick={!expanded ? handleExpandClick : undefined}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center">
              {expanded && <button className="close-button" onClick={handleCollapseClick}>X</button>}
              <img src={icon} alt={`${platformName} icon`} className={`platform-icon ${expanded ? 'expanded-icon' : ''}`} />
              {expanded && (
                  <div className="form-group">
                      <input
                          type="text"
                          className="form-control"
                          placeholder="Username"
                          value={username}
                          onChange={handleInputChange}
                      />
                  </div>
              )}
          </div>
      </div>
  );
};

export default CardComponent;
