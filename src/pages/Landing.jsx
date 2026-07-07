import React, { useState, useEffect, useRef } from 'react';
import Strands from '../components/Strands/Strands';
import ShinyText from '../components/ShinyText/ShinyText';
import { Search, Loader2 } from 'lucide-react';
import './Landing.css';

function Landing({ onSearchSubmit }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // Debounced geocoding autocomplete suggestions using Nominatim
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
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'AtlasIQTravelApp/1.0'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.map(item => ({
            name: item.display_name,
            shortName: item.display_name.split(',')[0],
            lat: item.lat,
            lon: item.lon
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

  // Close suggestions on click outside
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
    if (query.trim()) {
      onSearchSubmit(query.trim());
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.shortName);
    setShowSuggestions(false);
    onSearchSubmit(suggestion.shortName);
  };

  return (
    <div className="landing-page">
      {/* Animated background strands */}
      <div className="strands-bg-wrapper">
        <Strands
          colors={["#14B8A6", "#7C3AED", "#F59E0B"]}
          count={4}
          speed={0.4}
          amplitude={1.1}
          waviness={1.2}
          thickness={0.6}
          glow={2.8}
          taper={3}
          spread={1.1}
          intensity={0.55}
          saturation={1.4}
          opacity={0.9}
          scale={1.6}
          glass={false}
        />
      </div>

      <div className="hero-content">
        <div className="title-wrapper">
          <ShinyText
            text="Discover the World's Hidden Corners"
            speed={2.5}
            delay={0.5}
            color="#9CA3AF"
            shineColor="#ffffff"
            spread={110}
            direction="left"
            yoyo={false}
            className="hero-shiny-title"
          />
        </div>
        
        <p className="hero-subtext">
          Search a place. Discover the spots worth your time.
        </p>

        <form onSubmit={handleSubmit} className="search-form-container" ref={suggestionRef}>
          <div className="search-input-wrapper glass-panel">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search a country or city..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="search-input-field"
            />
            {isLoadingSuggestions && (
              <Loader2 className="loader-icon spinning" size={18} />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown glass-panel">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <span className="suggestion-name-main">{item.shortName}</span>
                  <span className="suggestion-name-sub">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Landing;
