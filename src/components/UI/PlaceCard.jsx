import React from 'react';
import { Bookmark } from 'lucide-react';
import './PlaceCard.css';

function PlaceCard({ place, onClick, onQuickSave }) {
  const handleBookmark = (e) => {
    e.stopPropagation(); // don't open detail modal
    onQuickSave?.(place);
  };

  return (
    <div className="place-card fade-in" onClick={() => onClick(place)}>
      <img
        src={place.photoUrl}
        alt={place.name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80';
        }}
      />

      {/* Badge — top left */}
      <span className={`badge ${place.isHidden ? 'hidden-badge' : 'popular-badge'}`}>
        {place.isHidden ? 'Hidden Gem' : 'Popular'}
      </span>

      {/* Bookmark quick-save — top right */}
      <button className="quick-save-btn" onClick={handleBookmark} title="Save to board">
        <Bookmark size={15} />
      </button>

      {/* Overlay */}
      <div className="card-overlay">
        <span className="category-tag">{place.category}</span>
        <strong className="place-name">{place.name}</strong>
        <div className="card-meta">
          <span className="rating-badge">⭐ {place.rating}</span>
          <span className="price-tag">{'$'.repeat(place.priceLevel || 1)}</span>
        </div>
      </div>
    </div>
  );
}

export default PlaceCard;
