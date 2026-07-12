// Data Fetching and Enrichment API Service for Atlas IQ
import { getCachedSearchResults, cacheSearchResults, getPlaceById, saveEnrichedPlace } from './store';

const MAPILLARY_SUITABLE_CATEGORIES = new Set(['viewpoint', 'nature', 'historic', 'attraction']);

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
    'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=600&q=80'
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
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80'
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
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80'
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
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
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
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
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
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
  ]
};

// Curated static cities per country fallback
const COUNTRY_CITIES = {
  india: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Udaipur', 'Kochi', 'Agra', 'Varanasi', 'Amritsar'],
  usa: ['New York City', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Seattle', 'Boston', 'Austin', 'Denver', 'Las Vegas', 'New Orleans', 'Honolulu', 'Washington DC', 'San Diego', 'Portland'],
  'united states': ['New York City', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Seattle', 'Boston', 'Austin', 'Denver', 'Las Vegas', 'New Orleans', 'Honolulu', 'Washington DC', 'San Diego', 'Portland'],
  portugal: ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Funchal', 'Sintra', 'Cascais', 'Lagos', 'Evora'],
  italy: ['Rome', 'Milan', 'Florence', 'Venice', 'Naples', 'Turin', 'Bologna', 'Palermo', 'Genoa', 'Pisa', 'Siena', 'Verona', 'Amalfi', 'Positano', 'Como'],
  spain: ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Malaga', 'Granada', 'Bilbao', 'Ibiza', 'Mallorca', 'San Sebastian', 'Zaragoza', 'Santiago de Compostela'],
  france: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Cannes', 'Chamonix'],
  japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo', 'Fukuoka', 'Hiroshima', 'Nagoya', 'Nara', 'Okinawa', 'Kobe', 'Kanazawa', 'Hakone'],
  indonesia: ['Jakarta', 'Canggu', 'Ubud', 'Seminyak', 'Kuta', 'Sanur', 'Nusa Dua', 'Yogyakarta', 'Bandung', 'Surabaya', 'Medan', 'Makassar'],
  uk: ['London', 'Edinburgh', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Newcastle', 'Belfast', 'Bath', 'Oxford', 'Cambridge'],
  'united kingdom': ['London', 'Edinburgh', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Newcastle', 'Belfast', 'Bath', 'Oxford', 'Cambridge'],
  germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Dusseldorf', 'Stuttgart', 'Leipzig', 'Dresden', 'Nuremberg', 'Heidelberg', 'Bremen'],
  australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Cairns', 'Hobart', 'Canberra', 'Darwin'],
  canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City', 'Winnipeg', 'Halifax', 'Victoria'],
  brazil: ['Rio de Janeiro', 'Sao Paulo', 'Salvador', 'Brasilia', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
  mexico: ['Mexico City', 'Cancun', 'Guadalajara', 'Monterrey', 'Oaxaca', 'Merida', 'Cabo San Lucas', 'Puerto Vallarta', 'Puebla', 'Tulum'],
  greece: ['Athens', 'Santorini', 'Mykonos', 'Thessaloniki', 'Corfu', 'Rhodes', 'Chania', 'Heraklion', 'Zakynthos', 'Naxos'],
  thailand: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Koh Samui', 'Krabi', 'Hua Hin', 'Ayutthaya', 'Chiang Rai', 'Pai'],
  vietnam: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hoi An', 'Nha Trang', 'Hue', 'Ha Long Bay', 'Sapa', 'Phu Quoc', 'Da Lat'],
  philippines: ['Manila', 'Cebu City', 'Boracay', 'El Nido', 'Davao City', 'Baguio', 'Tagaytay', 'Puerto Princesa', 'Siargao', 'Iloilo'],
  korea: ['Seoul', 'Busan', 'Jeju', 'Incheon', 'Daegu', 'Gyeongju', 'Jeonju', 'Suwon', 'Daejeon', 'Ulsan'],
  'south korea': ['Seoul', 'Busan', 'Jeju', 'Incheon', 'Daegu', 'Gyeongju', 'Jeonju', 'Suwon', 'Daejeon', 'Ulsan']
};

const getDeterministicHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// String similarity calculator (containment checks + token Jaccard)
const getStringSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  // Substring check
  if (s1.includes(s2) || s2.includes(s1)) {
    const lenRatio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    if (lenRatio > 0.4) return 0.85;
  }

  // Token Jaccard Check
  const words1 = s1.split(/[^a-z0-9]+/);
  const words2 = s2.split(/[^a-z0-9]+/);
  const intersection = words1.filter(w => w.length > 2 && words2.includes(w));
  
  if (intersection.length > 0) {
    return intersection.length / Math.min(words1.length, words2.length);
  }
  
  return 0.0;
};

export const getMatchConfidence = (distanceMeters, nameSimilarity) => {
  // Distance score: 1.0 at 0m, decaying linearly to 0 at 100m
  const distanceScore = Math.max(0, 1 - distanceMeters / 100);
  // Weight distance more heavily than name similarity —
  // proximity is more reliable than string matching for informal OSM names
  return distanceScore * 0.6 + nameSimilarity * 0.4;
};

// Minimum confidence to accept a candidate as a real match
export const MATCH_CONFIDENCE_THRESHOLD = 0.45;

const getCleanCategory = (tags) => {
  if (tags.amenity === 'cafe' || tags.amenity === 'ice_cream') return 'cafe';
  if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'pub' || tags.amenity === 'bar') return 'restaurant';
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.historic || tags.tourism === 'museum') return 'historic';
  if (tags.natural === 'waterfall' || tags.natural === 'peak' || tags.natural === 'beach') return 'nature';
  return 'attraction';
};

const getCleanAddress = (tags, fallbackName = 'Unknown Area') => {
  const parts = [];
  if (tags['addr:street']) parts.push(`${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim());
  if (tags['addr:suburb'] || tags['addr:neighbourhood']) parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:country']) parts.push(tags['addr:country']);
  
  return parts.length > 0 ? parts.join(', ') : `Near ${fallbackName}`;
};

// Fetch real photo of a place from Wikidata (Wikimedia Commons) using its QID
export const fetchWikidataImage = async (wikidataId) => {
  if (!wikidataId) return null;
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${encodeURIComponent(wikidataId)}&property=P18&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const claim = data.claims && data.claims.P18 && data.claims.P18[0];
    const filename = claim && claim.mainsnak && claim.mainsnak.datavalue && claim.mainsnak.datavalue.value;
    if (filename) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching Wikidata image for ${wikidataId}:`, err);
    return null;
  }
};

// Fetch image from Wikimedia Commons using text search (with city fallback)
export const fetchWikimediaCommonsImage = async (name, city) => {
  try {
    // Try first with name + city
    const query = city ? `${name} ${city}` : name;
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap%20${encodeURIComponent(query)}&gsrlimit=1&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*`;
    let res = await fetch(url);
    if (res.ok) {
      let data = await res.json();
      let pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const imageInfo = pages[pageId]?.imageinfo?.[0];
        if (imageInfo?.url) return imageInfo.url;
      }
    }
    
    // If that fails, try with just the name
    if (city) {
      const urlFallback = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap%20${encodeURIComponent(name)}&gsrlimit=1&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*`;
      let resFallback = await fetch(urlFallback);
      if (resFallback.ok) {
        let dataFallback = await resFallback.json();
        let pagesFallback = dataFallback.query?.pages;
        if (pagesFallback) {
          const pageId = Object.keys(pagesFallback)[0];
          const imageInfo = pagesFallback[pageId]?.imageinfo?.[0];
          if (imageInfo?.url) return imageInfo.url;
        }
      }
    }
    return null;
  } catch (err) {
    console.error(`Error in Wikimedia Commons search for "${name}":`, err);
    return null;
  }
};

