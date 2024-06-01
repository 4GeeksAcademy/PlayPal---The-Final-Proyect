import React, { useState } from 'react';
import CardComponent from './CardComponent.jsx';
import switchIcon from '../../img/switch.png';
import playstationIcon from '../../img/playstation.png';
import xboxIcon from '../../img/xbox.png';
import steamIcon from '../../img/steam.png';
import discordIcon from '../../img/discord.png';
import epicIcon from '../../img/epic.png';
import '../../styles/CardContainer.css';

const icons = [
  { icon: switchIcon, name: 'nintendo' },
  { icon: playstationIcon, name: 'psn' },
  { icon: xboxIcon, name: 'xbox' },
  { icon: steamIcon, name: 'steam' },
  { icon: discordIcon, name: 'discord' },
  { icon: epicIcon, name: 'epicId' },
];

const CardContainer = ({ onInputChange }) => {
  const [expandedCards, setExpandedCards] = useState([]);

  const handleExpand = (platformName, isExpanded) => {
      setExpandedCards((prev) => {
          const updated = isExpanded ? [...prev, platformName] : prev.filter((name) => name !== platformName);
          return updated;
      });
  };

  const handleInputChange = (platformName, value) => {
      onInputChange(platformName, value); // Pasar el nombre de la plataforma y el valor al componente padre
  };

  return (
      <div className="card-container">
          {icons.map(({ icon, name }) => (
              <div key={name} className="card-column">
                  <CardComponent 
                      icon={icon} 
                      platformName={name} 
                      onInputChange={handleInputChange} 
                      onExpand={handleExpand} 
                  />
              </div>
          ))}
      </div>
  );
};

export default CardContainer;
