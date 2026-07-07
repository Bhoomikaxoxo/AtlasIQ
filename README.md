# 🗺️ Atlas IQ — Pinterest for Travel Planning

**Atlas IQ** is a modern, high-aesthetic travel discovery and planning web application ("Pinterest, but for travel"). Users can search destinations, browse a Pinterest-style masonry grid of curated spots (cafes, restaurants, viewpoints, historic sites, nature, attractions), view detailed ratings/prices/photos, save them to custom Boards, and pin them to a single Master Map.

---

## 🌟 Key Features

*   **Premium Visuals & Motion Design**: Deep charcoal/navy background (`#0B0E14`), teals, violets, and amber accents. Integrates a custom WebGL strands background, motion-shimmer header, and liquid GSAP marquee category filters.
*   **Discovery Pipeline**:
    *   **Geocoding Autocomplete**: Input query geocodes on-the-fly using the free Nominatim API.
    *   **OSM Spot Discovery**: Queries OpenStreetMap nodes via the Overpass API inside the target city's bounds.
*   **Real Data & Sandbox Fallback**:
    *   **Curated Seeds (`seedData.js`)**: Matches Lisbon, Bali, and Tokyo to a hand-curated database featuring **real coordinates**, **real ratings** (e.g. 4.8 / 5.0), **real review counts**, and **authentic photos**.
    *   **Anti-Repetition Shuffling**: Expanded pools of 15 unique, category-relevant Unsplash images that are shuffled using the spot's hash and list index `(hash + idx) % images.length`. Adjacent place cards will never repeat the same photo.
*   **Freeform Boards**: Group saved places into personal collections (saved in `localStorage` with version-based cache-busting to clear old assets).
*   **Interactive Master Map**: A single MapLibre GL JS dark vector map (CartoDB Dark Matter tiles, zero keys required) to plot pinned spots. Markers are color-coded (Teal for hidden gems, Violet for popular spots), auto-fit bounds, and support Board-level filtering.

---

## 🚀 Tech Stack

*   **Core**: React (Vite-scaffolded, client-side SPA)
*   **Styling**: Vanilla CSS, Space Grotesk & Inter Typography
*   **Animation & WebGL**:
    *   `ogl` (custom WebGL shader for strands)
    *   `motion` (shimmer text headers)
    *   `gsap` (horizontal indicator marquee filtering)
*   **Maps**: `maplibre-gl` (Vector map)
*   **Icons**: `lucide-react`

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have Node.js installed (v18+ recommended).

### Installation
1. Clone the repository and navigate into it:
   ```bash
   git clone https://github.com/Bhoomikaxoxo/AtlasIQ.git
   cd AtlasIQ
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the local development server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser to test the application.

### Building for Production
Bundle and minify the files for static hosting:
```bash
npm run build
```
The output will be created inside the `dist/` directory.

---

## 📂 Project Structure

```
AtlasIQ/
├── index.html                  # Font preconnects and document entry
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                # Render entry
│   ├── App.jsx                 # Top nav bar, state routing, pages switcher
│   ├── App.css                 # Nav layout, active tabs, animations
│   ├── index.css               # Design system tokens, variables, scrollbar
│   ├── services/
│   │   ├── api.js              # Geocoding, Overpass query compiler, image selection
│   │   ├── seedData.js         # Real spot coordinates, reviews, and images
│   │   └── store.js            # LocalStorage cache wrapper with v2 cache buster
│   ├── components/
│   │   ├── Strands/            # WebGL ribbon canvas background
│   │   ├── ShinyText/          # Framer-motion shimmer text title
│   │   ├── FlowingMenu/        # GSAP horizontal marquee category nav
│   │   └── UI/
│   │       ├── PlaceCard.jsx   # Grid card
│   │       ├── DetailModal.jsx # Spot details panel
│   │       └── BoardPicker.jsx # Multi-board inline save dropdown
│   └── pages/
│       ├── Landing.jsx         # Geocoding search page
│       ├── Explore.jsx         # Spots explorer masonry grid
│       ├── Boards.jsx          # Dashboard of user collections
│       └── MapView.jsx         # Dark vector Map with custom popups
```

---

## 📜 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
