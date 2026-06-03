import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/shared/ui';

// Barangay data with detailed info
type BarangayData = {
  image: string;
  description: string;
  touristAttractions: string[];
  population: string;
  area: string;
  festivals: string[];
};

const barangayData: Record<string, BarangayData> = {
  'Aslong': {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    description: 'Known for its breathtaking rice terraces that offer stunning panoramic views, especially during harvest season.',
    touristAttractions: ['Aslong Rice Terraces', 'Mountain View Deck', 'Organic Farm Tours'],
    population: '2,450',
    area: '12.5 sq km',
    festivals: ['Harvest Festival', 'Anihan']
  },
  'Awayan': {
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef281b399?w=800&h=600&fit=crop',
    description: 'Home to pristine river views and lush greenery, perfect for nature lovers and adventure seekers.',
    touristAttractions: ['Awayan River', 'Waterfall Adventure', 'Camping Grounds'],
    population: '1,890',
    area: '8.3 sq km',
    festivals: ['River Festival', 'Balsa Racing']
  },
  'Bagacay': {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
    description: 'Famous for its natural springs with crystal-clear water believed to have healing properties.',
    touristAttractions: ['Bagacay Natural Springs', 'Picnic Groves', 'Hiking Trails'],
    population: '3,120',
    area: '15.2 sq km',
    festivals: ['Spring Festival', 'Wellness Day']
  },
  'Poblacion': {
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
    description: 'The heart of Libmanan, featuring historic landmarks, bustling markets, and vibrant community life.',
    touristAttractions: ['Town Plaza', 'Historic Church', 'Public Market'],
    population: '8,750',
    area: '5.8 sq km',
    festivals: ['Town Fiesta', 'Christmas Parade']
  },
  'Palong': {
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
    description: 'Coastal barangay with beautiful beaches, fresh seafood, and a rich fishing culture.',
    touristAttractions: ['Palong Beach', 'Fish Port', 'Seafood Restaurants'],
    population: '4,230',
    area: '10.1 sq km',
    festivals: ['Fishermen Festival', 'Sea Day']
  }
};

const defaultBarangayData: BarangayData = {
  image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
  description: 'A wonderful barangay with friendly people and beautiful scenery.',
  touristAttractions: ['Local Attractions', 'Community Spots'],
  population: '1,000',
  area: '5.0 sq km',
  festivals: ['Community Festival']
};

// GeoJSON types
type Coordinate = [number, number];
type Polygon = Coordinate[][];
type MultiPolygon = Polygon[];
type Geometry = { type: 'Polygon'; coordinates: Polygon } | { type: 'MultiPolygon'; coordinates: MultiPolygon };
type Feature = {
  type: 'Feature';
  geometry: Geometry;
  properties: {
    adm4_en: string;
    [key: string]: any;
  };
  id?: any;
};
type FeatureCollection = {
  type: 'FeatureCollection';
  features: Feature[];
};

