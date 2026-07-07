import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  tags?: any;
}

interface TravelState {
  boards: Board[];
  mapPins: string[];
  enrichedPlaces: Record<string, Place>;
  currentExplorePlace: string | null;
  
  // Actions
  setExplorePlace: (place: string | null) => void;
  createBoard: (name: string, description?: string) => Board;
  deleteBoard: (boardId: string) => void;
  addPlaceToBoard: (boardId: string, place: Place) => void;
  removePlaceFromBoard: (boardId: string, placeId: string) => void;
  pinToMap: (place: Place) => void;
  unpinFromMap: (placeId: string) => void;
  isPinned: (placeId: string) => boolean;
}

const defaultBoards: Board[] = [
  { id: 'b-1', name: 'Japan Explorer 2027', description: 'Hidden alleys, sushi spots, and Mt. Fuji views.', placeIds: [] },
  { id: 'b-2', name: 'Lisbon Wanderlust', description: 'Charming cafes, viewpoints, and pastel de nata.', placeIds: [] },
  { id: 'b-3', name: 'Underground Cafes', description: 'Underrated coffee spots with good vibes.', placeIds: [] }
];

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      boards: defaultBoards,
      mapPins: [],
      enrichedPlaces: {},
      currentExplorePlace: null,

      setExplorePlace: (place) => set({ currentExplorePlace: place }),

      createBoard: (name, description = '') => {
        const newBoard: Board = {
          id: `b-${Date.now()}`,
          name,
          description,
          placeIds: []
        };
        set((state) => ({
          boards: [...state.boards, newBoard]
        }));
        return newBoard;
      },

      deleteBoard: (boardId) => set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId)
      })),

      addPlaceToBoard: (boardId, place) => set((state) => {
        const boards = state.boards.map((b) => {
          if (b.id === boardId && !b.placeIds.includes(place.id)) {
            return { ...b, placeIds: [...b.placeIds, place.id] };
          }
          return b;
        });
        const enrichedPlaces = { ...state.enrichedPlaces, [place.id]: place };
        return { boards, enrichedPlaces };
      }),

      removePlaceFromBoard: (boardId, placeId) => set((state) => ({
        boards: state.boards.map((b) => {
          if (b.id === boardId) {
            return { ...b, placeIds: b.placeIds.filter((id) => id !== placeId) };
          }
          return b;
        })
      })),

      pinToMap: (place) => set((state) => {
        const mapPins = state.mapPins.includes(place.id)
          ? state.mapPins
          : [...state.mapPins, place.id];
        const enrichedPlaces = { ...state.enrichedPlaces, [place.id]: place };
        return { mapPins, enrichedPlaces };
      }),

      unpinFromMap: (placeId) => set((state) => ({
        mapPins: state.mapPins.filter((id) => id !== placeId)
      })),

      isPinned: (placeId) => get().mapPins.includes(placeId)
    }),
    {
      name: 'atlas-iq-travel-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
export default useTravelStore;
