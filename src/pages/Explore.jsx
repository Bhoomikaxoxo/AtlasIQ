import React, { useState, useEffect } from 'react';
import PlaceCard from '../components/UI/PlaceCard';
import DetailModal from '../components/UI/DetailModal';
import { searchDestination } from '../services/api';
import {
  Search, X, SlidersHorizontal, LayoutGrid,
  List, Loader2, Compass
} from 'lucide-react';
import './Explore.css';

const CATEGORIES = ['All', 'Places', 'Hotels', 'Nature', 'Food', 'Activities', 'Culture', 'Sunset', 'Temples', 'Beach', 'Villas'];

function Explore({ destination, onBackToSearch }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(destination || '');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (!destination) return;
    setSearchQuery(destination);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchDestination(destination);
        setSpots(data.spots);
      } catch (err) {
        console.error('Error searching destination:', err);
        setError('Could not fetch spots for this location. Please try a different search.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [destination]);

  const filteredSpots = spots.filter(spot => {
    if (activeFilter === 'All') return true;
    const cat = activeFilter.toLowerCase();
    if (cat === 'nature') return spot.category === 'nature' || spot.category === 'viewpoint';
    if (cat === 'food') return spot.category === 'cafe' || spot.category === 'restaurant';
    if (cat === 'hotels') return spot.category === 'hotel';
    if (cat === 'places') return !spot.isHidden;
    return spot.category === cat;
  });

  return (
    <div className="explore-page">

      {/* ── TOP SEARCH + FILTER BAR ── */}
      <div className="explore-header">
        {/* Row 1: Search + controls */}
        <div className="explore-search-row">
          <div className="explore-search-pill">
            <Search size={16} className="explore-search-icon" />
            <input
              className="explore-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search a place..."
              onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && onBackToSearch?.()}
            />
            {searchQuery && (
              <button className="explore-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="explore-controls">
            <div className="sort-pill">
              Sort by <strong>Relevance</strong> ▾
            </div>
            <button className="filter-btn">
              <SlidersHorizontal size={14} />
              Filter
            </button>
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category chips */}
        <div className="filter-chips-row">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID CONTENT ── */}
      <div className="explore-content">
        {loading ? (
          <div className="explore-state">
            <Loader2 className="loader-icon spinning" size={36} />
            <p>Scanning local channels for hidden spots...</p>
          </div>
        ) : error ? (
          <div className="explore-state">
            <Compass size={44} className="state-icon" />
            <p>{error}</p>
            <button className="btn-retry" onClick={onBackToSearch}>Try Another Place</button>
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="explore-state">
            <Compass size={44} className="state-icon" />
            <h3>No spots found</h3>
            <p>We couldn't find any {activeFilter.toLowerCase()} spots here.</p>
          </div>
        ) : (
          <div className={`explore-grid ${viewMode === 'list' ? 'explore-grid--list' : ''}`}>
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
