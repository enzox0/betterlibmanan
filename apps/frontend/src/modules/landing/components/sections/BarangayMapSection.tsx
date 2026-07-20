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

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  const [showPanel, setShowPanel] = useState(false);
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
            festivals = record.fields.festivals as Festival[];
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
                        className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg py-1"
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
                          className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg py-3 px-3"
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
                      {geoJson.features.map((feature) => (
                        <pattern
                          key={`pattern-${feature.properties.adm4_en}`}
                          id={getPatternId(feature.properties.adm4_en)}
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
                              getBarangayData(feature.properties.adm4_en).image,
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
                      ))}
                    </defs>

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
                            isSelected
                              ? `url(#${getPatternId(barangayName)})`
                              : isHovered
                                ? `url(#${getPatternId(barangayName)})`
                                : "#93c5fd"
                          }
                          fillOpacity={isSelected ? 1 : isHovered ? 1 : 0.4}
                          stroke={isSelected ? "#374151" : "#1e40af"}
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
                          style={{
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                        />
                      );
                    })}
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
        {selectedBarangay && selectedData && selectedFeature && (
          <div className="fixed inset-0 z-[9999999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setSelectedBarangay(null);
                setSearchQuery("");
              }}
            />

            <div
              className="absolute left-0 top-0 w-[70%] h-full hidden items-center justify-center p-8 lg:flex cursor-pointer"
              onClick={() => {
                setSelectedBarangay(null);
                setSearchQuery("");
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-3xl flex items-center justify-center pointer-events-none"
              >
                <svg
                  viewBox={`0 0 ${modalSvgWidth} ${modalSvgHeight}`}
                  className="w-full h-auto max-h-[80vh]"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <pattern
                      id={getPatternId(selectedBarangay, "selected-img")}
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
                        href={getProxiedUrl(selectedData.image)}
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
                  </defs>
                  <path
                    d={getPathString(
                      selectedFeature.geometry,
                      selectedBounds,
                      modalSvgWidth,
                      modalSvgHeight,
                    )}
                    fill={`url(#${getPatternId(selectedBarangay, "selected-img")})`}
                    fillOpacity={1}
                    stroke="#374151"
                    strokeWidth={4}
                  />
                </svg>
              </motion.div>
            </div>

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full lg:w-[30%] bg-white shadow-2xl overflow-y-auto"
            >
              <button
                className="absolute top-4 right-4 z-10 p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                onClick={() => {
                  setSelectedBarangay(null);
                  setSearchQuery("");
                }}
              >
                <LuX className="w-6 h-6" aria-hidden="true" />
              </button>

              <div className="p-0 lg:p-5">
                <div className="relative lg:hidden">
                  <img
                    src={getProxiedUrl(selectedData.image)}
                    alt={selectedBarangay}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/betterlibmanan.png";
                    }}
                  />
                </div>

                <div className="p-5 lg:p-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                    {selectedBarangay}
                  </h1>

                  <p className="text-sm text-neutral-600 mb-4">
                    {selectedData.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                        <LuUsers className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-neutral-900">
                          {selectedData.population}
                        </div>
                        <div className="mt-0.5 text-[10px] text-neutral-500 flex items-center gap-1">
                          Population
                          <span className="text-neutral-400">• PSA data</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                        <LuGlobe className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-neutral-900">
                          {selectedData.area}
                        </div>
                        <div className="mt-0.5 text-[10px] text-neutral-500">
                          Area
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                        <LuCamera className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      Tourist Attractions
                    </h3>
                    <ul className="space-y-1.5">
                      {selectedData.touristAttractions.map(
                        (attraction, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-neutral-700"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                            {attraction}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

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
                    <div className="flex flex-col gap-2">
                      {selectedData.festivals.map((festival, index) => (
                        <div
                          key={index}
                          className="border border-neutral-200 rounded-lg overflow-hidden"
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
                            className="w-full px-3 py-2 flex items-center justify-between text-left bg-neutral-50 hover:bg-neutral-100 transition-colors"
                          >
                            <span className="text-sm font-medium text-neutral-800">
                              {festival.name}
                            </span>
                            <LuChevronDown
                              className={`w-4 h-4 text-neutral-500 transition-transform ${
                                expandedFestivalIndex === index
                                  ? "rotate-180"
                                  : ""
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
                                <div className="px-3 pb-3 pt-2 space-y-2 bg-white">
                                  {festival.date && (
                                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                                      <LuCalendar
                                        className="w-3.5 h-3.5 text-neutral-400 shrink-0"
                                        aria-hidden="true"
                                      />
                                      <span>{festival.date}</span>
                                    </div>
                                  )}
                                  {festival.description && (
                                    <p className="text-xs text-neutral-600 leading-relaxed">
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

                  {/* Barangay Captain & Phone */}
                  {(selectedData.captain || selectedData.phone) && (
                    <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
                      <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
                          <LuUser className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        Barangay Contact
                      </h3>
                      <div className="space-y-2">
                        {selectedData.captain && (
                          <div className="flex items-center gap-2 text-sm text-neutral-700">
                            <LuUser
                              className="w-3.5 h-3.5 text-neutral-400 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{selectedData.captain}</span>
                          </div>
                        )}
                        {selectedData.phone && (
                          <div className="flex items-center gap-2 text-sm text-neutral-700">
                            <LuPhone
                              className="w-3.5 h-3.5 text-neutral-400 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{selectedData.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

BarangayMapSection.displayName = "BarangayMapSection";

export default BarangayMapSection;
