import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { getMapPins, getPlaceById, getBoards } from '../services/store';
import DetailModal from '../components/UI/DetailModal';
import { Compass, Filter } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapView.css';

function MapView() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [pinnedPlaces, setPinnedPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Load storage data
  const loadData = () => {
    setBoards(getBoards());
    
    // Get all pinned place objects
    const pinIds = getMapPins();
    const places = pinIds
      .map(id => getPlaceById(id))
      .filter(Boolean);
    
    setPinnedPlaces(places);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('atlas_iq_storage_update', loadData);
    return () => window.removeEventListener('atlas_iq_storage_update', loadData);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current) return; // Only init once
    
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [12.496366, 41.902782], // Default centered around Europe/Rome
      zoom: 2,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    // Handle global click delegation for popup buttons
    const handlePopupClick = (e) => {
      const target = e.target.closest('.map-popup-detail-btn');
      if (target) {
        const placeId = target.getAttribute('data-id');
        const place = getPlaceById(placeId);
        if (place) {
          setSelectedPlace(place);
        }
      }
    };

    mapContainerRef.current.addEventListener('click', handlePopupClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Filter spots by board
  const getFilteredPlaces = () => {
    if (selectedBoardId === 'all') return pinnedPlaces;
    
    const board = boards.find(b => b.id === selectedBoardId);
    if (!board) return [];
    
    return pinnedPlaces.filter(place => board.placeIds.includes(place.id));
  };

  // Update map markers when data or filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const activePlaces = getFilteredPlaces();
    if (activePlaces.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    activePlaces.forEach(place => {
      bounds.extend([place.lng, place.lat]);

      // Create a glowing marker DOM node
      const el = document.createElement('div');
      el.className = 'glowing-map-marker';
      el.style.backgroundColor = place.isHidden ? '#14B8A6' : '#7C3AED'; // Teal for hidden, Violet for popular

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div class="map-popup-card">
          <div class="popup-img" style="background-image: url(${place.photoUrl})"></div>
          <div class="popup-content">
            <span class="popup-category">${place.category}</span>
            <h4 class="popup-title">${place.name}</h4>
            <div class="popup-meta">
              <span>⭐ ${place.rating}</span>
              <span>${place.isHidden ? '• Hidden Gem' : '• Popular'}</span>
            </div>
            <button class="map-popup-detail-btn" data-id="${place.id}">View Details</button>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Auto fit bounds
    if (activePlaces.length > 0) {
      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
        duration: 1200
      });
    }
  }, [pinnedPlaces, selectedBoardId, boards]);

  return (
    <div className="map-view-container fade-in">
      {/* Control panel for filters */}
      <div className="map-controls-panel glass-panel">
        <div className="filter-header">
          <Filter size={16} className="filter-icon" />
          <h3>Map Filters</h3>
        </div>
        
        <div className="filter-select-wrapper">
          <label htmlFor="board-filter">Show Pinned spots from:</label>
          <select 
            id="board-filter"
            value={selectedBoardId} 
            onChange={(e) => setSelectedBoardId(e.target.value)}
            className="board-filter-dropdown"
          >
            <option value="all">All Pinned Spots</option>
            {boards.map(board => (
              <option key={board.id} value={board.id}>
                {board.name} ({board.placeIds.length})
              </option>
            ))}
          </select>
        </div>

        <div className="map-stats-summary">
          <div className="stat-row">
            <span>Total Spots Pinned:</span>
            <strong>{pinnedPlaces.length}</strong>
          </div>
          <div className="stat-row">
            <span>Visible Spots:</span>
            <strong>{getFilteredPlaces().length}</strong>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="map-element-host">
        {pinnedPlaces.length === 0 && (
          <div className="map-instructions-overlay glass-panel">
            <Compass size={32} className="compass-icon spinning" />
            <h3>No Pins on the Map Yet</h3>
            <p>Search for a place on the Explore tab and click "Pin to Map" to display spots here.</p>
          </div>
        )}
      </div>

      {/* Detail Modal Handoff */}
      {selectedPlace && (
        <DetailModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}
    </div>
  );
}

export default MapView;