// Mapillary coordinate-only image lookup with progressive radius deltas
export const fetchMapillaryImage = async (lat, lng) => {
  const token = import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN || '';
  if (!token) return null;

  const deltas = [0.0005, 0.0015, 0.003]; // ~55m, ~165m, ~330m
  for (const delta of deltas) {
    try {
      const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
      const url = `https://graph.mapillary.com/images?access_token=${token}&fields=id,thumb_1024_url&bbox=${bbox}&limit=1`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const img = data.data && data.data[0];
      if (img && img.thumb_1024_url) return img.thumb_1024_url;
    } catch (err) {
      console.error('Error fetching Mapillary image:', err);
    }
  }
  return null;
};

// Fetch stock image from Pexels API using search terms
export const fetchPexelsImage = async (query) => {
  const key = import.meta.env.VITE_PEXELS_API_KEY || '';
  if (!key) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`;
    const res = await fetch(url, {
      headers: {
        'Authorization': key
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const photos = data.photos || [];
    if (photos.length > 0) {
      const hash = getDeterministicHash(query);
      const index = hash % photos.length;
      return photos[index].src.large || photos[index].src.medium;
    }
    return null;
  } catch (err) {
    console.error(`Error in Pexels search for "${query}":`, err);
    return null;
  }
};

// Foursquare Places API lookup with confidence-based matching
export const enrichPlaceWithFoursquare = async (name, lat, lng) => {
  const key = import.meta.env.VITE_FOURSQUARE_API_KEY || '';
  if (!key) return null;

  try {
    const searchUrl = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&query=${encodeURIComponent(name)}&radius=150&limit=5`;
    const res = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': key
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const venues = data.results || [];
    if (venues.length === 0) return null;

    // Score all candidates, keep the best
    const scored = venues.map((venue) => {
      const distance = getDistanceInMeters(lat, lng, venue.geocodes.main.latitude, venue.geocodes.main.longitude);
      const similarity = getStringSimilarity(name, venue.name);
      const confidence = getMatchConfidence(distance, similarity);
      return { venue, distance, similarity, confidence };
    });

    scored.sort((a, b) => b.confidence - a.confidence);
    const best = scored[0];

    console.warn(
      `[Foursquare Match] "${name}" -> "${best.venue.name}" ` +
      `(dist: ${Math.round(best.distance)}m, sim: ${best.similarity.toFixed(2)}, confidence: ${best.confidence.toFixed(2)})`
    );

    if (best.confidence < MATCH_CONFIDENCE_THRESHOLD) {
      return null;
    }

    const photoUrl = `https://api.foursquare.com/v3/places/${best.venue.fsq_id}/photos?limit=1`;
    const photoRes = await fetch(photoUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': key
      }
    });
    if (!photoRes.ok) return null;
    const photos = await photoRes.json();
    const photo = photos && photos[0];
    if (photo) {
      return {
        photoUrl: `${photo.prefix}800x600${photo.suffix}`,
        distanceMeters: best.distance,
        nameSimilarity: best.similarity,
        rating: best.venue.rating ? best.venue.rating / 2.0 : null,
        userRatingsTotal: best.venue.stats?.ratings_count || null
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching Foursquare photo:', err);
    return null;
  }
};