export function BarangayMapSection({ isLoading = false }: { isLoading?: boolean }) {
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [hoveredBarangay, setHoveredBarangay] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [autoHoveredBarangay, setAutoHoveredBarangay] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserInteractingRef = useRef(false);
  const autoHoverIntervalRef = useRef<number | null>(null);
  const svgWidth = 800;
  const svgHeight = 450;

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipWidth = 192; // w-48 is 192px
      const tooltipHeight = 160;
      
      let x = e.clientX - rect.left - tooltipWidth / 2;
      let y = e.clientY - rect.top - tooltipHeight - 20;
      
      // Prevent tooltip from going off left/right edges
      if (x < 10) x = 10;
      if (x + tooltipWidth > rect.width - 10) {
        x = rect.width - tooltipWidth - 10;
      }
      
      // Prevent tooltip from going off top edge
      if (y < 10) {
        y = e.clientY - rect.top + 20;
      }
      
      setCursorPosition({ x, y });
    }
  };

  // Load GeoJSON
  useEffect(() => {
    fetch('/geojson/bgysubmuns-municity-501718000.0.01.json')
      .then(res => res.json())
      .then(data => setGeoJson(data))
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Auto-hover effect - randomly cycle through barangays when not interacting
  useEffect(() => {
    if (!geoJson || selectedBarangay) return;

    const barangayNames = geoJson.features.map(f => f.properties.adm4_en);
    
    const startAutoHover = () => {
      if (barangayNames.length === 0) return;
      
      let currentIndex = -1;
      
      autoHoverIntervalRef.current = setInterval(() => {
        if (isUserInteractingRef.current) return;
        
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * barangayNames.length);
        } while (nextIndex === currentIndex && barangayNames.length > 1);
        
        currentIndex = nextIndex;
        setAutoHoveredBarangay(barangayNames[currentIndex]);
      }, 3000); // Change every 3 seconds
    };

    startAutoHover();

    return () => {
      if (autoHoverIntervalRef.current) {
        clearInterval(autoHoverIntervalRef.current);
      }
    };
  }, [geoJson, selectedBarangay]);

  // Calculate bounds of all features
  const getBounds = (features: Feature[]) => {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    features.forEach(feature => {
      const processPolygon = (polygon: Polygon) => {
        polygon[0].forEach(([lng, lat]) => {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      };

      if (feature.geometry.type === 'Polygon') {
        processPolygon(feature.geometry.coordinates);
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(processPolygon);
      }
    });
    
    return { minLng, maxLng, minLat, maxLat };
  };

  // Convert GeoJSON coordinates to SVG coordinates with given bounds
  const convertCoords = (coords: Coordinate, bounds: ReturnType<typeof getBounds>, width: number, height: number, padding: number = 20) => {
    const lngRange = bounds.maxLng - bounds.minLng;
    const latRange = bounds.maxLat - bounds.minLat;
    
    const scaleX = (width - padding * 2) / lngRange;
    const scaleY = (height - padding * 2) / latRange;
    const scale = Math.min(scaleX, scaleY);
    
    const xOffset = padding + (width - padding * 2 - lngRange * scale) / 2;
    const yOffset = padding + (height - padding * 2 - latRange * scale) / 2;
    
    const x = (coords[0] - bounds.minLng) * scale + xOffset;
    const y = height - ((coords[1] - bounds.minLat) * scale + yOffset);
    
    return [x, y];
  };

  // Generate path string for a polygon
  const getPathString = (geometry: Geometry, bounds: ReturnType<typeof getBounds>, width: number, height: number) => {
    let path = '';
    
    const processPolygon = (polygon: Polygon) => {
      polygon.forEach((ring, ringIndex) => {
        const points = ring.map(coord => convertCoords(coord, bounds, width, height));
        if (points.length > 0) {
          path += (ringIndex === 0 ? 'M' : 'M') + points.map(p => `${p[0]},${p[1]}`).join(' L') + ' Z ';
        }
      });
    };

    if (geometry.type === 'Polygon') {
      processPolygon(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach(processPolygon);
    }
    
    return path;
  };

  // Get bounds of the current selection (all features)
  const bounds = useMemo(() => {
    if (!geoJson) return { minLng: 0, maxLng: 0, minLat: 0, maxLat: 0 };
    return getBounds(geoJson.features);
  }, [geoJson]);

  // Get barangay data
  const getBarangayData = (name: string) => barangayData[name] || defaultBarangayData;
  const hoveredData = hoveredBarangay ? getBarangayData(hoveredBarangay) : null;
  const autoHoveredData = autoHoveredBarangay ? getBarangayData(autoHoveredBarangay) : null;
  const selectedData = selectedBarangay ? getBarangayData(selectedBarangay) : null;

  // Find the selected feature
  const selectedFeature = useMemo(() => {
    if (!geoJson || !selectedBarangay) return null;
    return geoJson.features.find(f => f.properties.adm4_en === selectedBarangay);
  }, [geoJson, selectedBarangay]);

  // Calculate bounds for a single feature
  const getFeatureBounds = (feature: Feature) => {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    const processPolygon = (polygon: Polygon) => {
      polygon[0].forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    };

    if (feature.geometry.type === 'Polygon') {
      processPolygon(feature.geometry.coordinates);
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach(processPolygon);
    }
    
    return { minLng, maxLng, minLat, maxLat };
  };

  const selectedBounds = useMemo(() => {
    if (!selectedFeature) return { minLng: 0, maxLng: 0, minLat: 0, maxLat: 0 };
    return getFeatureBounds(selectedFeature);
  }, [selectedFeature]);

  // Larger SVG size for modal
  const modalSvgWidth = 800;
  const modalSvgHeight = 600;

  return (
    <section className="bg-white py-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-5 w-80" />
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Explore Libmanan's Barangays</h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Hover over a barangay to see its image, click for details
                </p>
              </>
            )}
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={containerRef}
              className="rounded-2xl border border-neutral-200 bg-white shadow-sm h-[500px] sm:h-[600px]"
              onMouseMove={handleMouseMove}
            >
              <div className="h-full overflow-x-auto overflow-y-hidden">
                {geoJson ? (
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-auto min-w-[800px] sm:w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Definitions for patterns */}
                    <defs>
                      {geoJson.features.map((feature) => (
                        <pattern
                          key={`pattern-${feature.properties.adm4_en}`}
                          id={`img-${feature.properties.adm4_en}`}
                          patternContentUnits="objectBoundingBox"
                          width="1"
                          height="1"
                        >
                          <image
                            href={getBarangayData(feature.properties.adm4_en).image}
                            preserveAspectRatio="xMidYMid slice"
                            width="1"
                            height="1"
                          />
                        </pattern>
                      ))}
                    </defs>

                    {geoJson.features.map((feature, index) => {
                      const isUserHovered = hoveredBarangay === feature.properties.adm4_en;
                      const isAutoHovered = autoHoveredBarangay === feature.properties.adm4_en;
                      const isSelected = selectedBarangay === feature.properties.adm4_en;
                      const barangayName = feature.properties.adm4_en;
                      const isHovered = isUserHovered || (!isUserInteractingRef.current && isAutoHovered && !selectedBarangay);
                      
                      return (
                        <path
                      key={index}
                      d={getPathString(feature.geometry, bounds, svgWidth, svgHeight)}
                      fill={isSelected ? `url(#img-${barangayName})` : (isHovered ? `url(#img-${barangayName})` : '#93c5fd')}
                      fillOpacity={isSelected ? 1 : (isHovered ? 1 : 0.4)}
                      stroke={isSelected ? '#374151' : '#1e40af'}
                      strokeWidth={isSelected ? 3 : 1}
                      onMouseEnter={() => {
                        isUserInteractingRef.current = true;
                        setAutoHoveredBarangay(null);
                        setHoveredBarangay(barangayName);
                      }}
                      onMouseLeave={() => {
                        isUserInteractingRef.current = false;
                        setHoveredBarangay(null);
                      }}
                      onTouchStart={() => {
                        isUserInteractingRef.current = true;
                        setAutoHoveredBarangay(null);
                        setHoveredBarangay(barangayName);
                      }}
                      onClick={() => setSelectedBarangay(barangayName)}
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    />
                      );
                    })}
                  </svg>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="mt-3 text-sm font-medium text-neutral-600">Loading map...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Tooltip - Outside overflow-hidden container */}
            {(hoveredBarangay && hoveredData && !selectedBarangay) || (autoHoveredBarangay && autoHoveredData && !selectedBarangay && !hoveredBarangay) ? (
              <div 
                className="absolute z-[9999] bg-white rounded-xl shadow-lg border border-neutral-200 p-3 pointer-events-none"
                style={{
                  left: hoveredBarangay ? cursorPosition.x : 32,
                  top: hoveredBarangay ? cursorPosition.y : 32
                }}
              >
                <div className="space-y-2 w-48">
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={hoveredBarangay ? hoveredData!.image : autoHoveredData!.image}
                      alt={hoveredBarangay || autoHoveredBarangay!}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">{hoveredBarangay || autoHoveredBarangay}</h3>
                  <p className="text-xs text-neutral-500">{hoveredBarangay ? hoveredData!.description : autoHoveredData!.description}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Selected barangay overlay */}
      {selectedBarangay && selectedData && selectedFeature && (
        <div className="fixed inset-0 z-[9999]">
          {/* Dim overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedBarangay(null)}
          />
          
          {/* Left side: Polygon only - 70% width (desktop only) */}
          <div className="absolute left-0 top-0 w-[70%] h-full hidden items-center justify-center p-8 lg:flex">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-3xl flex items-center justify-center"
            >
              <svg
                viewBox={`0 0 ${modalSvgWidth} ${modalSvgHeight}`}
                className="w-full h-auto max-h-[80vh]"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <pattern
                    id={`selected-img-${selectedBarangay}`}
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                  >
                    <image
                      href={selectedData.image}
                      preserveAspectRatio="xMidYMid slice"
                      width="1"
                      height="1"
                    />
                  </pattern>
                </defs>
                <path
                  d={getPathString(selectedFeature.geometry, selectedBounds, modalSvgWidth, modalSvgHeight)}
                  fill={`url(#selected-img-${selectedBarangay})`}
                  fillOpacity={1}
                  stroke="#374151"
                  strokeWidth={4}
                />
              </svg>
            </motion.div>
          </div>
          
          {/* Right side: Info panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full lg:w-[30%] bg-white shadow-2xl overflow-y-auto"
          >
            <button 
              className="absolute top-4 right-4 z-10 p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
              onClick={() => setSelectedBarangay(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-0 lg:p-5">
              {/* Image at top (mobile/tablet only) */}
              <div className="relative lg:hidden">
                <img 
                  src={selectedData.image} 
                  alt={selectedBarangay} 
                  className="w-full h-64 object-cover"
                />
                {/* Overlay for better readability of close button */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
              </div>
              
              <div className="p-5 lg:p-0">
                {/* Barangay name */}
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">{selectedBarangay}</h1>
                
                {/* Description */}
                <p className="text-sm text-neutral-600 mb-4">{selectedData.description}</p>
                
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                      <svg className="text-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-neutral-900">{selectedData.population}</div>
                      <div className="mt-0.5 text-[10px] text-neutral-500">Population</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                      <svg className="text-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-neutral-900">{selectedData.area}</div>
                      <div className="mt-0.5 text-[10px] text-neutral-500">Area</div>
                    </div>
                  </div>
                </div>
                
                {/* Tourist Attractions */}
                <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    Tourist Attractions
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedData.touristAttractions.map((attraction, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                        {attraction}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Festivals */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Festivals
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedData.festivals.map((festival, index) => (
                      <span key={index} className="px-3 py-1.5 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium">
                        {festival}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}

BarangayMapSection.displayName = 'BarangayMapSection';

export default BarangayMapSection;
