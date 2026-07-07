'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PlaceCard from '../../components/ui/PlaceCard';
import DetailModal from '../../components/ui/DetailModal';
import StaggeredMenu from '../../components/StaggeredMenu/StaggeredMenu';
import {
  Search, X, SlidersHorizontal, LayoutGrid,
  List, Loader2, Compass
} from 'lucide-react';

const CATEGORIES = ['All', 'Places', 'Hotels', 'Nature', 'Food', 'Activities', 'Culture', 'Sunset', 'Temples', 'Beach', 'Villas'];

interface Spot {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  rating?: number | null;
  userRatingsTotal?: number | null;
  priceLevel?: number | null;
  photoUrl: string;
  photoSource: string;
  photoIsGeneric: boolean;
  matchDistance?: number | null;
  nameSimilarity?: number | null;
  classification: string;
  isHidden: boolean;
  sourcePlace: string;
  tags?: any;
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const place = searchParams.get('place') || '';

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(place);
  const [selectedPlace, setSelectedPlace] = useState<Spot | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (pageNum: number, isNewSearch = false) => {
    if (!place) return;
    if (isNewSearch) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const response = await fetch(`/api/destination/${encodeURIComponent(place)}?page=${pageNum}&pageSize=40`);
      if (!response.ok) throw new Error('Search request failed');
      const data = await response.json();

      setSpots(prev => isNewSearch ? data.spots : [...prev, ...data.spots]);
      setHasMore(data.hasMore);

      const newGoogle = data.spots.filter((s: Spot) => s.photoSource === 'google').length;
      const newWiki = data.spots.filter((s: Spot) => s.photoSource === 'wikidata').length;
      const newFsq = data.spots.filter((s: Spot) => s.photoSource === 'foursquare').length;
      const newMapillary = data.spots.filter((s: Spot) => s.photoSource === 'mapillary').length;
      const newGeneric = data.spots.filter((s: Spot) => s.photoSource === 'generic').length;

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
  }, [place]);

  useEffect(() => {
    if (!place) {
      router.push('/');
      return;
    }
    setSearchQuery(place);
    pageRef.current = 1;
    fetchPage(1, true);
  }, [place, fetchPage, router]);

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

  const handleNavigate = (targetPage: string) => {
    if (targetPage === 'landing') {
      router.push('/');
    } else if (targetPage === 'explore') {
      router.push(`/explore?place=${encodeURIComponent(place)}`);
    } else {
      router.push(`/${targetPage}`);
    }
  };

  return (
    <div className="app-container with-sidebar">
      {/* Floating Staggered Menu */}
      <StaggeredMenu position="left" activePage="explore" onNavigate={handleNavigate} />

      <main className="main-content main-content--shifted">
        <div className="explore-page">
          {/* TOP SEARCH + FILTER BAR */}
          <div className="explore-header">
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
                      router.push(`/explore?place=${encodeURIComponent(searchQuery.trim())}`);
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

          {/* GRID CONTENT */}
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
                <button className="btn-retry" onClick={() => router.push('/')}>Try Another Place</button>
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
                      place={place as any}
                      onClick={setSelectedPlace as any}
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
              place={selectedPlace as any}
              onClose={() => setSelectedPlace(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="explore-state" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="loader-icon spinning" size={36} />
        <p style={{ marginTop: '12px', color: '#9CA3AF' }}>Loading your journey...</p>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
