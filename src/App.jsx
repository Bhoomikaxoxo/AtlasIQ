import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import Boards from './pages/Boards';
import MapView from './pages/MapView';
import { Compass, FolderHeart, Map, Search } from 'lucide-react';
import './App.css';

function App() {
  const [page, setPage] = useState('landing');
  const [destination, setDestination] = useState(null);

  // Synchronize state routing with window hash for convenience (optional support)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (!hash) {
        setPage('landing');
        return;
      }
      
      const [route, param] = hash.split('?');
      if (route === 'explore') {
        const urlParams = new URLSearchParams(param);
        const place = urlParams.get('place');
        if (place) {
          setDestination(decodeURIComponent(place));
          setPage('explore');
        } else {
          setPage('landing');
        }
      } else if (['boards', 'map'].includes(route)) {
        setPage(route);
      } else {
        setPage('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Trigger on initial load
    if (window.location.hash) {
      handleHashChange();
    }
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

  return (
    <div className="app-container">
      {/* Top Glassmorphic Navigation Bar - visible after first search */}
      {page !== 'landing' && (
        <header className="app-nav-bar glass-panel fade-in">
          <div className="nav-brand" onClick={() => handleNavigate('landing')}>
            <span className="brand-glow"></span>
            <Compass size={22} className="brand-logo-icon" />
            <h1 className="brand-name">Atlas IQ</h1>
          </div>

          <nav className="nav-links-wrapper">
            {destination && (
              <button 
                className={`nav-tab-btn ${page === 'explore' ? 'active' : ''}`}
                onClick={() => handleNavigate('explore')}
              >
                <Compass size={16} />
                <span>Explore</span>
              </button>
            )}
            
            <button 
              className={`nav-tab-btn ${page === 'boards' ? 'active' : ''}`}
              onClick={() => handleNavigate('boards')}
            >
              <FolderHeart size={16} />
              <span>Boards</span>
            </button>
            
            <button 
              className={`nav-tab-btn ${page === 'map' ? 'active' : ''}`}
              onClick={() => handleNavigate('map')}
            >
              <Map size={16} />
              <span>Master Map</span>
            </button>
          </nav>

          <button className="nav-search-again-btn" onClick={() => handleNavigate('landing')}>
            <Search size={14} />
            <span>Search Spots</span>
          </button>
        </header>
      )}

      {/* Main Pages Router Host */}
      <main className="main-content">
        {page === 'landing' && (
          <Landing onSearchSubmit={handleSearchSubmit} />
        )}
        {page === 'explore' && destination && (
          <Explore 
            destination={destination} 
            onBackToSearch={() => handleNavigate('landing')} 
          />
        )}
        {page === 'boards' && (
          <Boards />
        )}
        {page === 'map' && (
          <MapView />
        )}
      </main>
    </div>
  );
}

export default App;
