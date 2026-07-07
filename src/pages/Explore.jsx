import React, { useState, useEffect } from 'react';
import FlowingMenu from '../components/FlowingMenu/FlowingMenu';
import PlaceCard from '../components/UI/PlaceCard';
import DetailModal from '../components/UI/DetailModal';
import { searchDestination } from '../services/api';
import { ArrowLeft, Loader2, Compass } from 'lucide-react';
import './Explore.css';

const navItems = [
  { link: 'all', text: 'All Spots', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=150&q=80' },
  { link: 'hidden', text: 'Hidden Gems', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=150&q=80' },
  { link: 'cafe', text: 'Cafes', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=150&q=80' },
  { link: 'restaurant', text: 'Restaurants', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80' },
  { link: 'viewpoint', text: 'Viewpoints', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=150&q=80' }
];

function Explore({ destination, onBackToSearch }) {
  const [spots, setSpots] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    if (!destination) return;

    const fetchDestinationData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchDestination(destination);
        setSpots(data.spots);
        setLocationName(data.location.displayName.split(',')[0]);
      } catch (err) {
        console.error('Error searching destination:', err);
        setError('Could not fetch spots for this location. Please try a different search.');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationData();
  }, [destination]);

  // Filter spots based on active filter from FlowingMenu
  const filteredSpots = spots.filter(spot => {
    if (filter === 'all') return true;
    if (filter === 'hidden') return spot.isHidden;
    return spot.category === filter;
  });

  return (
    <div className="explore-page-container">
      {/* Top filter navigation menu */}
      <div className="explore-nav-wrapper">
        <div className="nav-header-left">
          <button className="back-search-btn" onClick={onBackToSearch}>
            <ArrowLeft size={16} />
            <span>Search</span>
          </button>
          <div className="explore-heading-info">
            <span className="subtitle-tag">Exploring</span>
            <h2 className="explore-city-title">{locationName || destination}</h2>
          </div>
        </div>

        <div className="flowing-menu-container">
          <FlowingMenu
            items={navItems}
            speed={14}
            textColor="#ffffff"
            bgColor="#0B0E14"
            marqueeBgColor="#14B8A6"
            marqueeTextColor="#0B0E14"
            borderColor="#2A2E3A"
            onItemClick={(category) => setFilter(category)}
          />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="explore-content-area">
        {loading ? (
          <div className="explore-loading-state">
            <Loader2 className="loader-icon spinning" size={40} />
            <p>Scanning local channels for hidden spots...</p>
          </div>
        ) : error ? (
          <div className="explore-error-state">
            <Compass size={48} className="error-icon" />
            <p>{error}</p>
            <button className="btn-retry" onClick={onBackToSearch}>Try Another Place</button>
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="explore-empty-state">
            <Compass size={48} className="empty-icon" />
            <h3>No spots found</h3>
            <p>We couldn't find any {filter === 'hidden' ? 'hidden gems' : filter + 's'} in this area.</p>
          </div>
        ) : (
          <div className="explore-grid">
            {filteredSpots.map(place => (
              <PlaceCard 
                key={place.id} 
                place={place} 
                onClick={setSelectedPlace} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Spot Detail Modal */}
      {selectedPlace && (
        <DetailModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}
    </div>
  );
}

export default Explore;
