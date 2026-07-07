import React from 'react';
import './PlaceCard.css';

function PlaceCard({ place, onClick }) {
  return (
    <div className="place-card fade-in" onClick={() => onClick(place)}>
      <img src={place.photoUrl} alt={place.name} loading="lazy" />
      
      <span className={`badge ${place.isHidden ? 'hidden-badge' : 'popular-badge'}`}>
        {place.isHidden ? 'Hidden Gem' : 'Popular'}
      </span>
      
      <div className="card-overlay">
        <span className="category-tag">{place.category}</span>
        <strong className="place-name">{place.name}</strong>
        <div className="card-meta">
          <span className="rating-badge">⭐ {place.rating}</span>
          <span className="price-tag">{'$'.repeat(place.priceLevel)}</span>
        </div>
      </div>
    </div>
  );
}

export default PlaceCard;
