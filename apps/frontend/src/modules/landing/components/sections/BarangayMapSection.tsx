import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuMapPin,
  LuX,
  LuUsers,
  LuGlobe,
  LuCamera,
  LuCalendar,
  LuSearch,
  LuPhone,
  LuUser,
  LuChevronDown,
  LuExternalLink,
} from "react-icons/lu";
import { Skeleton } from "@/shared/ui";
import { useBarangayMapStore } from "@/modules/admin/store/barangayMapStore";
import { useGovernmentStore } from "@/modules/admin/store/governmentStore";
import { getProxiedUrl } from "../ui/SafeImage";

type Festival = {
  name: string;
  date?: string;
  description?: string;
};

type BarangayData = {
  image: string;
  imageSource: string;
  description: string;
  touristAttractions: string[];
  population: string;
  area: string;
  festivals: Festival[];
  captain: string;
  phone: string;
};

const defaultBarangayData: BarangayData = {
  image: "/betterlibmanan.png",
  imageSource: "",
  description:
    "This barangay does not have published details yet. Check back after the admin adds its profile.",
  touristAttractions: ["Details coming soon"],
  population: "N/A",
  area: "N/A",
  festivals: [{ name: "To be announced", date: "", description: "" }],
  captain: "",
  phone: "",
};

function normalizeBarangayKey(name: string): string {
  return name.trim().toLowerCase();
}

function getPatternId(name: string, prefix: string = "img"): string {
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${prefix}-${safe}`;
}

function getClipId(name: string): string {
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `clip-${safe}`;
}

function computePolygonCentroid(points: [number, number][]): [number, number] {
  if (points.length === 0) return [0, 0];
  let x = 0,
    y = 0;
  for (const [px, py] of points) {
    x += px;
    y += py;
  }
  return [x / points.length, y / points.length];
}

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatFestivalDate(raw: string | undefined): string {
  if (!raw) return "";
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[2]}/${isoMatch[3]}`;
  }
  return raw;
}

type Coordinate = [number, number];
type Polygon = Coordinate[][];
type MultiPolygon = Polygon[];
type Geometry =
  | { type: "Polygon"; coordinates: Polygon }
  | { type: "MultiPolygon"; coordinates: MultiPolygon };
type Feature = {
  type: "Feature";
  geometry: Geometry;
  properties: {
    adm4_en: string;
    [key: string]: any;
  };
  id?: any;
};
type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

