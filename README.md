# 🗺️ Atlas IQ — Pinterest for Travel Planning

Atlas IQ is a modern, high-aesthetic travel discovery and planning web application — **"Pinterest, but for travel."** Users search a destination, browse a Pinterest-style masonry grid of curated spots (cafes, restaurants, viewpoints, historic sites, nature, attractions), view real ratings/prices/photos, save them to personal Boards, and pin them to a single Master Map for trip planning.

This is the **full-stack rebuild** of Atlas IQ — migrated from a client-side Vite SPA to a proper Next.js application with a secure backend aggregation layer, so no third-party API keys are ever exposed to the browser.

---

## 🌟 Key Features

**Premium Visuals & Motion Design**
Deep charcoal/navy background (`#0B0E14`) with teal, violet, and amber accents. Custom WebGL strands background, shimmer-motion hero title, and a liquid GSAP marquee for category filtering.

**Live Global Discovery Pipeline**
- **Geocoding:** Search queries are geocoded on the fly via Geoapify (primary) with Nominatim as a fallback — works for any country, city, or landmark, not a fixed sample list.
- **Spot Discovery:** OpenStreetMap nodes are queried via the Overpass API within the searched area's bounds; OpenTripMap supplements this with richer attraction/landmark metadata.
- **Real Photo Matching:** A strict, multi-source fallback chain — Wikidata (direct entity match) → Google Places (accepted only if the result is within 100m *and* passes a name-similarity check) → Foursquare → Mapillary → a clearly-labeled generic category photo as a last resort. No AI-generated or mismatched images are presented as if they were the real place.
- **Destination Context:** A Wikipedia-sourced summary, live weather (Open-Meteo), and currency/exchange info (Frankfurter) for the searched destination.
- **Rule-Based Classification:** Spots are tagged as "Hidden Gem" or "Popular" based on real review-count thresholds — never guessed, and shown as "Unrated" when no data exists rather than defaulting silently.

**Freeform Boards**
Save places into personal, freely-named collections — a place can belong to multiple boards.

**Interactive Master Map**
A single MapLibre GL JS dark vector map (CartoDB Dark Matter tiles, no API key required) plots every pinned spot across all boards. Markers are color-coded (teal for hidden gems, violet for popular spots), auto-fit bounds, and support filtering by board.

**Secure by Design**
All third-party API calls (Google Places, Foursquare, Mapillary, OpenTripMap, Geoapify, etc.) happen server-side through Next.js API routes. No API keys are ever bundled into client-side JavaScript.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Caching | Redis (Upstash), with Postgres fallback |
| State Management | Zustand |
| Maps | MapLibre GL JS |
| Styling | Tailwind CSS, custom design tokens |
| Animation | `ogl` (WebGL strands), `motion` (shimmer text), `gsap` (marquee filters) |
| Icons | lucide-react |
| Deployment | Vercel (app) + Neon/Supabase (Postgres) + Upstash (Redis) |

---

## 🔌 Data Sources

All external data sources used are free-tier APIs, aggregated server-side into a single unified response per destination:

| Source | Purpose | Notes |
|---|---|---|
| Geoapify | Primary destination geocoding | Free tier |
| Nominatim (OSM) | Fallback geocoding | Free, no key |
| Overpass API (OSM) | Cafes, restaurants, bars, shops, hotels | Free, no key |
| OpenTripMap | Attractions, museums, landmarks, viewpoints | Free tier |
| Wikidata | Primary real-photo source (direct entity match) | Free, no key |
| Google Places | Secondary photo/rating source (strict-matched only) | Free credit, billed past it |
| Foursquare | Tertiary photo/rating source | Free tier |
| Mapillary | Coordinate-based street-level photo fallback | Free with access token |
| Wikipedia | Destination summary/description | Free, no key |
| Open-Meteo | Weather (current, hourly, 7-day) | Free, no key |
| Frankfurter | Currency/exchange rate | Free, no key |

