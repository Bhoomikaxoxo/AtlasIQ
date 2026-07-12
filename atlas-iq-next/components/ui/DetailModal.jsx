'use client';

import React, { useState } from 'react';
import { useTravelStore } from '../../lib/store/useTravelStore';
import BoardPicker from './BoardPicker';
import { Star, MapPin, DollarSign, X, Coffee, Utensils, Mountain, Compass, Trees } from 'lucide-react';

function CategoryIcon({ category, size = 24 }) {
  switch (category) {
    case 'cafe':
      return <Coffee size={size} />;
    case 'restaurant':
      return <Utensils size={size} />;
    case 'viewpoint':
      return <Mountain size={size} />;
    case 'historic':
      return <Compass size={size} />;
    case 'nature':
      return <Trees size={size} />;
    default:
      return <MapPin size={size} />;
  }
}

function DetailModal({ place, onClose }) {
  const pinToMap = useTravelStore((state) => state.pinToMap);
  const unpinFromMap = useTravelStore((state) => state.unpinFromMap);
  const pinnedToMap = useTravelStore((state) => state.mapPins.includes(place?.id || ''));
  const [showBoardPicker, setShowBoardPicker] = useState(false);

  if (!place) return null;

  const handleMapPinToggle = () => {
    if (pinnedToMap) {
      unpinFromMap(place.id);
    } else {
      pinToMap(place);
    }
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-card glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {place.photoIsGeneric ? (
          <div className={`modal-hero-placeholder category-gradient-${place.category}`}>
            <CategoryIcon category={place.category} size={48} />
            <span className="modal-placeholder-label">{place.category}</span>
            <span className="representative-photo-tag">📷 Representative photo</span>
          </div>
        ) : (
          <div className="modal-hero-image" style={{ backgroundImage: `url(${place.photoUrl})` }}>
            {place.classification === 'unrated' ? (
              <span className="modal-badge unrated-badge">Unrated</span>
            ) : (
              <span className={`modal-badge ${place.classification === 'hidden' || place.isHidden ? 'hidden-badge' : 'popular-badge'}`}>
                {place.classification === 'hidden' || place.isHidden ? 'Hidden Gem' : 'Popular'}
              </span>
            )}
          </div>
        )}

        {/* Dev-only debug metadata overlay in modal */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-tag modal-debug-tag">
            source: {place.photoSource}
            {place.matchDistance != null ? ` · dist:${Math.round(place.matchDistance)}m` : ''}
            {place.nameSimilarity != null ? ` · sim:${place.nameSimilarity.toFixed(2)}` : ''}
            {place.rating == null ? ' · no Google match' : ''}
          </div>
        )}

        <div className="modal-content">
          <div className="modal-header">
            <span className="modal-category">{place.category}</span>
            <h2 className="modal-title">{place.name}</h2>
          </div>

          <div className="modal-meta-grid">
            <div className="meta-item">
              <Star size={16} className="star-icon" />
              {place.rating ? (
                <>
                  <span>{place.rating} / 5.0</span>
                  {place.userRatingsTotal != null && (
                    <span className="reviews-cnt">({place.userRatingsTotal} reviews)</span>
                  )}
                </>
              ) : (
                <span>No rating available</span>
              )}
            </div>

            <div className="meta-item">
              <DollarSign size={16} className="dollar-icon" />
              <span>Price Level: <strong>{'$'.repeat(place.priceLevel)}</strong></span>
            </div>

            <div className="meta-item address-item">
              <MapPin size={16} className="pin-icon" />
              <span>{place.address}</span>
            </div>
          </div>

          <div className="modal-actions">
            <div className="board-pin-container">
              <button
                className={`btn-action btn-board-pin ${showBoardPicker ? 'active' : ''}`}
                onClick={() => setShowBoardPicker(!showBoardPicker)}
              >
                📌 Pin to Board
              </button>
              {showBoardPicker && (
                <BoardPicker
                  place={place}
                  onClose={() => setShowBoardPicker(false)}
                />
              )}
            </div>

            <button
              className={`btn-action btn-map-pin ${pinnedToMap ? 'pinned' : ''}`}
              onClick={handleMapPinToggle}
            >
              {pinnedToMap ? '🗺️ Pinned to Map' : '🗺️ Pin to Map'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
