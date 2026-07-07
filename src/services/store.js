// LocalStorage Persistence Service for Atlas IQ

const STORAGE_KEYS = {
  BOARDS: 'atlas_iq_boards',
  MAP_PINS: 'atlas_iq_map_pins',
  ENRICHED_PLACES: 'atlas_iq_enriched_places',
  SEARCH_CACHE: 'atlas_iq_search_cache'
};

// Cache-busting version check
const CACHE_VERSION = 'v3';
const CURRENT_VERSION = localStorage.getItem('atlas_iq_cache_version');
if (CURRENT_VERSION !== CACHE_VERSION) {
  localStorage.removeItem(STORAGE_KEYS.SEARCH_CACHE);
  localStorage.removeItem(STORAGE_KEYS.ENRICHED_PLACES);
  localStorage.setItem('atlas_iq_cache_version', CACHE_VERSION);
}

// Seed initial boards if empty
const defaultBoards = [
  { id: 'b-1', name: 'Japan Explorer 2027', description: 'Hidden alleys, sushi spots, and Mt. Fuji views.', placeIds: [] },
  { id: 'b-2', name: 'Lisbon Wanderlust', description: 'Charming cafes, viewpoints, and pastel de nata.', placeIds: [] },
  { id: 'b-3', name: 'Underground Cafes', description: 'Underrated coffee spots with good vibes.', placeIds: [] }
];

export const getBoards = () => {
  const data = localStorage.getItem(STORAGE_KEYS.BOARDS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(defaultBoards));
    return defaultBoards;
  }
  return JSON.parse(data);
};

export const saveBoards = (boards) => {
  localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  // Dispatch a custom event to notify other components of changes
  window.dispatchEvent(new Event('atlas_iq_storage_update'));
};

export const createBoard = (name, description = '') => {
  const boards = getBoards();
  const newBoard = {
    id: `b-${Date.now()}`,
    name,
    description,
    placeIds: []
  };
  boards.push(newBoard);
  saveBoards(boards);
  return newBoard;
};

export const addPlaceToBoard = (boardId, place) => {
  const boards = getBoards();
  const board = boards.find(b => b.id === boardId);
  if (board) {
    if (!board.placeIds.includes(place.id)) {
      board.placeIds.push(place.id);
      saveBoards(boards);
      // Ensure the place is stored in our enriched places store
      saveEnrichedPlace(place);
    }
  }
};

export const removePlaceFromBoard = (boardId, placeId) => {
  const boards = getBoards();
  const board = boards.find(b => b.id === boardId);
  if (board) {
    board.placeIds = board.placeIds.filter(id => id !== placeId);
    saveBoards(boards);
  }
};

// Pinned Places to Master Map
export const getMapPins = () => {
  const data = localStorage.getItem(STORAGE_KEYS.MAP_PINS);
  return data ? JSON.parse(data) : [];
};

export const saveMapPins = (pins) => {
  localStorage.setItem(STORAGE_KEYS.MAP_PINS, JSON.stringify(pins));
  window.dispatchEvent(new Event('atlas_iq_storage_update'));
};

export const pinToMap = (place) => {
  const pins = getMapPins();
  if (!pins.includes(place.id)) {
    pins.push(place.id);
    saveMapPins(pins);
    saveEnrichedPlace(place);
  }
};

export const unpinFromMap = (placeId) => {
  const pins = getMapPins();
  const updated = pins.filter(id => id !== placeId);
  saveMapPins(updated);
};

export const isPinnedToMap = (placeId) => {
  return getMapPins().includes(placeId);
};

// Key-value store of place details: placeId -> place object
export const getEnrichedPlaces = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ENRICHED_PLACES);
  return data ? JSON.parse(data) : {};
};

export const saveEnrichedPlace = (place) => {
  const places = getEnrichedPlaces();
  places[place.id] = place;
  localStorage.setItem(STORAGE_KEYS.ENRICHED_PLACES, JSON.stringify(places));
};

export const getPlaceById = (placeId) => {
  const places = getEnrichedPlaces();
  return places[placeId] || null;
};

// Search cache for fast retrieval and query bounds mapping
export const getSearchCache = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SEARCH_CACHE);
  return data ? JSON.parse(data) : {};
};

export const cacheSearchResults = (query, results) => {
  const cache = getSearchCache();
  cache[query.toLowerCase()] = {
    timestamp: Date.now(),
    results
  };
  localStorage.setItem(STORAGE_KEYS.SEARCH_CACHE, JSON.stringify(cache));
};

export const getCachedSearchResults = (query) => {
  const cache = getSearchCache();
  const cached = cache[query.toLowerCase()];
  // Expiry check: 7 days
  if (cached && (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000)) {
    return cached.results;
  }
  return null;
};
