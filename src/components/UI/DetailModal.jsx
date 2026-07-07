import React, { useState, useEffect } from 'react';
import { isPinnedToMap, pinToMap, unpinFromMap } from '../../services/store';
import BoardPicker from './BoardPicker';
import { Star, MapPin, DollarSign, X } from 'lucide-react';
import './DetailModal.css';

function DetailModal({ place, onClose }) {
  const [pinnedToMap, setPinnedToMap] = useState(false);
  const [showBoardPicker, setShowBoardPicker] = useState(false);

  useEffect(() => {
    if (place) {
      setPinnedToMap(isPinnedToMap(place.id));
    }
  }, [place]);

  if (!place) return null;

  const handleMapPinToggle = () => {
    if (pinnedToMap) {
      unpinFromMap(place.id);
      setPinnedToMap(false);
    } else {
      pinToMap(place);
      setPinnedToMap(true);
    }
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-card glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-hero-image" style={{ backgroundImage: `url(${place.photoUrl})` }}>
          <span className={`modal-badge ${place.isHidden ? 'hidden-badge' : 'popular-badge'}`}>
            {place.isHidden ? 'Hidden Gem' : 'Popular'}
          </span>
        </div>

        <div className="modal-content">
          <div className="modal-header">
            <span className="modal-category">{place.category}</span>
            <h2 className="modal-title">{place.name}</h2>
          </div>

          <div className="modal-meta-grid">
            <div className="meta-item">
              <Star size={16} className="star-icon" />
              <span>{place.rating} / 5.0</span>
              <span className="reviews-cnt">({place.userRatingsTotal} ratings)</span>
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