> ⚠️ Google Places is the only source with a real cost ceiling (a monthly free credit, billed per request beyond it). All other sources are free without a spend risk. Set up billing alerts on Google Cloud if you enable this integration.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com) free tier)
- A Redis instance (e.g. [Upstash](https://upstash.com) free tier) — optional, falls back to Postgres-only caching if not configured

### Installation

Clone the repository and navigate into it:
```bash
git clone https://github.com/Bhoomikaxoxo/AtlasIQ.git
cd AtlasIQ
```

Install dependencies:
```bash
npm install
```

Copy the environment template and fill in your keys:
```bash
cp .env.example .env
```

Required environment variables:
```bash
DATABASE_URL=              # Postgres connection string
REDIS_URL=                 # Optional — Upstash Redis connection string
GEOAPIFY_API_KEY=          # Free tier
GOOGLE_PLACES_API_KEY=     # Optional — free credit, billed past it
FOURSQUARE_API_KEY=        # Optional, free tier
MAPILLARY_ACCESS_TOKEN=    # Optional, free tier
OPENTRIPMAP_API_KEY=       # Free tier
```
> Note: none of these are prefixed with `NEXT_PUBLIC_` — they are server-only and never reach the browser.

Run Prisma migrations to set up your database schema:
```bash
npx prisma migrate dev
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
AtlasIQ/
├── app/
│   ├── page.tsx                    # Landing page (search entry point)
│   ├── explore/page.tsx            # Pinterest-style masonry grid
│   ├── boards/page.tsx             # Board dashboard
│   ├── boards/[id]/page.tsx        # Individual board detail view
│   ├── map/page.tsx                # Master map view
│   └── api/
│       ├── search/route.ts         # POST — search a destination
│       └── destination/[place]/route.ts  # GET — fetch a cached/live destination
├── lib/
│   ├── services/
│   │   ├── geo.ts                  # Geoapify + Nominatim geocoding
│   │   ├── places.ts               # Overpass discovery
│   │   ├── attractions.ts          # OpenTripMap enrichment
│   │   ├── photos.ts               # Strict-match photo chain (Wikidata → Google → Foursquare → Mapillary → generic)
│   │   ├── description.ts          # Wikipedia summary
│   │   ├── weather.ts              # Open-Meteo
│   │   ├── currency.ts             # Frankfurter
│   │   ├── destination.ts          # Orchestrator — merges all services into the Unified Destination Object
│   │   └── cache.ts                # Redis/Postgres caching controller
│   └── store/
│       └── useTravelStore.ts       # Zustand store (search, boards, map pins, filters)
├── components/
│   ├── Strands/                    # WebGL ribbon canvas background
│   ├── ShinyText/                  # Shimmer-motion hero title
│   ├── FlowingMenu/                # GSAP marquee category filter
│   └── ui/
│       ├── PlaceCard.tsx           # Grid card
│       ├── DetailModal.tsx         # Spot detail panel
│       └── BoardPicker.tsx         # Inline multi-board save dropdown
├── prisma/
│   └── schema.prisma                # Destination, Place, Board, BoardPlace, MapPin models
└── .env.example
```

---

## 🧭 Architecture Overview

```
Browser (Next.js App Router pages)
        ↓
/api/search  or  /api/destination/[place]
        ↓
DestinationService (orchestrator, runs in parallel)
   ├── GeoService          → Geoapify / Nominatim
   ├── PlacesService       → Overpass
   ├── AttractionsService  → OpenTripMap
   ├── PhotoService        → Wikidata → Google Places → Foursquare → Mapillary → generic
   ├── DescriptionService  → Wikipedia
   ├── WeatherService      → Open-Meteo
   ├── CurrencyService     → Frankfurter
   └── CacheService        → Redis → Postgres fallback
        ↓
Unified Destination Object (normalized, ranked)
        ↓
Rendered in Explore / Boards / Map pages
```

Every service fails independently — if one provider is down or unmatched, the rest of the page still renders.

---

## 🗺️ Roadmap

- [x] Live global data pipeline (geocoding → discovery → enrichment)
- [x] Strict, transparent photo matching (no mismatched/AI images)
- [x] Freeform boards + master map pinning
- [x] Full-stack migration with secure server-side API layer
- [ ] AI Trip Optimizer — analyzes a board's saved places and suggests smarter routing/substitutions (e.g. a similar-vibe spot that saves travel time). Rule-based + embedding-similarity driven, not a trained model.
- [ ] User authentication and multi-device board sync
- [ ] Shareable public boards

---

## 📜 License

This project is licensed under the MIT License — see the `LICENSE` file for details.
