import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton, SkeletonCard } from '../../../shared/ui';

// Sample tourist data for barangays (you can expand this)
const barangayTouristData: Record<string, { image: string; description: string }> = {
  'Aslong': {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Known for its beautiful rice terraces and peaceful countryside views.'
  },
  'Awayan': {
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef281b399?w=400&h=300&fit=crop',
    description: 'Home to scenic river views and local fishing spots.'
  },
  'Bagacay': {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    description: 'Features lush green landscapes and natural springs.'
  },
  'Poblacion': {
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    description: 'The town center with historic buildings and local markets.'
  },
  'Palong': {
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop',
    description: 'Famous for its coastal areas and beach resorts.'
  }
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
  const svgRef = useRef<SVGSVGElement>(null);

  // Load GeoJSON
  useEffect(() => {
    fetch('/geojson/bgysubmuns-municity-501718000.0.01.json')
      .then(res => res.json())
      .then(data => setGeoJson(data))
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Function to get bounds of all features
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

  // Convert GeoJSON coordinates to SVG coordinates
  const convertCoords = (coords: Coordinate, bounds: ReturnType<typeof getBounds>, width: number, height: number, padding: number = 20) => {
    const lngRange = bounds.maxLng - bounds.minLng;
    const latRange = bounds.maxLat - bounds.minLat;
    
    // Calculate scale factors
    const scaleX = (width - padding * 2) / lngRange;
    const scaleY = (height - padding * 2) / latRange;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate offset to center the map
    const xOffset = padding + (width - padding * 2 - lngRange * scale) / 2;
    const yOffset = padding + (height - padding * 2 - latRange * scale) / 2;
    
    const x = (coords[0] - bounds.minLng) * scale + xOffset;
    const y = height - ((coords[1] - bounds.minLat) * scale + yOffset); // Flip y-axis (SVG has y=0 at top)
    
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

  const touristInfo = hoveredBarangay ? barangayTouristData[hoveredBarangay] : null;
  const svgWidth = 800;
  const svgHeight = 450;

  return (
    <section className="bg-white h-[80vh] py-10 mb-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="h-full"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-auto flex flex-col">
          <div className="mb-3">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-72 mb-1" />
                <Skeleton className="h-4 w-80" />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-neutral-900 lg:text-2xl">Explore Libmanan's Barangays</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Discover the unique charm and tourist spots of each barangay in our municipality
                </p>
              </>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] flex-1">
            {isLoading ? (
              <>
                <SkeletonCard className="overflow-hidden p-0 h-full">
                  <Skeleton className="h-full w-full" />
                </SkeletonCard>
                <SkeletonCard className="overflow-hidden p-0">
                  <div className="p-6 space-y-6">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </SkeletonCard>
              </>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col">
                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                    {geoJson ? (
                      <svg
                        ref={svgRef}
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-full"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {geoJson.features.map((feature, index) => {
                          const bounds = getBounds(geoJson.features);
                          const isHovered = hoveredBarangay === feature.properties.adm4_en;
                          
                          return (
                            <path
                              key={index}
                              d={getPathString(feature.geometry, bounds, svgWidth, svgHeight)}
                              fill={isHovered ? '#3b82f6' : '#93c5fd'}
                              fillOpacity={isHovered ? 0.7 : 0.4}
                              stroke="#1e40af"
                              strokeWidth="1"
                              onMouseEnter={() => setHoveredBarangay(feature.properties.adm4_en)}
                              onMouseLeave={() => setHoveredBarangay(null)}
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
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

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col">
                  <div className="p-3 overflow-y-auto">
                    {hoveredBarangay ? (
                      <div className="space-y-2">
                        <div className="overflow-hidden rounded-xl">
                          <img
                            src={touristInfo?.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop'}
                            alt={hoveredBarangay}
                            className="h-20 w-full object-cover"
                          />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900">{hoveredBarangay}</h3>
                        <p className="text-xs text-neutral-500">
                          {touristInfo?.description || 'A wonderful barangay in Libmanan waiting to be explored.'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                        <p className="mt-2 text-xs font-medium text-neutral-600">Hover over a barangay</p>
                        <p className="mt-1 text-[10px] text-neutral-500">to see its tourist attractions</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

BarangayMapSection.displayName = 'BarangayMapSection';

export default BarangayMapSection;
