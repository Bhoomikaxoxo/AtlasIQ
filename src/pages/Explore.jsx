import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(destination || '');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugData, setDebugData] = useState({
    cities: [],
    rawCount: 0,
    dedupedCount: 0,
    googleEnriched: 0,
    wikidataEnriched: 0,
    fsqEnriched: 0,
    mapillaryEnriched: 0,
    fallbackCount: 0,
    queryStr: ''
  });

  const sentinelRef = useRef(null);

  const fetchPage = useCallback(async (pageNum, isNewSearch = false) => {
    if (isNewSearch) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const data = await searchDestination(destination, pageNum, 40);
      setSpots(prev => isNewSearch ? data.spots : [...prev, ...data.spots]);
      setHasMore(data.hasMore);

      const newGoogle = data.spots.filter(s => s.photoSource === 'google').length;
      const newWiki = data.spots.filter(s => s.photoSource === 'wikidata').length;
      const newFsq = data.spots.filter(s => s.photoSource === 'foursquare').length;
      const newMapillary = data.spots.filter(s => s.photoSource === 'mapillary').length;
      const newGeneric = data.spots.filter(s => s.photoSource === 'generic').length;

      setDebugData(prev => {
        if (isNewSearch) {
          return {
            cities: data.debugInfo?.citiesQueried || [],
            rawCount: data.debugInfo?.rawOsmCount || 0,
            dedupedCount: data.debugInfo?.dedupedOsmCount || 0,
            googleEnriched: newGoogle,
            wikidataEnriched: newWiki,
            fsqEnriched: newFsq,
            mapillaryEnriched: newMapillary,
            fallbackCount: newGeneric,
            queryStr: data.debugInfo?.overpassQuery || ''
          };
        } else {
          return {
            ...prev,
            googleEnriched: prev.googleEnriched + newGoogle,
            wikidataEnriched: prev.wikidataEnriched + newWiki,
            fsqEnriched: prev.fsqEnriched + newFsq,
            mapillaryEnriched: prev.mapillaryEnriched + newMapillary,
            fallbackCount: prev.fallbackCount + newGeneric
          };
        }
      });
    } catch (err) {
      console.error('Error fetching page:', err);
      if (isNewSearch) {
        setError('Could not fetch spots for this location. Please try a different search.');
      }
    } finally {
      if (isNewSearch) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [destination]);

  useEffect(() => {
    if (!destination) return;
    setSearchQuery(destination);
    pageRef.current = 1;
    fetchPage(1, true);
  }, [destination, fetchPage]);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        fetchPage(nextPage, false);
      }
    }, { threshold: 0.1 });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [loading, loadingMore, hasMore, fetchPage]);

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
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.hash = `#/explore?place=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
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
            <button
              className={`filter-btn debug-toggle-btn ${showDebugPanel ? 'active' : ''}`}
              onClick={() => setShowDebugPanel(!showDebugPanel)}
            >
              🔧 Debug
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

      {showDebugPanel && (
        <div className="dev-debug-panel glass-panel">
          <div className="debug-header">
            <h4>🔧 AtlasIQ Pipeline Debugger</h4>
            <button className="debug-close-btn" onClick={() => setShowDebugPanel(false)}>✕</button>
          </div>
          <div className="debug-stats-grid">
            <div className="debug-stat-box">
              <span className="stat-label">Cities Queried ({debugData.cities.length})</span>
              <span className="stat-value">{debugData.cities.join(', ') || 'None'}</span>
            </div>
            <div className="debug-stat-box">
              <span className="stat-label">Raw OSM Elements</span>
              <span className="stat-value">{debugData.rawCount}</span>
            </div>
            <div className="debug-stat-box">
              <span className="stat-label">Deduplicated (Name + Proximity)</span>
              <span className="stat-value">{debugData.dedupedCount}</span>
            </div>
            <div className="debug-stat-box">
              <span className="stat-label">Google Places Matches</span>
              <span className="stat-value">{debugData.googleEnriched}</span>
            </div>
            <div className="debug-stat-box">
              <span className="stat-label">Wikidata P18 Matches</span>
              <span className="stat-value">{debugData.wikidataEnriched}</span>
            </div>
            <div className="debug-stat-box">
              <span className="stat-label">Foursquare Matches</span>
              <span className="stat-value">{debugData.fsqEnriched}</span>
            </div>
            <div className="debug-stat-box">
              <span className="stat-label">Mapillary Matches</span>
              <span className="stat-value">{debugData.mapillaryEnriched}</span>
            </div>
            <div className="debug-stat-box">
              <span className="stat-label">Generic Fallback Photos</span>
              <span className="stat-value">{debugData.fallbackCount}</span>
            </div>
          </div>
          <div className="debug-query-section">
            <span className="stat-label">Active Overpass Query String</span>
            <pre className="debug-query-pre"><code>{debugData.queryStr}</code></pre>
          </div>
        </div>
      )}

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
        ) : filteredSpots.length === 0 && !hasMore ? (
          <div className="explore-state">
            <Compass size={44} className="state-icon" />
            <h3>No spots found</h3>
            <p>We couldn't find any {activeFilter.toLowerCase()} spots here.</p>
          </div>
        ) : (
          <>
            <div className={`explore-grid ${viewMode === 'list' ? 'explore-grid--list' : ''}`}>
              {filteredSpots.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onClick={setSelectedPlace}
                />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="explore-sentinel">
              {loadingMore && (
                <div className="explore-loading-more">
                  <Loader2 className="loader-icon spinning" size={24} />
                  <span>Loading more places...</span>
                </div>
              )}
              {!hasMore && spots.length > 0 && (
                <div className="explore-end-message">
                  <span>✨ You've reached the end for this search</span>
                </div>
              )}
            </div>
          </>
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
