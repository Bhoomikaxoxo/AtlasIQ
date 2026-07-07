import React, { useState, useEffect, useRef } from 'react';
import DomeGallery from '../components/DomeGallery/DomeGallery';
import StarBorder from '../components/StarBorder/StarBorder';
import { Search, Loader2 } from 'lucide-react';
import './Landing.css';

const DOME_IMAGES = [
  // Coastal & Ocean
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
  'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80',
  // Mountains & Peaks
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80',
  // Forests & Nature
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=80',
  // Cities & Architecture
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=600&q=80',
  // Deserts & Landscapes
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
  'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=600&q=80',
  // Lakes & Rivers
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=80',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&q=80',
  // Travel & Culture
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  // Night & Sky
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80',
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80',
  // Adventure
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&q=80',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
  // Iconic Destinations
  'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?w=600&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
  'https://images.unsplash.com/photo-1472214222541-d510753a4907?w=600&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
];

const POPULAR_TAGS = ['Bali', 'Tokyo', 'Santorini', 'New York', 'Swiss Alps'];

/* 4-pointed compass/sparkle SVG icon for the nav center */
function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 1 L14.5 11.5 L25 13 L14.5 14.5 L13 25 L11.5 14.5 L2 13 L11.5 11.5 Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

function Landing({ onSearchSubmit }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { 'Accept': 'application/json', 'User-Agent': 'AtlasIQTravelApp/1.0' } }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.map(item => ({
            name: item.display_name,
            shortName: item.display_name.split(',')[0],
            lat: item.lat,
            lon: item.lon,
          })));
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearchSubmit(query.trim());
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.shortName);
    setShowSuggestions(false);
    onSearchSubmit(suggestion.shortName);
  };

  return (
    <div className="landing-page">

      {/* ── TOP NAV ── */}
      <nav className="top-nav">
        <div className="nav-links">
          <a href="#" className="nav-link active">Destinations</a>
          <a href="#" className="nav-link">Itinerary</a>
          <a href="#" className="nav-link">Inspiration</a>
          <a href="#" className="nav-link">Bucket List</a>
        </div>
        <div className="nav-logo">
          <CompassIcon />
        </div>
        <div className="nav-auth">
          <button className="btn-ghost">Sign In</button>
          <button className="btn-solid">Sign Up <span className="btn-arrow">→</span></button>
        </div>
      </nav>

      {/* ── 3D DOME GALLERY (decorative background) ── */}
      <div className="dome-bg-wrapper">
        <DomeGallery
          images={DOME_IMAGES}
          fit={1.0}
          fitBasis="max"
          minRadius={750}
          grayscale={false}
          imageBorderRadius="24px"
          openedImageWidth="360px"
          openedImageHeight="480px"
          openedImageBorderRadius="24px"
          overlayBlurColor="#0B0E14"
        />
      </div>

      {/* ── HERO CONTENT ── */}
      <div className="hero-content">

        {/* Brand */}
        <h1 className="hero-logo-text">ATLAS IQ</h1>
        <p className="hero-tagline">PLAN &nbsp;·&nbsp; EXPLORE &nbsp;·&nbsp; REMEMBER</p>

        {/* Diamond divider */}
        <div className="hero-divider">
          <span className="divider-line" />
          <span className="divider-diamond">◆</span>
          <span className="divider-line" />
        </div>

        {/* Heading */}
        <h2 className="hero-heading">
          Discover the <em>World's</em> Hidden Corners
        </h2>
        <p className="hero-subtitle">
          Plan personalized itineraries, uncover unique places,<br />
          and create unforgettable journeys.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="search-form-container" ref={suggestionRef}>
          <StarBorder
            as="div"
            className="search-star-border"
            color="rgba(255, 255, 255, 0.45)"
            speed="6s"
            thickness={1}
          >
            <Search className="search-bar-icon" size={20} />
            <input
              type="text"
              placeholder="Search a country or city..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="search-bar-input"
            />
            {isLoadingSuggestions && <Loader2 className="loader-icon spinning" size={18} />}
          </StarBorder>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((item, idx) => (
                <div key={idx} className="suggestion-item" onClick={() => handleSelectSuggestion(item)}>
                  <span className="suggestion-name-main">{item.shortName}</span>
                  <span className="suggestion-name-sub">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Popular searches */}
        <div className="popular-searches">
          <span className="popular-label">Popular searches:</span>
          {POPULAR_TAGS.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="popular-dot">·</span>}
              <button
                className="popular-tag"
                onClick={() => { setQuery(tag); onSearchSubmit(tag); }}
              >
                {tag}
              </button>
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Landing;
