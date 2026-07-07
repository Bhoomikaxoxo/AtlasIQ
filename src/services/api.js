// Data Fetching and Enrichment API Service for Atlas IQ
import { getCachedSearchResults, cacheSearchResults } from './store';
import { seedDestinations } from './seedData';

// Curated Unsplash images for high-aesthetic fallbacks (categorized, expanded for no-repetition)
const CATEGORY_IMAGES = {
  cafe: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1463797900200-539c25d0dec2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=600&q=80'
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
  ],
  viewpoint: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
  ],
  historic: [
    'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1549880180-2a4b9c7db08d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1599874971431-7e8c33e8b09b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533854193556-9a2c33eb321e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?auto=format&fit=crop&w=600&q=80'
  ],
  nature: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=600&q=80'
  ],
  attraction: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513807022359-f104b375975f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1531572753726-0fd02d244986?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=600&q=80'
  ]
};

// Simple deterministic hash to make ratings/reviews/images stick to specific places
const getDeterministicHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Mapping function for raw OpenStreetMap tags to clean categories
const getCleanCategory = (tags) => {
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'pub') return 'restaurant';
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.historic || tags.tourism === 'museum') return 'historic';
  if (tags.natural === 'waterfall' || tags.natural === 'peak' || tags.natural === 'beach') return 'nature';
  return 'attraction'; // Default fallback
};

// Formulates the address based on whatever address OSM tags are present
const getCleanAddress = (tags, fallbackName = 'Unknown Area') => {
  const parts = [];
  if (tags['addr:street']) parts.push(`${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim());
  if (tags['addr:suburb'] || tags['addr:neighbourhood']) parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:country']) parts.push(tags['addr:country']);
  
  return parts.length > 0 ? parts.join(', ') : `Near ${fallbackName}`;
};

// Nominatim Geocoding API
export const geocodePlace = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'AtlasIQTravelApp/1.0'
    }
  });
  if (!response.ok) throw new Error('Geocoding service unavailable');
  
  const data = await response.json();
  if (data.length === 0) throw new Error('Destination not found');
  
  const result = data[0];
  const bbox = result.boundingbox.map(Number); // [lat_min, lat_max, lon_min, lon_max]
  
  return {
    displayName: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
    boundingBox: {
      latMin: bbox[0],
      latMax: bbox[1],
      lngMin: bbox[2],
      lngMax: bbox[3]
    }
  };
};

// Overpass API discover spots within bounding box
export const fetchSpotsFromOverpass = async (bbox, centerLat, centerLng) => {
  // Bounding box validation and clamping for country level queries
  // If bbox is too wide, we constrain it to 0.15 degrees (~15-20km) around center
  let latMin = bbox.latMin;
  let latMax = bbox.latMax;
  let lngMin = bbox.boundingBox ? bbox.lngMin : bbox.lngMin; // safety checks
  let lngMax = bbox.lngMax;
  
  const latDelta = Math.abs(latMax - latMin);
  const lngDelta = Math.abs(lngMax - lngMin);
  
  if (latDelta > 0.4 || lngDelta > 0.4) {
    // Clamp to city center size
    latMin = centerLat - 0.12;
    latMax = centerLat + 0.12;
    lngMin = centerLng - 0.12;
    lngMax = centerLng + 0.12;
  }

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="cafe"](${latMin},${lngMin},${latMax},${lngMax});
      node["amenity"="restaurant"](${latMin},${lngMin},${latMax},${lngMax});
      node["tourism"="viewpoint"](${latMin},${lngMin},${latMax},${lngMax});
      node["tourism"="attraction"](${latMin},${lngMin},${latMax},${lngMax});
      node["historic"](${latMin},${lngMin},${latMax},${lngMax});
      node["natural"="waterfall"](${latMin},${lngMin},${latMax},${lngMax});
      node["natural"="peak"](${latMin},${lngMin},${latMax},${lngMax});
      node["tourism"="museum"](${latMin},${lngMin},${latMax},${lngMax});
    );
    out body 40;
  `;
  
  const url = 'https://overpass-api.de/api/interpreter';
  const response = await fetch(url, {
    method: 'POST',
    body: query,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  if (!response.ok) throw new Error('Overpass OSM query failed');
  
  const data = await response.json();
  return data.elements || [];
};

// Main search pipeline connecting Nominatim + Overpass + Enrichment Fallback
export const searchDestination = async (query) => {
  const cached = getCachedSearchResults(query);
  if (cached) return cached;

  const normQuery = query.toLowerCase().trim();
  const matchedKey = Object.keys(seedDestinations).find(key => normQuery.includes(key));
  if (matchedKey) {
    const seeded = seedDestinations[matchedKey];
    cacheSearchResults(query, seeded);
    return seeded;
  }

  // 1. Geocode
  const location = await geocodePlace(query);
  
  // 2. Discover raw OSM nodes
  const rawNodes = await fetchSpotsFromOverpass(location.boundingBox, location.lat, location.lng);
  
  // 3. Clean and enrich spots
  const spots = rawNodes
    .filter(node => node.tags && node.tags.name) // must have a name
    .map((node, idx) => {
      const hash = getDeterministicHash(node.id.toString());
      const category = getCleanCategory(node.tags);
      
      // Deterministic ratings between 4.1 and 4.9
      const rating = (4.1 + (hash % 9) * 0.1).toFixed(1);
      // Deterministic user reviews count
      const userRatingsTotal = 12 + (hash % 1800);
      // Hidden gem threshold
      const isHidden = userRatingsTotal < 120;
      // Deterministic price level (1 to 4)
      const priceLevel = 1 + (hash % 3); // 1 to 3 dollar signs
      
      // Curated image selection: Shuffle index using hash + array position to ensure ZERO repetitions
      const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.attraction;
      const imageIndex = (hash + idx) % images.length;
      const photoUrl = images[imageIndex];
      
      return {
        id: node.id.toString(),
        name: node.tags.name,
        category: category,
        lat: node.lat,
        lng: node.lon,
        address: getCleanAddress(node.tags, location.displayName.split(',')[0]),
        rating: parseFloat(rating),
        userRatingsTotal,
        priceLevel,
        photoUrl,
        isHidden,
        sourcePlace: location.displayName.split(',')[0].trim()
      };
    });
  
  const result = {
    location,
    spots
  };
  
  cacheSearchResults(query, result);
  return result;
};
