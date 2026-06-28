import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuCloud,
  LuCloudRain,
  LuSun,
  LuCloudSnow,
  LuCloudLightning,
  LuWind,
  LuDroplets,
  LuThermometer,
  LuMapPin,
  LuEye,
  LuX,
  LuUsers,
  LuGlobe,
  LuCamera,
  LuCalendar,
} from "react-icons/lu";
import { Skeleton, SkeletonCard } from "@/shared/ui";
import { useBarangayMapStore } from "@/modules/admin/store/barangayMapStore";

// ─── Google Maps loader (singleton promise, safe for StrictMode) ──────────────
type GMInfoWindow = {
  setContent(content: string): void;
  setPosition(
    pos: google.maps.LatLng | google.maps.LatLngLiteral | undefined,
  ): void;
  open(map: google.maps.Map): void;
  close(): void;
};

type MapsLibrary = {
  Map: new (
    mapDiv: HTMLElement,
    opts?: google.maps.MapOptions,
  ) => google.maps.Map;
  Data: new (opts?: { map?: google.maps.Map }) => google.maps.Data;
  // InfoWindow is accessed via window.google.maps at runtime; typed manually above
  newInfoWindow: () => GMInfoWindow;
};
let _mapsLoader: Promise<MapsLibrary> | null = null;

function waitForGoogleMaps(timeout = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      if (
        window.google?.maps?.Map &&
        window.google?.maps?.Data &&
        (window.google?.maps as any)?.InfoWindow
      ) {
        resolve(window.google.maps);
        return;
      }

      if (Date.now() - start > timeout) {
        reject(new Error("Timed out waiting for Google Maps."));
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });
}

function loadGoogleMaps(apiKey: string): Promise<MapsLibrary> {
  if (_mapsLoader) return _mapsLoader;

  _mapsLoader = new Promise<MapsLibrary>((resolve, reject) => {
    // Already loaded
    if (
      window.google?.maps?.Map &&
      window.google?.maps?.Data &&
      (window.google?.maps as any)?.InfoWindow
    ) {
      resolve({
        Map: window.google.maps.Map as MapsLibrary["Map"],
        Data: window.google.maps.Data as MapsLibrary["Data"],
        newInfoWindow: () =>
          new (window.google!.maps as any).InfoWindow() as GMInfoWindow,
      });
      return;
    }

    // Prevent duplicate script tags
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-google-maps-loader]",
    );

    if (!script) {
      script = document.createElement("script");

      script.src =
        `https://maps.googleapis.com/maps/api/js` +
        `?key=${encodeURIComponent(apiKey)}` +
        `&v=weekly` +
        `&loading=async`;

      script.async = true;
      script.defer = true;
      script.dataset.googleMapsLoader = "true";

      document.head.appendChild(script);
    }

    script.onload = async () => {
      try {
        const maps = await waitForGoogleMaps();

        resolve({
          Map: maps.Map as MapsLibrary["Map"],
          Data: maps.Data as MapsLibrary["Data"],
          newInfoWindow: () => new (maps as any).InfoWindow() as GMInfoWindow,
        });
      } catch (err) {
        _mapsLoader = null;
        reject(err);
      }
    };

    script.onerror = () => {
      _mapsLoader = null;
      reject(new Error("Failed to load Google Maps script"));
    };
  });

  return _mapsLoader;
}

// ─── Weather types ────────────────────────────────────────────────────────────
type WeatherData = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  visibility: number;
};

// ─── Open-Meteo WMO code → label + icon ──────────────────────────────────────
function interpretWeatherCode(code: number): {
  label: string;
  icon: React.ElementType;
} {
  if (code === 0) return { label: "Clear Sky", icon: LuSun };
  if (code <= 2) return { label: "Partly Cloudy", icon: LuCloud };
  if (code === 3) return { label: "Overcast", icon: LuCloud };
  if (code <= 49) return { label: "Foggy", icon: LuCloud };
  if (code <= 57) return { label: "Drizzle", icon: LuCloudRain };
  if (code <= 67) return { label: "Rain", icon: LuCloudRain };
  if (code <= 77) return { label: "Snow", icon: LuCloudSnow };
  if (code <= 82) return { label: "Rain Showers", icon: LuCloudRain };
  if (code <= 86) return { label: "Snow Showers", icon: LuCloudSnow };
  if (code <= 99) return { label: "Thunderstorm", icon: LuCloudLightning };
  return { label: "Unknown", icon: LuCloud };
}

function windDirectionLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeBarangayKey(name: string): string {
  return name.trim().toLowerCase();
}

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LIBMANAN_LAT = 13.665983;
const LIBMANAN_LNG = 122.988297;

// Municipal Hall pin — this is the map center and marker location
const MUNICIPAL_LAT = 13.6943612;
const MUNICIPAL_LNG = 123.0595744;

const DEFAULT_BARANGAY = {
  image: "/betterlibmanan.png",
  description: "This barangay does not have published details yet.",
  touristAttractions: ["Details coming soon"],
  population: "N/A",
  area: "N/A",
  festivals: ["To be announced"],
};

// ─── Suppress Google Maps InfoWindow chrome (close button + scrollbar) ────────
// Injected once when the map loads. Targets the stable GM class names.
const INFO_WINDOW_STYLE_ID = "gm-iw-no-chrome";
function injectInfoWindowStyles() {
  if (document.getElementById(INFO_WINDOW_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = INFO_WINDOW_STYLE_ID;
  style.textContent = `
    /* hide the × close button */
    .gm-style-iw-chr { display: none !important; }
    /* remove the scrollbar from the content wrapper */
    .gm-style-iw-d   { overflow: hidden !important; }
    /* tighten padding so the bubble is compact */
    .gm-style-iw-c   { padding: 0 !important; }
  `;
  document.head.appendChild(style);
}

// ─── Barangay panel data type ─────────────────────────────────────────────────
type BarangayPanelData = {
  name: string;
  image: string;
  description: string;
  touristAttractions: string[];
  population: string;
  area: string;
  festivals: string[];
};

// ─── Main component ───────────────────────────────────────────────────────────
export function WeatherMapSection({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const dataLayerRef = useRef<google.maps.Data | null>(null);
  const hoverInfoRef = useRef<GMInfoWindow | null>(null);
  const markerDivRef = useRef<HTMLDivElement | null>(null);

  const [sectionVisible, setSectionVisible] = useState(false);
  const [mapsLib, setMapsLib] = useState<MapsLibrary | null>(null);
  const [mapError, setMapError] = useState(false);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  // Municipal Hall modal state
  const [municipalModalOpen, setMunicipalModalOpen] = useState(false);

  // Selected barangay panel state
  const [selectedBarangay, setSelectedBarangay] =
    useState<BarangayPanelData | null>(null);

  // Barangay records from store
  const publicRecords = useBarangayMapStore((s) => s.publicRecords);
  const fetchPublicRecords = useBarangayMapStore((s) => s.fetchPublicRecords);

  useEffect(() => {
    fetchPublicRecords().catch(() => {});
  }, [fetchPublicRecords]);

  // Build a lookup map: normalized name → panel data
  const barangayLookup = useRef<Map<string, BarangayPanelData>>(new Map());
  useEffect(() => {
    const map = new Map<string, BarangayPanelData>();
    for (const record of publicRecords) {
      const name = record.fields.name ?? record.title;
      const touristAttractions = parseList(record.fields.touristAttractions);
      const festivals = parseList(record.fields.festivals);
      map.set(normalizeBarangayKey(name), {
        name,
        image: record.fields.image || DEFAULT_BARANGAY.image,
        description: record.fields.description || DEFAULT_BARANGAY.description,
        touristAttractions: touristAttractions.length
          ? touristAttractions
          : DEFAULT_BARANGAY.touristAttractions,
        population: record.fields.population || DEFAULT_BARANGAY.population,
        area: record.fields.area || DEFAULT_BARANGAY.area,
        festivals: festivals.length ? festivals : DEFAULT_BARANGAY.festivals,
      });
    }
    barangayLookup.current = map;
  }, [publicRecords]);

  function getBarangayPanelData(featureName: string): BarangayPanelData {
    return (
      barangayLookup.current.get(normalizeBarangayKey(featureName)) ?? {
        ...DEFAULT_BARANGAY,
        name: featureName,
      }
    );
  }

  // ── Viewport: watch section enter ─────────────────────────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Load Google Maps SDK once section is visible ──────────────────────────
  useEffect(() => {
    if (!sectionVisible) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
      | string
      | undefined;
    if (!apiKey) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((lib) => {
        if (!cancelled) setMapsLib(lib);
      })
      .catch((err) => {
        console.error("Google Maps init failed:", err);
        if (!cancelled) setMapError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sectionVisible]);

  // ── Initialise map once library is ready ──────────────────────────────────
  useEffect(() => {
    if (!mapsLib || !mapRef.current || mapInstanceRef.current) return;
    injectInfoWindowStyles();

    const map = new mapsLib.Map(mapRef.current, {
      center: { lat: MUNICIPAL_LAT, lng: MUNICIPAL_LNG },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    mapInstanceRef.current = map;

    // ── Custom Municipal Hall marker via OverlayView ────────────────────────
    const gmaps = window.google!.maps as any;

    const overlayProto = Object.create(gmaps.OverlayView.prototype);

    const markerDiv = document.createElement("div");
    markerDiv.style.cssText = "position:absolute;cursor:pointer;";
    markerDiv.innerHTML = `
      <div style="
        display:flex;flex-direction:column;align-items:center;
        filter:drop-shadow(0 4px 14px rgba(0,0,0,0.28));
      ">
        <div style="
          background:#fff;border-radius:12px;
          padding:6px 12px 6px 6px;
          display:flex;align-items:center;gap:8px;
          border:1.5px solid #e5e7eb;
          box-shadow:0 2px 10px rgba(0,0,0,0.12);
          white-space:nowrap;
        ">
          <div style="
            width:32px;height:32px;border-radius:8px;
            background:#111827;display:flex;align-items:center;
            justify-content:center;flex-shrink:0;
          ">
            <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24'
              fill='none' stroke='white' stroke-width='2.2'
              stroke-linecap='round' stroke-linejoin='round'>
              <path d='M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z'/>
              <circle cx='12' cy='10' r='3'/>
            </svg>
          </div>
          <div>
            <div style="font-family:system-ui,sans-serif;font-size:12px;font-weight:700;color:#111827;line-height:1.3;">
              Libmanan Municipal Hall
            </div>
            <div style="font-family:system-ui,sans-serif;font-size:10px;color:#6b7280;margin-top:1px;">
              Camarines Sur 4407
            </div>
          </div>
        </div>
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-top:8px solid #fff;
          margin-top:-1px;
        "></div>
        <div style="
          width:9px;height:9px;border-radius:50%;
          background:#111827;border:2px solid #fff;
          margin-top:-1px;
          box-shadow:0 1px 4px rgba(0,0,0,0.4);
        "></div>
      </div>
    `;

    // Click opens the Municipal Hall info panel/modal
    markerDiv.addEventListener("click", () => setMunicipalModalOpen(true));
    markerDivRef.current = markerDiv;

    overlayProto.onAdd = function () {
      // overlayMouseTarget is the topmost interactive pane — sits above the
      // data layer so the marker always receives pointer events first.
      this.getPanes().overlayMouseTarget.appendChild(markerDiv);
    };
    overlayProto.draw = function () {
      const proj = this.getProjection();
      if (!proj) return;
      const pos = proj.fromLatLngToDivPixel(
        new gmaps.LatLng(MUNICIPAL_LAT, MUNICIPAL_LNG),
      );
      if (!pos) return;
      const inner = markerDiv.firstElementChild as HTMLElement | null;
      const w = inner?.offsetWidth ?? 200;
      const h = inner?.offsetHeight ?? 60;
      markerDiv.style.left = `${pos.x - w / 2}px`;
      markerDiv.style.top = `${pos.y - h}px`;
    };
    overlayProto.onRemove = function () {
      markerDiv.parentNode?.removeChild(markerDiv);
    };

    // Construct via OverlayView and swap the prototype
    const municipalMarker = new gmaps.OverlayView();
    Object.setPrototypeOf(municipalMarker, overlayProto);
    municipalMarker.setMap(map);
  }, [mapsLib]);

  // ── GeoJSON barangay layer with hover tooltip + click panel ───────────────
  useEffect(() => {
    if (!mapsLib || !mapInstanceRef.current) return;

    // Clean up previous layer
    if (dataLayerRef.current) {
      dataLayerRef.current.setMap(null);
      dataLayerRef.current = null;
    }
    if (hoverInfoRef.current) {
      hoverInfoRef.current.close();
      hoverInfoRef.current = null;
    }

    const infoWindow = mapsLib.newInfoWindow();
    hoverInfoRef.current = infoWindow;

    // Detect pointer-capable (desktop) device — hover tooltip only shown there
    const isPointerDevice = () =>
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Returns true when the native mouse event is inside the Municipal Hall
    // marker div — used to suppress barangay hover/click on the pin area.
    const isOverMarker = (nativeEvent: MouseEvent): boolean => {
      const el = markerDivRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        nativeEvent.clientX >= rect.left &&
        nativeEvent.clientX <= rect.right &&
        nativeEvent.clientY >= rect.top &&
        nativeEvent.clientY <= rect.bottom
      );
    };

    fetch("/geojson/bgysubmuns-municity-501718000.0.01.json")
      .then((r) => r.json())
      .then((geoJson) => {
        if (!mapInstanceRef.current || !mapsLib) return;

        const layer = new mapsLib.Data({ map: mapInstanceRef.current });
        layer.addGeoJson(geoJson);
        layer.setStyle({
          fillColor: "#93c5fd",
          fillOpacity: 0.35,
          strokeColor: "#1e40af",
          strokeWeight: 1.2,
        });

        // ── Hover: name tooltip (desktop only) ──────────────────────────────
        layer.addListener("mouseover", (e: google.maps.DataMouseEvent) => {
          if (!isPointerDevice()) return;
          if (isOverMarker((e as any).domEvent)) return;
          const name: string = e.feature.getProperty("adm4_en") ?? "";
          layer.overrideStyle(e.feature, {
            fillColor: "#1e40af",
            fillOpacity: 0.6,
            strokeWeight: 2,
          });
          infoWindow.setContent(
            `<div style="font-family:system-ui,sans-serif;font-size:13px;font-weight:600;padding:2px 4px;color:#111">${name}</div>`,
          );
          infoWindow.setPosition((e as any).latLng ?? undefined);
          infoWindow.open(mapInstanceRef.current!);
        });

        layer.addListener("mouseout", (e: google.maps.DataMouseEvent) => {
          layer.revertStyle(e.feature);
          infoWindow.close();
        });

        // ── Click: open side panel ───────────────────────────────────────────
        layer.addListener("click", (e: google.maps.DataMouseEvent) => {
          if (isOverMarker((e as any).domEvent)) return;
          const name: string = e.feature.getProperty("adm4_en") ?? "";
          setSelectedBarangay(getBarangayPanelData(name));
        });

        dataLayerRef.current = layer;
      })
      .catch((err) => console.error("GeoJSON load error:", err));

    return () => {
      dataLayerRef.current?.setMap(null);
      dataLayerRef.current = null;
      hoverInfoRef.current?.close();
      hoverInfoRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsLib]);

  // ── When barangayLookup updates, refresh any open panel data ─────────────
  useEffect(() => {
    if (!selectedBarangay) return;
    setSelectedBarangay(getBarangayPanelData(selectedBarangay.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicRecords]);

  // ── Live weather fetch ────────────────────────────────────────────────────
  useEffect(() => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LIBMANAN_LAT}&longitude=${LIBMANAN_LNG}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
      `wind_speed_10m,wind_direction_10m,weather_code,visibility` +
      `&wind_speed_unit=kmh&timezone=Asia%2FManila`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        const c = d.current;
        setWeather({
          temperature: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          windDirection: c.wind_direction_10m,
          weatherCode: c.weather_code,
          visibility: Math.round((c.visibility ?? 10000) / 1000),
        });
        setWeatherLoading(false);
      })
      .catch(() => {
        setWeatherError(true);
        setWeatherLoading(false);
      });
  }, []);

  const weatherInfo = weather
    ? interpretWeatherCode(weather.weatherCode)
    : null;
  const WeatherIcon = weatherInfo?.icon ?? LuCloud;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const noApiKey = !apiKey;

  return (
    <section ref={sectionRef} className="bg-white py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-5 w-80" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
                  Weather &amp; Map of Libmanan
                </h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Live conditions and barangay map — Libmanan, Camarines Sur
                </p>
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* ── Weather card ──────────────────────────────────────────── */}
            {isLoading ? (
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
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-24 rounded-xl" />
                </div>
              </SkeletonCard>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="p-6">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      <WeatherIcon size={20} />
                    </div>
                    <div>
                      {weatherLoading ? (
                        <div className="space-y-1.5">
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      ) : weatherError ? (
                        <p className="text-sm text-neutral-500">
                          Weather data unavailable
                        </p>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-neutral-900">
                            {weather!.temperature}°C
                          </div>
                          <div className="mt-1 text-base text-neutral-800">
                            {weatherInfo!.label}
                          </div>
                          <div className="mt-1 text-sm text-neutral-500">
                            Feels like {weather!.feelsLike}°C · Libmanan
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-y border-neutral-200 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                        <LuDroplets size={14} />
                      </div>
                      <div>
                        <div className="text-base font-semibold text-neutral-900">
                          {weatherLoading ? "—" : `${weather!.humidity}%`}
                        </div>
                        <div className="text-xs text-neutral-500">Humidity</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                        <LuWind size={14} />
                      </div>
                      <div>
                        <div className="text-base font-semibold text-neutral-900">
                          {weatherLoading ? "—" : `${weather!.windSpeed} km/h`}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {weatherLoading
                            ? "Wind"
                            : `Wind ${windDirectionLabel(weather!.windDirection)}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                        <LuThermometer size={13} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">
                          {weatherLoading ? "—" : `${weather!.feelsLike}°C`}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Feels like
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                        <LuEye size={13} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">
                          {weatherLoading ? "—" : `${weather!.visibility} km`}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Visibility
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-[10px] text-neutral-400 text-right">
                    Weather via{" "}
                    <a
                      href="https://open-meteo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-neutral-600 transition-colors"
                    >
                      Open-Meteo
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* ── Map card ──────────────────────────────────────────────── */}
            {isLoading ? (
              <SkeletonCard className="overflow-hidden p-0">
                <Skeleton className="h-80 w-full" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </SkeletonCard>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {/* Map container */}
                <div className="relative h-80">
                  <div ref={mapRef} className="absolute inset-0" />

                  {/* Overlay while SDK loads or if no key */}
                  {(noApiKey || mapError || !mapsLib) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                      <div className="text-center px-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
                          <LuMapPin className="w-6 h-6" aria-hidden="true" />
                        </div>
                        {noApiKey ? (
                          <>
                            <p className="mt-3 text-sm font-medium text-neutral-600">
                              Add Google Maps API key to view map
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                              Set VITE_GOOGLE_MAPS_API_KEY in .env
                            </p>
                          </>
                        ) : mapError ? (
                          <p className="mt-3 text-sm font-medium text-neutral-600">
                            Failed to load Google Maps
                          </p>
                        ) : (
                          <p className="mt-3 text-sm font-medium text-neutral-600">
                            Loading map…
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-200 px-5 py-4">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Location
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Libmanan Municipal Hall, Camarines Sur 4407
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Municipal Hall inline panel (mobile / tablet only) ─────── */}
          <AnimatePresence>
            {municipalModalOpen && (
              <motion.div
                key="municipal-inline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:hidden"
              >
                <MunicipalHallContent
                  onClose={() => setMunicipalModalOpen(false)}
                  inline
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Barangay info panel — fixed overlay matching BarangayMapSection ── */}
          <AnimatePresence>
            {selectedBarangay && (
              <div className="fixed inset-0 z-[9999999]">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setSelectedBarangay(null)}
                />

                {/* Right panel — full viewport height, no left image */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl overflow-y-auto"
                >
                  <button
                    className="absolute top-4 right-4 z-10 p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                    onClick={() => setSelectedBarangay(null)}
                    aria-label="Close barangay panel"
                  >
                    <LuX className="w-6 h-6" aria-hidden="true" />
                  </button>

                  {/* Hero image — always shown at the top of the panel */}
                  <div className="relative h-56 shrink-0">
                    <img
                      src={selectedBarangay.image}
                      alt={selectedBarangay.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/betterlibmanan.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h1 className="absolute bottom-4 left-5 right-12 text-xl sm:text-2xl font-bold text-white leading-tight">
                      {selectedBarangay.name}
                    </h1>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-neutral-600 mb-4">
                      {selectedBarangay.description}
                    </p>

                    {/* Population + Area */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                          <LuUsers className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-neutral-900">
                            {selectedBarangay.population}
                          </div>
                          <div className="mt-0.5 text-[10px] text-neutral-500">
                            Population
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                          <LuGlobe className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-neutral-900">
                            {selectedBarangay.area}
                          </div>
                          <div className="mt-0.5 text-[10px] text-neutral-500">
                            Area
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tourist Attractions */}
                    <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
                      <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                          <LuCamera
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                        </div>
                        Tourist Attractions
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedBarangay.touristAttractions.map(
                          (attraction, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-sm text-neutral-700"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 shrink-0" />
                              {attraction}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    {/* Festivals */}
                    <div className="rounded-lg border border-neutral-200 bg-white p-4">
                      <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                          <LuCalendar
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                        </div>
                        Festivals
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBarangay.festivals.map((festival, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium"
                          >
                            {festival}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Municipal Hall modal (desktop only, lg+) ──────────────────────── */}
      <AnimatePresence>
        {municipalModalOpen && (
          <div className="fixed inset-0 z-[9999999] hidden lg:flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMunicipalModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="municipal-modal-title"
            >
              <MunicipalHallContent
                onClose={() => setMunicipalModalOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Municipal Hall info content (shared between modal + inline) ──────────────
const MUNICIPAL_IMAGES = [
  { src: "/betterlibmanan.png", alt: "Libmanan Municipal Hall front view" },
  { src: "/betterlibmanan.png", alt: "Libmanan Municipal Hall grounds" },
];

function MunicipalHallContent({
  onClose,
  inline = false,
}: {
  onClose: () => void;
  inline?: boolean;
}) {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div>
      {/* Hero image carousel */}
      <div className="relative h-56 bg-neutral-100 overflow-hidden">
        <img
          src={MUNICIPAL_IMAGES[activeImg].src}
          alt={MUNICIPAL_IMAGES[activeImg].alt}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/betterlibmanan.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Image switcher dots */}
        {MUNICIPAL_IMAGES.length > 1 && (
          <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5">
            {MUNICIPAL_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === activeImg ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        <h2
          id="municipal-modal-title"
          className="absolute bottom-4 left-5 right-12 text-xl font-bold text-white leading-tight"
        >
          Libmanan Municipal Hall
        </h2>

        <button
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <LuX className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <p className="text-sm text-neutral-600">
          The Libmanan Municipal Hall is the seat of local government for the
          Municipality of Libmanan in Camarines Sur, Philippines. It serves as
          the administrative center where residents can access government
          services, public records, and civic programs.
        </p>

        {/* Key facts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
              <LuMapPin className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">
                Address
              </div>
              <div className="mt-0.5 text-xs text-neutral-500 leading-snug">
                Libmanan, Camarines Sur 4407, Philippines
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
              <LuGlobe className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">
                Province
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                Camarines Sur
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
              <LuUsers className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">
                Barangays
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                76 barangays
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
              <LuCalendar className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">
                Founded
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">1919</div>
            </div>
          </div>
        </div>

        {/* Office hours */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-2">
            Office Hours
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-600">
            <span className="font-medium">Monday – Friday</span>
            <span>8:00 AM – 5:00 PM</span>
            <span className="font-medium">Saturday – Sunday</span>
            <span>Closed</span>
          </div>
        </div>

        {/* Close button at bottom for inline */}
        {inline && (
          <button
            onClick={onClose}
            className="w-full mt-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

WeatherMapSection.displayName = "WeatherMapSection";

export default WeatherMapSection;