// Fetch cities in country from Nominatim
async function getCitiesForCountry(countryQuery, limit = 20) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(countryQuery)}&format=json&featuretype=city&limit=${limit}`,
      { headers: { 'User-Agent': 'AtlasIQ/1.0 (contact@yourdomain.com)' } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Nominatim Reverse Geocoding API
export const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AtlasIQ/1.0 (contact@yourdomain.com)'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const parts = [];
      if (addr.road) parts.push(addr.road);
      if (addr.suburb || addr.neighbourhood || addr.village || addr.town) {
        parts.push(addr.suburb || addr.neighbourhood || addr.village || addr.town);
      }
      if (addr.city || addr.county) parts.push(addr.city || addr.county);
      if (addr.state) parts.push(addr.state);
      return parts.join(', ');
    }
    return data.display_name || null;
  } catch (err) {
    console.error('Error in reverse geocoding:', err);
    return null;
  }
};

// Nominatim Geocoding API
export const geocodePlace = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'AtlasIQ/1.0 (contact@yourdomain.com)'
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

// Overpass API discover spots within bounding box (supports way and relation center resolutions)
export const fetchSpotsFromOverpass = async (bbox, centerLat, centerLng) => {
  let latMin = bbox.latMin;
  let latMax = bbox.latMax;
  let lngMin = bbox.lngMin;
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

  const query = `[out:json][timeout:25];
