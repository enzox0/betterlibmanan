import { FaCloud, FaTint, FaWind } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton, SkeletonCard } from "@/shared/ui";

// Module-level singleton loader: ensures the Google Maps JS API script is
// only injected once per page, regardless of how many components mount it
// or how many times React Strict Mode double-invokes effects in dev.
type GoogleNamespace = NonNullable<typeof window.google>;
let googleMapsLoader: Promise<GoogleNamespace> | null = null;

function loadGoogleMaps(apiKey: string): Promise<GoogleNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps requires a browser"));
  }
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }
  if (googleMapsLoader) {
    return googleMapsLoader;
  }

  googleMapsLoader = new Promise<GoogleNamespace>((resolve, reject) => {
    const handleReady = async () => {
      if (!window.google?.maps) {
        reject(new Error("Google Maps loaded without google global"));
        return;
      }
      try {
        // With `loading=async`, the core library is fetched lazily by the
        // bootstrap loader. We must wait on importLibrary before the Map
        // and Data constructors are actually available.
        if (typeof window.google.maps.importLibrary === "function") {
          await window.google.maps.importLibrary("maps");
        }
        resolve(window.google);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    // If a script tag was already added (e.g. by HMR), reuse it.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="true"]',
    );
    if (existing) {
      existing.addEventListener("load", handleReady);
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps")),
      );
      return;
    }

    const script = document.createElement("script");
    // `loading=async` is Google's recommended pattern and silences the
    // "loaded directly without loading=async" performance warning.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = handleReady;
    script.onerror = () => {
      googleMapsLoader = null; // allow retry on next mount
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoader;
}

export function WeatherMapSection({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [geoJson, setGeoJson] = useState<any>(null);

  useEffect(() => {
    // Load GeoJSON for barangay boundaries
    fetch("/geojson/bgysubmuns-municity-501718000.0.01.json")
      .then((res) => res.json())
      .then((data) => setGeoJson(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") return;

    // Coordinates for Libmanan, Camarines Sur
    const libmananCoords = { lat: 13.6969, lng: 123.1849 };
    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: libmananCoords,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        if (geoJson) {
          const dataLayer = new google.maps.Data({ map });
          dataLayer.addGeoJson(geoJson);
          dataLayer.setStyle({
            fillColor: "#93c5fd",
            fillOpacity: 0.4,
            strokeColor: "#1e40af",
            strokeWeight: 1,
          });
        }
      })
      .catch((err) => console.error("Google Maps init failed:", err));

    return () => {
      cancelled = true;
    };
  }, [geoJson]);

  return (
    <section className="bg-neutral-100 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
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
                <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
                  Weather and Map of Libmanan
                </h2>
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
                        <FaCloud size={20} />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-neutral-900">
                          26°C
                        </div>
                        <div className="mt-1 text-base text-neutral-800">
                          Partly Cloudy
                        </div>
                        <div className="mt-1 text-sm text-neutral-500">
                          Libmanan, Camarines Sur
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-y border-neutral-200 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                          <FaTint size={14} />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-neutral-900">
                            78%
                          </div>
                          <div className="text-xs text-neutral-500">
                            Humidity
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                          <FaWind size={14} />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-neutral-900">
                            12 km/h
                          </div>
                          <div className="text-xs text-neutral-500">
                            Wind Speed
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-neutral-100 p-4 text-center">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">
                        Current
                      </div>
                      <FaCloud
                        size={16}
                        className="mx-auto mt-3 text-neutral-700"
                      />
                      <div className="mt-3 text-base font-semibold text-neutral-900">
                        26°
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="relative h-80" ref={mapRef}>
                    {(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
                      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ===
                        "your_api_key_here") && (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                        <div className="text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <p className="mt-3 text-sm font-medium text-neutral-600">
                            Add Google Maps API key to view map
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Check .env file for setup
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-neutral-200 px-5 py-4">
                    <h3 className="text-sm font-semibold text-neutral-900">
                      Location
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Libmanan Municipal Hall, Camarines Sur 4418
                    </p>
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

WeatherMapSection.displayName = "WeatherMapSection";

export default WeatherMapSection;