export function BarangayMapSection({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const publicRecords = useBarangayMapStore((s) => s.publicRecords);
  const isPublicLoading = useBarangayMapStore((s) => s.isPublicLoading);
  const fetchPublicRecords = useBarangayMapStore((s) => s.fetchPublicRecords);

  // Government directory (captain + phone)
  const govBarangays = useGovernmentStore((s) => s.barangays);
  const fetchGovBarangays = useGovernmentStore((s) => s.fetchBarangays);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [hoveredBarangay, setHoveredBarangay] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [expandedFestivalIndex, setExpandedFestivalIndex] = useState<
    number | null
  >(null);
  const [autoHoveredBarangay, setAutoHoveredBarangay] = useState<string | null>(
    null,
  );
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserInteractingRef = useRef(false);
  const autoHoverIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const svgWidth = 800;
  const svgHeight = 450;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    fetchPublicRecords().catch(() => {});
  }, [fetchPublicRecords]);

  useEffect(() => {
    fetchGovBarangays().catch(() => {});
  }, [fetchGovBarangays]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipWidth = 192;
      const tooltipHeight = 160;

      let x = e.clientX - rect.left - tooltipWidth / 2;
      let y = e.clientY - rect.top - tooltipHeight - 20;

      if (x < 10) x = 10;
      if (x + tooltipWidth > rect.width - 10) {
        x = rect.width - tooltipWidth - 10;
      }

      if (y < 10) {
        y = e.clientY - rect.top + 20;
      }

      setCursorPosition({ x, y });
    }
  };

  useEffect(() => {
    fetch("/geojson/bgysubmuns-municity-501718000.0.01.json")
      .then((res) => res.json())
      .then((data) => setGeoJson(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  const barangayData = useMemo<Record<string, BarangayData>>(() => {
    // Build gov directory lookup: normalized name → { captain, phone }
    const govLookup = new Map<string, { captain: string; phone: string }>();
    for (const r of govBarangays) {
      const key = normalizeBarangayKey((r.fields as any).name ?? r.title ?? "");
      govLookup.set(key, {
        captain: (r.fields as any).captain ?? "",
        phone: (r.fields as any).phone ?? "",
      });
    }

    return Object.fromEntries(
      publicRecords.map((record) => [
        normalizeBarangayKey(record.fields.name ?? record.title),
        (() => {
          const key = normalizeBarangayKey(record.fields.name ?? record.title);
          const gov = govLookup.get(key);
          const touristAttractions = parseList(
            record.fields.touristAttractions,
          );
          // Check if festivals is array of objects (new format) or string (old format)
          let festivals: Festival[];
          if (Array.isArray(record.fields.festivals)) {
            festivals = (record.fields.festivals as Festival[]).map((f) => ({
              name: f.name ?? "",
              date: formatFestivalDate(f.date),
              description: f.description ?? "",
            }));
          } else {
            // Fallback for old format (string or undefined)
            const parsed = parseList(record.fields.festivals);
            festivals = parsed.map((name) => ({
              name,
              date: "",
              description: "",
            }));
          }
          return {
            image: record.fields.image || defaultBarangayData.image,
            imageSource: record.fields.imageSource || "",
            description:
              record.fields.description || defaultBarangayData.description,
            touristAttractions:
              touristAttractions.length > 0
                ? touristAttractions
                : defaultBarangayData.touristAttractions,
            population:
              record.fields.population || defaultBarangayData.population,
            area: record.fields.area || defaultBarangayData.area,
            festivals:
              festivals.length > 0 ? festivals : defaultBarangayData.festivals,
            captain: gov?.captain ?? "",
            phone: gov?.phone ?? "",
          };
        })(),
      ]),
    );
  }, [publicRecords, govBarangays]);

  const allBarangayNames = useMemo(() => {
    if (!geoJson) return [];
    return geoJson.features.map((f) => f.properties.adm4_en).sort();
  }, [geoJson]);

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allBarangayNames.filter((name) => name.toLowerCase().includes(q));
  }, [searchQuery, allBarangayNames]);

  // Close suggestions when clicking outside the search box
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = (name: string) => {
    setSelectedBarangay(name);
    setSearchQuery(name);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (!geoJson || selectedBarangay) return;

    const barangayNames = geoJson.features.map((f) => f.properties.adm4_en);

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
      }, 3000);
    };

    startAutoHover();

    return () => {
      if (autoHoverIntervalRef.current) {
        clearInterval(autoHoverIntervalRef.current);
      }
    };
  }, [geoJson, selectedBarangay]);

  const getBounds = (features: Feature[]) => {
    let minLng = Infinity,
      maxLng = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;

    features.forEach((feature) => {
      const processPolygon = (polygon: Polygon) => {
        polygon[0].forEach(([lng, lat]) => {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      };

      if (feature.geometry.type === "Polygon") {
        processPolygon(feature.geometry.coordinates);
      } else if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach(processPolygon);
      }
    });

    return { minLng, maxLng, minLat, maxLat };
  };

  const convertCoords = (
    coords: Coordinate,
    bounds: ReturnType<typeof getBounds>,
    width: number,
    height: number,
    padding: number = 20,
  ) => {
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

  const getPathString = (
    geometry: Geometry,
    bounds: ReturnType<typeof getBounds>,
    width: number,
    height: number,
  ) => {
    let path = "";

    const processPolygon = (polygon: Polygon) => {
      polygon.forEach((ring, ringIndex) => {
        const points = ring.map((coord) =>
          convertCoords(coord, bounds, width, height),
        );
        if (points.length > 0) {
          path +=
            (ringIndex === 0 ? "M" : "M") +
            points.map((p) => `${p[0]},${p[1]}`).join(" L") +
            " Z ";
        }
      });
    };

    if (geometry.type === "Polygon") {
      processPolygon(geometry.coordinates);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach(processPolygon);
    }

    return path;
  };

  const bounds = useMemo(() => {
    if (!geoJson) return { minLng: 0, maxLng: 0, minLat: 0, maxLat: 0 };
    return getBounds(geoJson.features);
  }, [geoJson]);

  const getBarangayData = (name: string) =>
    barangayData[normalizeBarangayKey(name)] || defaultBarangayData;
  const hoveredData = hoveredBarangay ? getBarangayData(hoveredBarangay) : null;
  const autoHoveredData = autoHoveredBarangay
    ? getBarangayData(autoHoveredBarangay)
    : null;
  const selectedData = selectedBarangay
    ? getBarangayData(selectedBarangay)
    : null;

  const selectedFeature = useMemo(() => {
    if (!geoJson || !selectedBarangay) return null;
    return geoJson.features.find(
      (f) => f.properties.adm4_en === selectedBarangay,
    );
  }, [geoJson, selectedBarangay]);

  const getFeatureBounds = (feature: Feature) => {
    let minLng = Infinity,
      maxLng = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;

    const processPolygon = (polygon: Polygon) => {
      polygon[0].forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    };

    if (feature.geometry.type === "Polygon") {
      processPolygon(feature.geometry.coordinates);
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach(processPolygon);
    }

    return { minLng, maxLng, minLat, maxLat };
  };

  const selectedBounds = useMemo(() => {
    if (!selectedFeature) return { minLng: 0, maxLng: 0, minLat: 0, maxLat: 0 };
    return getFeatureBounds(selectedFeature);
  }, [selectedFeature]);

  // SVG-space bounding box + centroid for the selected barangay shape
  const selectedSvgBbox = useMemo(() => {
    if (!selectedFeature) return null;
    const allPoints: [number, number][] = [];
    const collectPolygon = (polygon: Polygon) => {
      polygon[0].forEach((coord) => {
        const [x, y] = convertCoords(coord, bounds, svgWidth, svgHeight);
        allPoints.push([x, y]);
      });
    };
    if (selectedFeature.geometry.type === "Polygon") {
      collectPolygon(selectedFeature.geometry.coordinates);
    } else {
      selectedFeature.geometry.coordinates.forEach(collectPolygon);
    }
    if (allPoints.length === 0) return null;
    const xs = allPoints.map((p) => p[0]);
    const ys = allPoints.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const [cx, cy] = computePolygonCentroid(allPoints);
    return {
      minX,
      maxX,
      minY,
      maxY,
      cx,
      cy,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [selectedFeature, bounds, svgWidth, svgHeight]);

  const modalSvgWidth = 800;
  const modalSvgHeight = 600;

  return (
    <section className="bg-white py-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            {isLoading || isPublicLoading ? (
              <>
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-5 w-80" />
              </>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                    Explore Libmanan's Barangays
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Hover over a barangay to see its image, click for details
                  </p>
                </div>

                {/* Search box */}
                <div ref={searchRef} className="relative w-full sm:w-64">
                  <div className="relative">
                    <LuSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      placeholder="Search barangay..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 bg-white shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                      aria-label="Search barangay"
                      aria-autocomplete="list"
                      aria-expanded={
                        showSuggestions && searchSuggestions.length > 0
                      }
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 transition"
                        aria-label="Clear search"
                      >
                        <LuX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        className="relative mt-2 lg:absolute lg:z-50 lg:mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg py-1"
                      >
                        {searchSuggestions.map((name) => (
                          <li
                            key={name}
                            role="option"
                            aria-selected={selectedBarangay === name}
                            onMouseDown={() => handleSearchSelect(name)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                          >
                            <LuMapPin
                              className="w-3.5 h-3.5 shrink-0 text-neutral-400"
                              aria-hidden="true"
                            />
                            {name}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                    {showSuggestions &&
                      searchQuery.trim() &&
                      searchSuggestions.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="relative mt-2 lg:absolute lg:z-50 lg:mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg py-3 px-3"
                        >
                          <p className="text-sm text-neutral-500">
                            No barangay found.
                          </p>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div
              ref={containerRef}
              className="rounded-2xl border border-neutral-200 bg-white shadow-sm h-[350px] xs:h-[420px] sm:h-[500px] lg:h-[600px]"
              onMouseMove={handleMouseMove}
            >
              <div className="h-full overflow-hidden">
                {geoJson ? (
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <style>{`
                        @keyframes barangayImgExpand {
                          from { transform: scale(0.4); opacity: 0; }
                          to   { transform: scale(1);   opacity: 1; }
                        }
                      `}</style>
                      {geoJson.features.map((feature) => {
                        const name = feature.properties.adm4_en;
                        const pathD = getPathString(
                          feature.geometry,
                          bounds,
                          svgWidth,
                          svgHeight,
                        );
                        return (
                          <g key={`defs-${name}`}>
                            <pattern
                              id={getPatternId(name)}
                              patternUnits="objectBoundingBox"
                              patternContentUnits="objectBoundingBox"
                              width="1"
                              height="1"
                              x="0"
                              y="0"
                              viewBox="0 0 1 1"
                              preserveAspectRatio="xMidYMid slice"
                            >
                              <image
                                href={getProxiedUrl(
                                  getBarangayData(name).image,
                                )}
                                preserveAspectRatio="xMidYMid slice"
                                width="1"
                                height="1"
                                onError={(e) => {
                                  (e.target as SVGImageElement).setAttribute(
                                    "href",
                                    "/betterlibmanan.png",
                                  );
                                }}
                              />
                            </pattern>
                            {/* ClipPath matching the exact polygon shape for the desktop image overlay */}
                            <clipPath id={getClipId(name)}>
                              <path d={pathD} />
                            </clipPath>
                          </g>
                        );
                      })}
                      {/* Gradient for darkening the bottom of the image overlay */}
                      <linearGradient
                        id="imgOverlayGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
                      </linearGradient>
                    </defs>

                    {/* Base polygon layer */}
                    {geoJson.features.map((feature, index) => {
                      const isUserHovered =
                        hoveredBarangay === feature.properties.adm4_en;
                      const isAutoHovered =
                        autoHoveredBarangay === feature.properties.adm4_en;
                      const isSelected =
                        selectedBarangay === feature.properties.adm4_en;
                      const barangayName = feature.properties.adm4_en;
                      const isHovered =
                        isUserHovered ||
                        (!isUserInteractingRef.current &&
                          isAutoHovered &&
                          !selectedBarangay);
                      // On desktop: selected polygon gets a muted base so the image overlay reads clearly
                      const useImageOverlay = isDesktop && isSelected;

                      return (
                        <path
                          key={index}
                          d={getPathString(
                            feature.geometry,
                            bounds,
                            svgWidth,
                            svgHeight,
                          )}
                          fill={
                            useImageOverlay
                              ? "#bfdbfe"
                              : isSelected
                                ? `url(#${getPatternId(barangayName)})`
                                : isHovered
                                  ? `url(#${getPatternId(barangayName)})`
                                  : "#93c5fd"
                          }
                          fillOpacity={
                            useImageOverlay
                              ? 0.5
                              : isSelected
                                ? 1
                                : isHovered
                                  ? 1
                                  : 0.4
                          }
                          stroke={isSelected ? "#1e3a8a" : "#1e40af"}
                          strokeWidth={isSelected ? 2.5 : 1}
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
                          style={{
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                        />
                      );
                    })}

                    {/* Desktop only: image clipped to the exact selected polygon, expanding from centroid */}
                    {isDesktop &&
                      selectedBarangay &&
                      selectedData &&
                      selectedSvgBbox &&
                      (() => {
                        const { minX, minY, width, height, cx, cy } =
                          selectedSvgBbox;
                        const pad = Math.max(width, height) * 0.12;
                        return (
                          <g
                            key={`img-overlay-${selectedBarangay}`}
                            clipPath={`url(#${getClipId(selectedBarangay)})`}
                            style={{
                              transformOrigin: `${cx}px ${cy}px`,
                              animation:
                                "barangayImgExpand 0.42s cubic-bezier(0.22,1,0.36,1) forwards",
                            }}
                          >
                            <image
                              href={getProxiedUrl(selectedData.image)}
                              x={minX - pad}
                              y={minY - pad}
                              width={width + pad * 2}
                              height={height + pad * 2}
                              preserveAspectRatio="xMidYMid slice"
                              onError={(e) => {
                                (e.target as SVGImageElement).setAttribute(
                                  "href",
                                  "/betterlibmanan.png",
                                );
                              }}
                            />
                            <rect
                              x={minX - pad}
                              y={minY - pad}
                              width={width + pad * 2}
                              height={height + pad * 2}
                              fill="url(#imgOverlayGrad)"
                            />
                          </g>
                        );
                      })()}

                    {/* Desktop only: barangay name label at the bottom of the image overlay */}
                    {isDesktop &&
                      selectedBarangay &&
                      selectedSvgBbox &&
                      (() => {
                        const { cx, maxY } = selectedSvgBbox;
                        return (
                          <text
                            key={`label-${selectedBarangay}`}
                            x={cx}
                            y={maxY - 6}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill="white"
                            style={{
                              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))",
                              pointerEvents: "none",
                              transformOrigin: `${cx}px ${maxY}px`,
                              animation:
                                "barangayImgExpand 0.42s cubic-bezier(0.22,1,0.36,1) forwards",
                            }}
                          >
                            {selectedBarangay}
                          </text>
                        );
                      })()}
                  </svg>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
                      <LuMapPin className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-neutral-600">
                      Loading map...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(hoveredBarangay && hoveredData && !selectedBarangay) ||
            (autoHoveredBarangay &&
              autoHoveredData &&
              !selectedBarangay &&
              !hoveredBarangay) ? (
              <div
                className="absolute z-[9999] bg-white rounded-xl shadow-lg border border-neutral-200 p-3 pointer-events-none"
                style={{
                  left: hoveredBarangay ? cursorPosition.x : 32,
                  top: hoveredBarangay ? cursorPosition.y : 32,
                }}
              >
                <div className="space-y-2 w-48">
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={getProxiedUrl(
                        hoveredBarangay
                          ? hoveredData!.image
                          : autoHoveredData!.image,
                      )}
                      alt={hoveredBarangay || autoHoveredBarangay!}
                      className="h-24 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/betterlibmanan.png";
                      }}
                    />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {hoveredBarangay || autoHoveredBarangay}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {hoveredBarangay
                      ? hoveredData!.description
                      : autoHoveredData!.description}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedBarangay && selectedData && (
          <div className="fixed inset-0 z-[9999999]">
            {/* Shared backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => {
                setSelectedBarangay(null);
                setSearchQuery("");
              }}
            />

            {/* Mobile / Tablet — full viewport panel (below lg) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 lg:hidden bg-white flex flex-col"
            >
              <button
                className="absolute top-4 right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-md text-neutral-700 hover:text-neutral-900 hover:bg-white/90 transition-all shadow-sm flex items-center justify-center"
                onClick={() => {
                  setSelectedBarangay(null);
                  setSearchQuery("");
                }}
                aria-label="Close barangay details"
              >
                <LuX className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              </button>

              <div className="relative h-56 sm:h-72 shrink-0">
                <img
                  src={getProxiedUrl(selectedData.image)}
                  alt={selectedBarangay}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/betterlibmanan.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <h1 className="absolute bottom-6 left-6 right-16 text-2xl sm:text-4xl font-bold text-white leading-tight">
                  {selectedBarangay}
                </h1>
                {selectedData.imageSource && (
                  <a
                    href={selectedData.imageSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md hover:bg-black/70 transition-colors"
                  >
                    <LuExternalLink
                      className="w-3 h-3 shrink-0"
                      aria-hidden="true"
                    />
                    Source
                  </a>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                <BarangayPanelContent
                  data={selectedData}
                  name={selectedBarangay}
                  expandedFestivalIndex={expandedFestivalIndex}
                  setExpandedFestivalIndex={setExpandedFestivalIndex}
                />
              </div>
            </motion.div>

            {/* Desktop — split view: left enlarged barangay preview + right side panel (lg+) */}
            <div
              className="absolute inset-0 hidden lg:flex"
              onClick={() => {
                setSelectedBarangay(null);
                setSearchQuery("");
              }}
            >
              {/* Left region — enlarged isolated GeoJSON preview of the selected barangay */}
              <div className="w-[67%] h-full flex items-center justify-center p-12">
                {selectedFeature &&
                  selectedData &&
                  selectedSvgBbox &&
                  (() => {
                    // Build an isolated SVG viewBox tightly around the selected polygon
                    const { minX, minY, width, height } = selectedSvgBbox;
                    const pad = Math.max(width, height) * 0.18;
                    const vx = minX - pad;
                    const vy = minY - pad;
                    const vw = width + pad * 2;
                    const vh = height + pad * 2;
                    const previewClipId = `preview-clip-${getClipId(selectedBarangay!)}`;
                    const previewPatternId = `preview-pat-${getPatternId(selectedBarangay!)}`;
                    const pathD = getPathString(
                      selectedFeature.geometry,
                      bounds,
                      svgWidth,
                      svgHeight,
                    );

                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.82 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.82 }}
                        transition={{
                          duration: 0.42,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          viewBox={`${vx} ${vy} ${vw} ${vh}`}
                          className="max-w-full max-h-full drop-shadow-2xl"
                          preserveAspectRatio="xMidYMid meet"
                          style={{
                            filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.45))",
                          }}
                        >
                          <defs>
                            <clipPath id={previewClipId}>
                              <path d={pathD} />
                            </clipPath>
                            <pattern
                              id={previewPatternId}
                              patternUnits="userSpaceOnUse"
                              x={minX}
                              y={minY}
                              width={width}
                              height={height}
                            >
                              <image
                                href={getProxiedUrl(selectedData.image)}
                                x="0"
                                y="0"
                                width={width}
                                height={height}
                                preserveAspectRatio="xMidYMid slice"
                                onError={(e) => {
                                  (e.target as SVGImageElement).setAttribute(
                                    "href",
                                    "/betterlibmanan.png",
                                  );
                                }}
                              />
                            </pattern>
                            <linearGradient
                              id="previewGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                              <stop offset="75%" stopColor="rgba(0,0,0,0)" />
                              <stop
                                offset="100%"
                                stopColor="rgba(0,0,0,0.65)"
                              />
                            </linearGradient>
                          </defs>

                          {/* Image fill clipped to polygon */}
                          <path
                            d={pathD}
                            fill={`url(#${previewPatternId})`}
                            stroke="none"
                          />

                          {/* Gradient overlay at the bottom */}
                          <path
                            d={pathD}
                            fill="url(#previewGrad)"
                            stroke="none"
                          />

                          {/* Polygon border */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="white"
                            strokeWidth={Math.max(width, height) * 0.004}
                            strokeLinejoin="round"
                            opacity="0.7"
                          />
                        </svg>
                      </motion.div>
                    );
                  })()}
              </div>

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="w-[33%] h-full bg-white shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Compact header — no image here on desktop; the image lives in the SVG map */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
                      <LuMapPin className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-base font-bold text-neutral-900 leading-tight truncate">
                        {selectedBarangay}
                      </h1>
                      {selectedData.imageSource && (
                        <a
                          href={selectedData.imageSource}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          <LuExternalLink
                            className="w-2.5 h-2.5 shrink-0"
                            aria-hidden="true"
                          />
                          Image source
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    className="shrink-0 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all flex items-center justify-center"
                    onClick={() => {
                      setSelectedBarangay(null);
                      setSearchQuery("");
                    }}
                    aria-label="Close barangay details"
                  >
                    <LuX className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  <BarangayPanelContent
                    data={selectedData}
                    name={selectedBarangay}
                    expandedFestivalIndex={expandedFestivalIndex}
                    setExpandedFestivalIndex={setExpandedFestivalIndex}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function BarangayPanelContent({
  data,
  name: _name,
  expandedFestivalIndex,
  setExpandedFestivalIndex,
}: {
  data: BarangayData;
  name: string;
  expandedFestivalIndex: number | null;
  setExpandedFestivalIndex: (i: number | null) => void;
}) {
  return (
    <>
      <p className="text-sm sm:text-base text-neutral-600 mb-6">
        {data.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <LuUsers className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="text-lg font-bold text-neutral-900">
              {data.population}
            </div>
            <div className="mt-0.5 text-[10px] sm:text-xs text-neutral-500 flex items-center gap-1">
              Population
              <span className="text-neutral-400">• PSA data</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <LuGlobe className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="text-lg font-bold text-neutral-900">
              {data.area}
            </div>
            <div className="mt-0.5 text-[10px] sm:text-xs text-neutral-500">
              Area
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
            <LuCamera className="w-4 h-4" aria-hidden="true" />
          </div>
          Tourist Attractions
        </h3>
        <ul className="space-y-2">
          {data.touristAttractions.map((attraction, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-neutral-700"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 mt-2 shrink-0" />
              {attraction}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
            <LuCalendar className="w-4 h-4" aria-hidden="true" />
          </div>
          Festivals
        </h3>
        <div className="flex flex-col gap-2">
          {data.festivals.map((festival, index) => (
            <div
              key={index}
              className="border border-neutral-200 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => {
                  if (expandedFestivalIndex === index) {
                    setExpandedFestivalIndex(null);
                  } else {
                    setExpandedFestivalIndex(index);
                  }
                }}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-800">
                  {festival.name}
                </span>
                <LuChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform ${
                    expandedFestivalIndex === index ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              <AnimatePresence>
                {expandedFestivalIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 space-y-2.5 bg-white">
                      {festival.date && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                          <LuCalendar
                            className="w-3.5 h-3.5 text-neutral-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{formatFestivalDate(festival.date)}</span>
                        </div>
                      )}
                      {festival.description && (
                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                          {festival.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {(data.captain || data.phone) && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
              <LuUser className="w-4 h-4" aria-hidden="true" />
            </div>
            Barangay Contact
          </h3>
          <div className="space-y-2.5">
            {data.captain && (
              <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                <LuUser
                  className="w-4 h-4 text-neutral-400 shrink-0"
                  aria-hidden="true"
                />
                <span>{data.captain}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                <LuPhone
                  className="w-4 h-4 text-neutral-400 shrink-0"
                  aria-hidden="true"
                />
                <span>{data.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

BarangayMapSection.displayName = "BarangayMapSection";

export default BarangayMapSection;
