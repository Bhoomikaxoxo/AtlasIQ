import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Boards from './pages/Boards';
import MapView from './pages/MapView';
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu';
import './App.css';

function App() {
  const [page, setPage] = useState('landing');
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (!hash) { setPage('landing'); return; }

      const [route, param] = hash.split('?');
      if (route === 'explore') {
        const urlParams = new URLSearchParams(param);
        const place = urlParams.get('place');
        if (place) { setDestination(decodeURIComponent(place)); setPage('explore'); }
        else setPage('landing');
      } else if (['boards', 'map'].includes(route)) {
        setPage(route);
      } else {
        setPage('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSearchSubmit = (query) => {
    setDestination(query);
    setPage('explore');
    window.location.hash = `#/explore?place=${encodeURIComponent(query)}`;
  };

  const handleNavigate = (targetPage) => {
    setPage(targetPage);
    if (targetPage === 'landing') {
      setDestination(null);
      window.location.hash = '#/';
    } else if (targetPage === 'explore' && destination) {
      window.location.hash = `#/explore?place=${encodeURIComponent(destination)}`;
    } else {
      window.location.hash = `#/${targetPage}`;
    }
  };

  const showSidebar = page !== 'landing';

  return (
    <div className={`app-container ${showSidebar ? 'with-sidebar' : ''}`}>
      {/* Floating Staggered Menu — only shown after first search */}
      {showSidebar && (
        <StaggeredMenu position="left" activePage={page} onNavigate={handleNavigate} />
      )}

      {/* Main Content */}
      <main className={`main-content ${showSidebar ? 'main-content--shifted' : ''}`}>
        {page === 'landing' && (
          <Landing onSearchSubmit={handleSearchSubmit} />
        )}
        {page === 'explore' && destination && (
          <Explore
            destination={destination}
            onBackToSearch={() => handleNavigate('landing')}
          />
        )}
        {page === 'boards' && <Boards />}
        {page === 'map' && <MapView />}
      </main>
    </div>
  );
}

export default App;
