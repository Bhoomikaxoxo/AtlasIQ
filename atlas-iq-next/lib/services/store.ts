// LocalStorage Persistence Service for Atlas IQ

export interface Board {
  id: string;
  name: string;
  description: string;
  placeIds: string[];
}

export interface Place {
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
}

const STORAGE_KEYS = {
  BOARDS: 'atlas_iq_boards',
  MAP_PINS: 'atlas_iq_map_pins',
  ENRICHED_PLACES: 'atlas_iq_enriched_places',
  SEARCH_CACHE: 'atlas_iq_search_cache'
};

// Seed initial boards if empty
const defaultBoards: Board[] = [
  { id: 'b-1', name: 'Japan Explorer 2027', description: 'Hidden alleys, sushi spots, and Mt. Fuji views.', placeIds: [] },
  { id: 'b-2', name: 'Lisbon Wanderlust', description: 'Charming cafes, viewpoints, and pastel de nata.', placeIds: [] },
  { id: 'b-3', name: 'Underground Cafes', description: 'Underrated coffee spots with good vibes.', placeIds: [] }
];

const getSafeLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

// Cache-busting version check
const CACHE_VERSION = 'v3';
if (typeof window !== 'undefined') {
  const CURRENT_VERSION = localStorage.getItem('atlas_iq_cache_version');
  if (CURRENT_VERSION !== CACHE_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_CACHE);
    localStorage.removeItem(STORAGE_KEYS.ENRICHED_PLACES);
    localStorage.setItem('atlas_iq_cache_version', CACHE_VERSION);
  }
}

export const getBoards = (): Board[] => {
  const storage = getSafeLocalStorage();
  if (!storage) return defaultBoards;
  const data = storage.getItem(STORAGE_KEYS.BOARDS);
  if (!data) {
    storage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(defaultBoards));
    return defaultBoards;
  }
  return JSON.parse(data);
};

export const saveBoards = (boards: Board[]) => {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  window.dispatchEvent(new Event('atlas_iq_storage_update'));
};

export const createBoard = (name: string, description = ''): Board => {
  const boards = getBoards();
  const newBoard: Board = {
    id: `b-${Date.now()}`,
    name,
    description,
    placeIds: []
  };
  boards.push(newBoard);
  saveBoards(boards);
  return newBoard;
};

export const addPlaceToBoard = (boardId: string, place: Place) => {
  const boards = getBoards();
  const board = boards.find(b => b.id === boardId);
  if (board) {
    if (!board.placeIds.includes(place.id)) {
      board.placeIds.push(place.id);
      saveBoards(boards);
      saveEnrichedPlace(place);
    }
  }
};

export const removePlaceFromBoard = (boardId: string, placeId: string) => {
  const boards = getBoards();
  const board = boards.find(b => b.id === boardId);
  if (board) {
    board.placeIds = board.placeIds.filter(id => id !== placeId);
    saveBoards(boards);
  }
};

// Pinned Places to Master Map
export const getMapPins = (): string[] => {
  const storage = getSafeLocalStorage();
  if (!storage) return [];
  const data = storage.getItem(STORAGE_KEYS.MAP_PINS);
  return data ? JSON.parse(data) : [];
};

export const saveMapPins = (pins: string[]) => {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.MAP_PINS, JSON.stringify(pins));
  window.dispatchEvent(new Event('atlas_iq_storage_update'));
};

export const pinToMap = (place: Place) => {
  const pins = getMapPins();
  if (!pins.includes(place.id)) {
    pins.push(place.id);
    saveMapPins(pins);
    saveEnrichedPlace(place);
  }
};

export const unpinFromMap = (placeId: string) => {
  const pins = getMapPins();
  const updated = pins.filter(id => id !== placeId);
  saveMapPins(updated);
};

export const isPinnedToMap = (placeId: string): boolean => {
  return getMapPins().includes(placeId);
};

// Key-value store of place details: placeId -> place object
export const getEnrichedPlaces = (): Record<string, Place> => {
  const storage = getSafeLocalStorage();
  if (!storage) return {};
  const data = storage.getItem(STORAGE_KEYS.ENRICHED_PLACES);
  return data ? JSON.parse(data) : {};
};

export const saveEnrichedPlace = (place: Place) => {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  const places = getEnrichedPlaces();
  places[place.id] = place;
  storage.setItem(STORAGE_KEYS.ENRICHED_PLACES, JSON.stringify(places));
};

export const getPlaceById = (placeId: string): Place | null => {
  const places = getEnrichedPlaces();
  return places[placeId] || null;
};
