import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="tab-navigation">
      <button
        className={activeTab === 'cardapio' ? 'active' : ''}
        onClick={() => setActiveTab('cardapio')}
      >
        Cardápio
      </button>
      <button
        className={activeTab === 'comanda' ? 'active' : ''}
        onClick={() => setActiveTab('comanda')}
      >
        Comanda
      </button>
    </nav>
  );
};

export default TabNavigation;