(
  nwr["amenity"~"cafe|restaurant|bar|fast_food|ice_cream"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["tourism"~"attraction|viewpoint|museum|gallery|artwork|zoo|hotel|theme_park"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["historic"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["natural"~"waterfall|peak|beach|cave_entrance"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["leisure"~"park|garden|nature_reserve"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["shop"~"bakery|art|gift"](${latMin},${lngMin},${latMax},${lngMax});
);
out center;`;
  
  const url = 'https://overpass-api.de/api/interpreter';
  const response = await fetch(url, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  if (!response.ok) throw new Error('Overpass OSM query failed');
  
  const data = await response.json();
  const elements = data.elements || [];

  // Parse coords correctly for way/relation elements that return center coordinates
  const parsedElements = elements.map(el => ({
    ...el,
    lat: el.lat || (el.center && el.center.lat),
    lon: el.lon || (el.center && el.center.lon)
  })).filter(el => el.lat != null && el.lon != null);

  return {
    elements: parsedElements,
    queryStr: query
  };
};

// Google Places Nearby Search with confidence-based matching
export const enrichPlaceWithGoogle = async (name, lat, lng) => {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
  if (!key) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&keyword=${encodeURIComponent(name)}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.results || data.results.length === 0) return null;

    // Score top 5 candidates, keep the best
    const candidates = data.results.slice(0, 5);
    const scored = candidates.map((candidate) => {
      const candidateLat = candidate.geometry.location.lat;
      const candidateLng = candidate.geometry.location.lng;
      const distanceMeters = getDistanceInMeters(lat, lng, candidateLat, candidateLng);
      const nameSimilarity = getStringSimilarity(name, candidate.name);
      const confidence = getMatchConfidence(distanceMeters, nameSimilarity);
      return { candidate, distanceMeters, nameSimilarity, confidence };
    });

    scored.sort((a, b) => b.confidence - a.confidence);
    const best = scored[0];

    console.warn(
      `[Google Places Match] "${name}" -> "${best.candidate.name}" ` +
      `(dist: ${Math.round(best.distanceMeters)}m, sim: ${best.nameSimilarity.toFixed(2)}, confidence: ${best.confidence.toFixed(2)})`
    );

    if (best.confidence < MATCH_CONFIDENCE_THRESHOLD) {
      return null;
    }

    const photoRef = best.candidate.photos && best.candidate.photos[0]
      ? best.candidate.photos[0].photo_reference
      : null;
    const photoUrl = photoRef 
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${key}`
      : null;

    return {
      rating: best.candidate.rating || null,
      userRatingsTotal: best.candidate.user_ratings_total || null,
      priceLevel: best.candidate.price_level || 1,
      photoUrl,
      distanceMeters: best.distanceMeters,
      nameSimilarity: best.nameSimilarity
    };
  } catch (err) {
    console.error('Error enriching place with Google:', err);
    return null;
  }
};

// Main search pipeline with pagination and lazy enrichment
export const searchDestination = async (query, page = 1, pageSize = 40) => {
  const normQuery = query.toLowerCase().trim();
  const cachedData = getCachedSearchResults(query);

  let location;
  let rawNodes = [];
  let debugInfo = null;

  if (cachedData && cachedData.rawNodes) {
    location = cachedData.location;
    rawNodes = cachedData.rawNodes;
    debugInfo = cachedData.debugInfo || null;
  } else {
    // 1. Geocode
    try {
      location = await geocodePlace(query);
    } catch {
      throw new Error('Destination not found');
    }

    const latDelta = Math.abs(location.boundingBox.latMax - location.boundingBox.latMin);
    const lngDelta = Math.abs(location.boundingBox.lngMax - location.boundingBox.lngMin);
    const sourcePlaceName = location.displayName.split(',')[0];

    let citiesQueriedList = [];
    let overpassQueryStr = '';

    // 2. Query OSM places: handle country-sized searches by query splitting
    if (latDelta > 2.0 || lngDelta > 2.0) {
      const citiesData = await getCitiesForCountry(query, 15);
      let citiesToQuery = citiesData.map(c => c.display_name.split(',')[0]);

      if (citiesToQuery.length === 0) {
        const matchedCountry = Object.keys(COUNTRY_CITIES).find(c => normQuery.includes(c));
        citiesToQuery = matchedCountry ? COUNTRY_CITIES[matchedCountry] : [];
      }

      if (citiesToQuery.length > 0) {
        citiesQueriedList = citiesToQuery;
        const promises = citiesToQuery.map(async (city) => {
          try {
            const cityLoc = await geocodePlace(`${city}, ${query}`);
            const result = await fetchSpotsFromOverpass(cityLoc.boundingBox, cityLoc.lat, cityLoc.lng);
            if (!overpassQueryStr) overpassQueryStr = result.queryStr;
            return result.elements.map(node => ({ ...node, cityName: city }));
          } catch (err) {
            console.error(`Failed to fetch spots for city ${city}:`, err);
            return [];
          }
        });
        const results = await Promise.all(promises);
        rawNodes = results.flat();
      } else {
        try {
          const capitalLoc = await geocodePlace(`Capital of ${query}`);
          citiesQueriedList = [`Capital: ${capitalLoc.displayName.split(',')[0]}`];
          const result = await fetchSpotsFromOverpass(capitalLoc.boundingBox, capitalLoc.lat, capitalLoc.lng);
          rawNodes = result.elements;
          overpassQueryStr = result.queryStr;
        } catch {
          citiesQueriedList = ['Country Center'];
          const result = await fetchSpotsFromOverpass(location.boundingBox, location.lat, location.lng);
          rawNodes = result.elements;
          overpassQueryStr = result.queryStr;
        }
      }
    } else {
      citiesQueriedList = [sourcePlaceName];
      const result = await fetchSpotsFromOverpass(location.boundingBox, location.lat, location.lng);
      rawNodes = result.elements;
      overpassQueryStr = result.queryStr;
    }

    // 3. Quality scoring, Deduplication & Pre-sorting
    const validNodes = rawNodes.filter(node => node.tags && node.tags.name);
    
    const getQualityScore = (node) => {
      let score = 0;
      if (node.tags) {
        score += Object.keys(node.tags).length;
        if (node.tags.website) score += 2;
        if (node.tags.opening_hours) score += 1;
        if (node.tags.phone) score += 1;
        if (node.tags.description) score += 3;
      }
      return score;
    };

    // Deduplicate by name + proximity (< 50m)
    const uniqueNodes = [];
    for (const node of validNodes) {
      const isDuplicate = uniqueNodes.some(existing => {
        if (existing.tags.name.toLowerCase().trim() === node.tags.name.toLowerCase().trim()) {
          const dist = getDistanceInMeters(existing.lat, existing.lon, node.lat, node.lon);
          return dist < 50;
        }
        return false;
      });
      if (!isDuplicate) {
        uniqueNodes.push(node);
      }
    }

    uniqueNodes.sort((a, b) => getQualityScore(b) - getQualityScore(a));

    debugInfo = {
      citiesQueried: citiesQueriedList,
      rawOsmCount: validNodes.length,
      dedupedOsmCount: uniqueNodes.length,
      overpassQuery: overpassQueryStr
    };

    cacheSearchResults(query, { location, rawNodes: uniqueNodes, debugInfo });
    rawNodes = uniqueNodes;
  }

  // 4. Paginate
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageNodes = rawNodes.slice(startIndex, endIndex);
  const sourcePlaceName = location.displayName.split(',')[0];

  // 5. Enrich current page (progressive lazy pipeline)
  const spotsPromises = pageNodes.map(async (node, idx) => {
    const placeId = node.id.toString();

    const cachedEnriched = getPlaceById(placeId);
    if (cachedEnriched) return cachedEnriched;

    const hash = getDeterministicHash(placeId);
    const category = getCleanCategory(node.tags);
    
    let rating = null;
    let userRatingsTotal = null;
    let priceLevel = 1;
    let photoUrl = null;
    let photoSource = 'generic';
    let matchDistance = null;
    let nameSimilarity = null;

    // Priority 1: Wikidata P18 image
    if (node.tags && node.tags.wikidata) {
      const wikiPhoto = await fetchWikidataImage(node.tags.wikidata);
      if (wikiPhoto) {
        photoUrl = wikiPhoto;
        photoSource = 'wikidata';
        matchDistance = 0;
        nameSimilarity = 1.0;
      }
    }

    // Priority 2: Google Places (Nearby Search with strict filters)
    if (!photoUrl) {
      const googleData = await enrichPlaceWithGoogle(node.tags.name, node.lat, node.lon);
      if (googleData) {
        rating = googleData.rating;
        userRatingsTotal = googleData.userRatingsTotal;
        priceLevel = googleData.priceLevel;
        photoUrl = googleData.photoUrl;
        if (photoUrl) {
          photoSource = 'google';
          matchDistance = googleData.distanceMeters;
          nameSimilarity = googleData.nameSimilarity;
        }
      }
    }

    // Priority 3: Foursquare lookup
    if (!photoUrl) {
      const fsqData = await enrichPlaceWithFoursquare(node.tags.name, node.lat, node.lon);
      if (fsqData) {
        rating = fsqData.rating;
        userRatingsTotal = fsqData.userRatingsTotal;
        photoUrl = fsqData.photoUrl;
        photoSource = 'foursquare';
        matchDistance = fsqData.distanceMeters;
        nameSimilarity = fsqData.nameSimilarity;
      }
    }

    // Priority 4: Wikimedia Commons Search
    if (!photoUrl) {
      const commonsPhoto = await fetchWikimediaCommonsImage(node.tags.name, node.cityName || sourcePlaceName);
      if (commonsPhoto) {
        photoUrl = commonsPhoto;
        photoSource = 'wikimedia_search';
        matchDistance = 0;
        nameSimilarity = 1.05;
      }
    }

    // Priority 5: Mapillary coordinate image (only for suitable outdoor categories)
    if (!photoUrl && MAPILLARY_SUITABLE_CATEGORIES.has(category)) {
      const mapillaryPhoto = await fetchMapillaryImage(node.lat, node.lon);
      if (mapillaryPhoto) {
        photoUrl = mapillaryPhoto;
        photoSource = 'mapillary';
        matchDistance = 0;
        nameSimilarity = 1.0;
      }
    }

    // Priority 5.5: Pexels API (Dynamic contextual stock photos)
    if (!photoUrl) {
      const queryTerm = `${category} ${node.cityName || sourcePlaceName || ''}`.trim();
      const pexelsPhoto = await fetchPexelsImage(queryTerm);
      if (pexelsPhoto) {
        photoUrl = pexelsPhoto;
        photoSource = 'pexels';
        matchDistance = 0;
        nameSimilarity = 1.0;
      }
    }

    // Priority 6: Generic stock fallback
    if (!photoUrl) {
      const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.attraction;
      const imageIndex = (hash + idx) % images.length;
      photoUrl = images[imageIndex];
      photoSource = 'generic';
    }

    // Classification
    const HIDDEN_GEM_THRESHOLD = 50;
    let classification = 'unrated';
    if (userRatingsTotal != null) {
      classification = userRatingsTotal < HIDDEN_GEM_THRESHOLD ? 'hidden' : 'popular';
    }
    const isHidden = classification === 'hidden';

    let address = getCleanAddress(node.tags, node.cityName || sourcePlaceName);
    if (!googleData) {
      if (photoSource === 'generic' || photoSource === 'pexels') {
        const revGeo = await reverseGeocode(node.lat, node.lon);
        if (revGeo) {
          address = revGeo;
        }
      }
    }

    const enrichedPlace = {
      id: placeId,
      name: node.tags.name,
      category,
      lat: node.lat,
      lng: node.lon,
      address,
      rating,
      userRatingsTotal,
      priceLevel,
      photoUrl,
      photoSource,
      photoIsGeneric: photoSource === 'generic' || photoSource === 'pexels',
      matchDistance,
      nameSimilarity,
      classification,
      isHidden,
      sourcePlace: node.cityName || sourcePlaceName
    };

    saveEnrichedPlace(enrichedPlace);
    return enrichedPlace;
  });

  const spots = await Promise.all(spotsPromises);

  // Surface dev-only console summary logs
  const googleCount = spots.filter(s => s.photoSource === 'google').length;
  const wikiCount = spots.filter(s => s.photoSource === 'wikidata').length;
  const fsqCount = spots.filter(s => s.photoSource === 'foursquare').length;
  const mapillaryCount = spots.filter(s => s.photoSource === 'mapillary').length;
  const genericCount = spots.filter(s => s.photoSource === 'generic').length;
  console.warn(`[AtlasIQ Enrichment Summary] Page ${page}: ${googleCount} Google Places, ${wikiCount} Wikidata, ${fsqCount} Foursquare, ${mapillaryCount} Mapillary, ${genericCount} Generic fallbacks`);

  return {
    spots,
    hasMore: endIndex < rawNodes.length,
    location,
    debugInfo: {
      ...debugInfo,
      googleCount,
      wikiCount,
      fsqCount,
      mapillaryCount,
      genericCount
    }
  };
};
