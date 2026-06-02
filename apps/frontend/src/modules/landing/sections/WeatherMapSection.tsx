import { FaCloud, FaTint, FaWind } from 'react-icons/fa';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Skeleton, SkeletonCard } from '../../../shared/ui';

export function WeatherMapSection({ isLoading = false }: { isLoading?: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Coordinates for Libmanan, Camarines Sur
    const libmananCoords = { lat: 13.6969, lng: 123.1849 };
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return;
    }

    // Load Google Maps API script if not already loaded
    if (!window.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap(libmananCoords);
      document.head.appendChild(script);
    } else {
      initMap(libmananCoords);
    }

    function initMap(coords: { lat: number; lng: number }) {
      if (mapRef.current && window.google?.maps) {
        new window.google.maps.Map(mapRef.current, {
          center: coords,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });
      }
    }
  }, []);

  return (
    <section className="bg-white py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-5 w-80" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Weather and Map of Libmanan</h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Stay updated on current conditions in our municipality
                </p>
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            {isLoading ? (
              <>
                <SkeletonCard className="overflow-hidden p-0">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-y border-neutral-200 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-32 rounded-xl" />
                  </div>
                </SkeletonCard>
                <SkeletonCard className="overflow-hidden p-0">
                  <Skeleton className="h-80 w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </SkeletonCard>
              </>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="p-6">
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                        <FaCloud className="text-lg" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-neutral-900">26°C</div>
                        <div className="mt-1 text-base text-neutral-800">Partly Cloudy</div>
                        <div className="mt-1 text-sm text-neutral-500">Libmanan, Camarines Sur</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-y border-neutral-200 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                          <FaTint className="text-sm" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-neutral-900">78%</div>
                          <div className="text-xs text-neutral-500">Humidity</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                          <FaWind className="text-sm" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-neutral-900">12 km/h</div>
                          <div className="text-xs text-neutral-500">Wind Speed</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-neutral-100 p-4 text-center">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Current</div>
                      <FaCloud className="mx-auto mt-3 text-base text-neutral-700" />
                      <div className="mt-3 text-base font-semibold text-neutral-900">26°</div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="relative h-80" ref={mapRef}>
                    {(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'your_api_key_here') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                        <div className="text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <p className="mt-3 text-sm font-medium text-neutral-600">Add Google Maps API key to view map</p>
                          <p className="mt-1 text-xs text-neutral-500">Check .env file for setup</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-neutral-200 px-5 py-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Location</h3>
                    <p className="mt-1 text-sm text-neutral-500">Libmanan Municipal Hall, Camarines Sur 4418</p>
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

WeatherMapSection.displayName = 'WeatherMapSection';

export default WeatherMapSection;
