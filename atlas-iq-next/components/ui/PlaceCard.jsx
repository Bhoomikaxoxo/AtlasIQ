'use client';

import React from 'react';
import { Bookmark, Coffee, Utensils, Mountain, Compass, Trees, MapPin } from 'lucide-react';

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

function PlaceCard({ place, onClick, onQuickSave = () => { } }) {
  const handleBookmark = (e) => {
    e.stopPropagation(); // don't open detail modal
    onQuickSave?.(place);
  };

  return (
    <div className="place-card fade-in" onClick={() => onClick(place)}>
      {place.photoIsGeneric ? (
        <div className={`generic-photo-placeholder category-gradient-${place.category}`}>
          <CategoryIcon category={place.category} size={28} />
          <span className="category-placeholder-label">{place.category}</span>
          <span className="representative-photo-tag">📷 Representative photo</span>
        </div>
      ) : (
        <img
          src={place.photoUrl}
          alt={place.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80';
          }}
        />
      )}

      {/* Dev-only debug metadata overlay */}
      {process.env.NODE_ENV === 'development' && (
        <span className="debug-tag">
          {place.photoSource}
          {place.matchDistance != null ? ` · d:${Math.round(place.matchDistance)}m` : ''}
          {place.nameSimilarity != null ? ` · s:${place.nameSimilarity.toFixed(2)}` : ''}
        </span>
      )}

      {/* Badge — top left */}
      {place.classification === 'unrated' ? (
        <span className="badge unrated-badge">Unrated</span>
      ) : (
        <span className={`badge ${place.classification === 'hidden' || place.isHidden ? 'hidden-badge' : 'popular-badge'}`}>
          {place.classification === 'hidden' || place.isHidden ? 'Hidden Gem' : 'Popular'}
        </span>
      )}

      {/* Bookmark quick-save — top right */}
      <button className="quick-save-btn" onClick={handleBookmark} title="Save to board">
        <Bookmark size={15} />
      </button>

      {/* Overlay */}
      <div className="card-overlay">
        <span className="category-tag">{place.category}</span>
        <strong className="place-name">{place.name}</strong>
        <div className="card-meta">
          <span className="rating-badge">
            {place.rating ? `⭐ ${place.rating}` : '⭐ No rating'}
          </span>
          <span className="price-tag">{'$'.repeat(place.priceLevel || 1)}</span>
        </div>
      </div>
    </div>
  );
}

export default PlaceCard;
