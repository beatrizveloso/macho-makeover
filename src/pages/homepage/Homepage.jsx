import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/carrossel');
  };

  return (
    <div className="homepage-body">
      <div className="homepage-text">
        <div className="homepage-content">
          <p className="homepage-paragraph">
            Bem-vindo ao Macho Makeover, onde até o machão da firma pode virar a diva do glitter!
          </p>
          <button className="homepage-button" onClick={handleStartClick}>
            <h1 className="homepage-heading">Vamos começar</h1>
            <img 
              className="homepage-button-image" 
              src="./images/diamante.png" 
              alt="Diamante" 
            />
          </button>
        </div>
      </div>
      <div className="homepage-custom-alert" id="homepage-custom-alert">
        <div className="homepage-alert-box">
          <h2 className="homepage-alert-title">Alerta</h2>
          <button className="homepage-alert-button">Ok</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;