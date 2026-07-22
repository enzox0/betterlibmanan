import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaLeaf,
  FaWater,
  FaMountain,
  FaChurch,
  FaCamera,
  FaLandmark,
  FaThLarge,
  FaStar,
  FaChevronRight,
} from "react-icons/fa";
import { useTourismStore } from "@/modules/admin/store/tourismStore";
import SafeImage from "@/modules/landing/components/ui/SafeImage";
import { Skeleton } from "@/shared/ui";
import type { TourismCategory } from "@/modules/admin/services/tourism.api";

// ─── Category config (mirrors TourismPage) ────────────────────────────────────

const CATEGORY_CONFIG: Record<
  TourismCategory | "all",
  {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    gradient: string;
  }
> = {
  all: { label: "All", icon: FaThLarge, gradient: "" },
  nature: {
    label: "Nature",
    icon: FaLeaf,
    gradient: "bg-gradient-to-br from-emerald-700 to-emerald-900",
  },
  water: {
    label: "Rivers & Lakes",
    icon: FaWater,
    gradient: "bg-gradient-to-br from-blue-600 to-blue-900",
  },
  heritage: {
    label: "Heritage",
    icon: FaChurch,
    gradient: "bg-gradient-to-br from-amber-700 to-amber-900",
  },
  viewpoint: {
    label: "Viewpoints",
    icon: FaMountain,
    gradient: "bg-gradient-to-br from-purple-700 to-purple-900",
  },
  photo: {
    label: "Photo Spots",
    icon: FaCamera,
    gradient: "bg-gradient-to-br from-rose-700 to-rose-900",
  },
  other: {
    label: "Other",
    icon: FaLandmark,
    gradient: "bg-gradient-to-br from-indigo-700 to-indigo-900",
  },
};

const TOP_N = 3;

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SpotCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-neutral-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-2/3 rounded bg-neutral-200" />
        <div className="h-3 w-full rounded bg-neutral-100" />
        <div className="h-3 w-4/5 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function TouristSpotsSection({
  isLoading: externalLoading = false,
}: {
  isLoading?: boolean;
}) {
  const publicSpots = useTourismStore((s) => s.publicSpots);
  const visitCounts = useTourismStore((s) => s.visitCounts);
  const isPublicLoading = useTourismStore((s) => s.isPublicLoading);
  const fetchPublicSpots = useTourismStore((s) => s.fetchPublicSpots);

  useEffect(() => {
    fetchPublicSpots().catch(() => {});
  }, [fetchPublicSpots]);

  const isLoading = externalLoading || isPublicLoading;

  // Top 3 by visit count; fall back to first 3 when no visits recorded
  const topSpots = useMemo(() => {
    if (publicSpots.length === 0) return [];
    const hasAnyVisit = publicSpots.some((s) => (visitCounts[s.id] ?? 0) > 0);
    if (!hasAnyVisit) return publicSpots.slice(0, TOP_N);
    return [...publicSpots]
      .sort((a, b) => (visitCounts[b.id] ?? 0) - (visitCounts[a.id] ?? 0))
      .slice(0, TOP_N);
  }, [publicSpots, visitCounts]);

  return (
    <section className="bg-neutral-50 py-16 border-t border-neutral-200">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-64 mb-2" />
                  <Skeleton className="h-5 w-72" />
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
                    Top Tourist Spots
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Most visited destinations in Libmanan, Camarines Sur
                  </p>
                </>
              )}
            </div>

            {!isLoading && (
              <Link
                to="/tourism"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
              >
                Explore all spots
                <FaChevronRight className="text-[10px]" />
              </Link>
            )}
          </div>

          {/* Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: TOP_N }).map((_, i) => (
                <SpotCardSkeleton key={i} />
              ))
            ) : topSpots.length === 0 ? (
              <div className="col-span-full py-12 text-center text-neutral-400 text-sm">
                No tourist spots available yet.
              </div>
            ) : (
              topSpots.map((spot, index) => {
                const cfg =
                  CATEGORY_CONFIG[spot.fields.category] ??
                  CATEGORY_CONFIG.other;
                const CategoryIcon = cfg.icon;
                const visits = visitCounts[spot.id] ?? 0;

                return (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <Link
                      to="/tourism"
                      className="group block rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-neutral-300"
                    >
                      {/* Image / colour band */}
                      <div
                        className={`h-44 flex items-end p-4 relative overflow-hidden ${cfg.gradient}`}
                      >
                        {/* Rank badge */}
                        <span className="absolute top-3 left-3 flex items-center justify-center h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-bold">
                          #{index + 1}
                        </span>

                        {/* Category badge */}
                        <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider">
                          <CategoryIcon className="text-[9px]" />
                          {cfg.label}
                        </span>

                        {/* Background image */}
                        {spot.fields.image ? (
                          <SafeImage
                            src={spot.fields.image}
                            alt={spot.fields.name}
                            className="absolute inset-0 h-full w-full object-cover opacity-60"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <CategoryIcon className="text-[120px] text-white" />
                          </div>
                        )}

                        <h3 className="relative text-lg font-bold text-white leading-snug drop-shadow">
                          {spot.fields.name}
                        </h3>
                      </div>

                      {/* Card body */}
                      <div className="p-5">
                        {spot.fields.location && (
                          <div className="flex items-start gap-2 mb-2">
                            <FaMapMarkerAlt className="text-neutral-400 mt-0.5 shrink-0 text-xs" />
                            <span className="text-xs text-neutral-500">
                              {spot.fields.barangayName || spot.fields.location}
                            </span>
                          </div>
                        )}

                        {spot.fields.description && (
                          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
                            {spot.fields.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {spot.fields.averageRating && (
                              <span className="flex items-center gap-1 text-xs font-medium text-neutral-600">
                                <FaStar className="text-yellow-400 text-[10px]" />
                                {spot.fields.averageRating}
                                {spot.fields.ratingCount > 0 && (
                                  <span className="text-neutral-400">
                                    ({spot.fields.ratingCount})
                                  </span>
                                )}
                              </span>
                            )}
                            {visits > 0 && (
                              <span className="text-[11px] text-neutral-400">
                                {visits.toLocaleString()} visit
                                {visits !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-neutral-500 group-hover:text-neutral-900 transition-colors flex items-center gap-1">
                            View details
                            <FaChevronRight className="text-[8px]" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

TouristSpotsSection.displayName = "TouristSpotsSection";
export default TouristSpotsSection;
