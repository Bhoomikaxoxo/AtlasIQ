'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useTravelStore, Board, Place } from '../lib/store/useTravelStore';
import DetailModal from './ui/DetailModal';
import { Compass, Filter } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapInner() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const boards = useTravelStore((state) => state.boards);
  const mapPins = useTravelStore((state) => state.mapPins);
  const enrichedPlaces = useTravelStore((state) => state.enrichedPlaces);

  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const pinnedPlaces = mapPins
    .map(id => enrichedPlaces[id])
    .filter(Boolean) as Place[];

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [12.496366, 41.902782],
      zoom: 2,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    const handlePopupClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.map-popup-detail-btn');
      if (target) {
        const placeId = target.getAttribute('data-id');
        if (placeId) {
          const place = useTravelStore.getState().enrichedPlaces[placeId];
          if (place) {
            setSelectedPlace(place);
          }
        }
      }
    };

    mapContainerRef.current.addEventListener('click', handlePopupClick);

    return () => {
      mapContainerRef.current?.removeEventListener('click', handlePopupClick);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const getFilteredPlaces = () => {
    if (selectedBoardId === 'all') return pinnedPlaces;
    const board = boards.find(b => b.id === selectedBoardId);
    if (!board) return [];
    return pinnedPlaces.filter(place => board.placeIds.includes(place.id));
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const activePlaces = getFilteredPlaces();
    if (activePlaces.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    activePlaces.forEach(place => {
      bounds.extend([place.lng, place.lat]);

      const el = document.createElement('div');
      el.className = 'glowing-map-marker';
      el.style.backgroundColor = place.isHidden ? '#14B8A6' : '#7C3AED';

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div class="map-popup-card">
          <div class="popup-img" style="background-image: url(${place.photoUrl})"></div>
          <div class="popup-content">
            <span class="popup-category">${place.category}</span>
            <h4 class="popup-title">${place.name}</h4>
            <div class="popup-meta">
              <span>⭐ ${place.rating || 'N/A'}</span>
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

      <div ref={mapContainerRef} className="map-element-host">
        {pinnedPlaces.length === 0 && (
          <div className="map-instructions-overlay glass-panel">
            <Compass size={32} className="compass-icon spinning" />
            <h3>No Pins on the Map Yet</h3>
            <p>Search for a place on the Explore tab and click "Pin to Map" to display spots here.</p>
          </div>
        )}
      </div>

      {selectedPlace && (
        <DetailModal 
          place={selectedPlace as any} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}
    </div>
  );
}
