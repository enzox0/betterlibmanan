import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  FaMapMarkerAlt,
  FaLeaf,
  FaWater,
  FaMountain,
  FaChurch,
  FaCamera,
  FaUtensils,
  FaChevronDown,
  FaStar,
  FaRegStar,
  FaThLarge,
  FaLandmark,
  FaTimes,
  FaChevronRight,
  FaUsers,
} from "react-icons/fa";
import { travelTips, foodSpots } from "../data/tourismData";
import {
  useTourismStore,
  getOrCreateSessionId,
} from "@/modules/admin/store/tourismStore";
import { useBarangayMapStore } from "@/modules/admin/store/barangayMapStore";
import { useGovernmentStore } from "@/modules/admin/store/governmentStore";
import type {
  TourismCategory,
  TouristSpotRecord,
} from "@/modules/admin/services/tourism.api";
import SafeImage from "@/modules/landing/components/ui/SafeImage";
import { getProxiedUrl } from "@/modules/landing/components/ui/SafeImage";
import ReactDOM from "react-dom";
import {
  LuUsers,
  LuGlobe,
  LuCamera,
  LuCalendar,
  LuChevronDown,
  LuX,
  LuUser,
  LuPhone,
  LuMapPin,
} from "react-icons/lu";

// ─── Category config ──────────────────────────────────────────────────────────

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

const ORDERED_CATEGORIES: (TourismCategory | "all")[] = [
  "all",
  "nature",
  "water",
  "heritage",
  "viewpoint",
  "photo",
  "other",
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    id: 1,
    question: "What is the best time to visit Libmanan?",
    answer:
      "The best time to visit is during the dry season from November to April. This period offers cooler temperatures and clear skies, ideal for outdoor activities and river trips.",
  },
  {
    id: 2,
    question: "How do I get to Libmanan?",
    answer:
      "Libmanan is accessible by bus or van from Naga City, roughly a 30–45 minute drive via the Maharlika Highway. From Manila, take a bus to Naga City then connect to Libmanan.",
  },
  {
    id: 3,
    question: "Are there entrance fees for tourist spots?",
    answer:
      "Some natural attractions may have minimal entrance or environmental fees to support conservation. Heritage sites and public areas are generally free to visit.",
  },
  {
    id: 4,
    question: "Is Libmanan safe for tourists?",
    answer:
      "Yes, Libmanan is generally safe for visitors. As with any travel, take normal precautions with your belongings and follow local guidelines when exploring natural areas.",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeKey(name: string) {
  return name.trim().toLowerCase();
}

type BarangayDetailData = {
  image: string;
  description: string;
  touristAttractions: string[];
  population: string;
  area: string;
  festivals: { name: string; date?: string; description?: string }[];
  captain: string;
  phone: string;
};

const defaultBgy: BarangayDetailData = {
  image: "/betterlibmanan.png",
  description: "This barangay does not have published details yet.",
  touristAttractions: [],
  population: "N/A",
  area: "N/A",
  festivals: [],
  captain: "",
  phone: "",
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SpotSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-neutral-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-2/3 rounded bg-neutral-200" />
        <div className="h-3 w-full rounded bg-neutral-100" />
        <div className="h-3 w-4/5 rounded bg-neutral-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-14 rounded-full bg-neutral-100" />
          <div className="h-5 w-18 rounded-full bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({
  spotId,
  averageRating,
  ratingCount,
  myRating,
  onRate,
}: {
  spotId: string;
  averageRating: string;
  ratingCount: number;
  myRating: number | undefined;
  onRate: (value: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displayRating = hovered || myRating || 0;

  async function handleRate(value: number) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRate(value);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {averageRating ? (
          <>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  className={`text-sm ${parseFloat(averageRating) >= s ? "text-yellow-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-800">
              {averageRating}
            </span>
            <span className="text-xs text-gray-400">
              ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FaUsers className="text-[10px]" /> No ratings yet — be the first!
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">
          {myRating ? "Your rating:" : "Rate this spot:"}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              disabled={isSubmitting}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(s)}
              aria-label={`Rate ${s} star${s !== 1 ? "s" : ""}`}
              className="p-0.5 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
            >
              {displayRating >= s ? (
                <FaStar className="text-yellow-400 text-xl" />
              ) : (
                <FaRegStar className="text-gray-300 text-xl" />
              )}
            </button>
          ))}
          {myRating && (
            <span className="ml-2 text-xs text-green-600 font-medium">
              ✓ Rated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BarangayDetailPanel ──────────────────────────────────────────────────────

function BarangayDetailPanel({
  barangayName,
  data,
  onClose,
}: {
  barangayName: string;
  data: BarangayDetailData;
  onClose: () => void;
}) {
  const [expandedFestival, setExpandedFestival] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="bgy-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: EASE }}
        className="fixed inset-0 z-[999999998] bg-black/50 !mt-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.aside
        key="bgy-panel"
        role="dialog"
        aria-modal="true"
        aria-label={barangayName}
        variants={slideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4, ease: EASE }}
        className="fixed right-0 top-0 z-[999999999] flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl !mt-0"
      >
        <div
          className="h-1 bg-gradient-to-r from-blue-600 to-blue-800 shrink-0"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <LuMapPin size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {barangayName}
              </h2>
              <p className="text-xs text-gray-400">
                Barangay, Libmanan, Camarines Sur
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <LuX size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {data.image && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img
                src={getProxiedUrl(data.image)}
                alt={barangayName}
                className="h-44 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/betterlibmanan.png";
                }}
              />
            </div>
          )}
          {data.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {data.description}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-1 text-gray-500">
                <LuUsers className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">
                  Population
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {data.population}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-1 text-gray-500">
                <LuGlobe className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider">
                  Area
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900">{data.area}</p>
            </div>
          </div>
          {data.touristAttractions.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <LuCamera className="h-4 w-4 text-gray-500" /> Tourist
                Attractions
              </h3>
              <ul className="space-y-1">
                {data.touristAttractions.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.festivals.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <LuCalendar className="h-4 w-4 text-gray-500" /> Festivals
              </h3>
              <div className="space-y-2">
                {data.festivals.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 overflow-hidden bg-white"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFestival(expandedFestival === i ? null : i)
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {f.name}
                      </span>
                      <LuChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${expandedFestival === i ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFestival === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-1 space-y-1">
                            {f.date && (
                              <p className="text-xs text-gray-500">{f.date}</p>
                            )}
                            {f.description && (
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {f.description}
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
          )}
          {(data.captain || data.phone) && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <LuUser className="h-4 w-4 text-gray-500" /> Barangay Contact
              </h3>
              {data.captain && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <LuUser className="h-3.5 w-3.5 text-gray-400" />
                  {data.captain}
                </p>
              )}
              {data.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <LuPhone className="h-3.5 w-3.5 text-gray-400" />
                  {data.phone}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Close
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>,
    document.body,
  );
}

// ─── SpotDetailPanel ──────────────────────────────────────────────────────────

function SpotDetailPanel({
  spot,
  myRating,
  barangayData,
  onClose,
  onRate,
}: {
  spot: TouristSpotRecord;
  myRating: number | undefined;
  barangayData: Record<string, BarangayDetailData>;
  onClose: () => void;
  onRate: (value: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const cfg = CATEGORY_CONFIG[spot.fields.category] ?? CATEGORY_CONFIG.other;
  const CategoryIcon = cfg.icon;
  const [showBarangay, setShowBarangay] = useState(false);

  const barangayName = spot.fields.barangayName || spot.fields.location || "";
  const bgyData = barangayName
    ? (barangayData[normalizeKey(barangayName)] ?? defaultBgy)
    : null;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showBarangay) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, showBarangay]);

  return ReactDOM.createPortal(
    <>
      <AnimatePresence>
        <motion.div
          key="spot-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-[9999999] bg-black/40 !mt-0"
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.aside
          key="spot-panel"
          role="dialog"
          aria-modal="true"
          aria-label={spot.fields.name}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed right-0 top-0 z-[99999999] flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl !mt-0"
        >
          <div
            className={`h-1 bg-gradient-to-r ${cfg.gradient} shrink-0`}
            aria-hidden="true"
          />
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.gradient} text-white`}
              >
                <CategoryIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {spot.fields.name}
                </h2>
                {barangayName && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <FaMapMarkerAlt size={10} />
                    {barangayName}
                  </p>
                )}
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {spot.fields.image && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <SafeImage
                  src={spot.fields.image}
                  alt={spot.fields.name}
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
            {spot.fields.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
                  About
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {spot.fields.description}
                </p>
              </div>
            )}
            {/* Barangay button */}
            {barangayName && bgyData && (
              <button
                type="button"
                onClick={() => setShowBarangay(true)}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <LuMapPin size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      {barangayName}
                    </p>
                    <p className="text-xs text-blue-500">
                      Tap to view barangay details
                    </p>
                  </div>
                </div>
                <FaChevronRight className="text-blue-400 text-xs shrink-0" />
              </button>
            )}
            {/* Tags */}
            {spot.fields.tags && spot.fields.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
                  Highlights
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {spot.fields.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Rating from constituents */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaStar className="text-yellow-400 text-xs" /> Community Rating
              </h3>
              <StarRating
                spotId={spot.id}
                averageRating={spot.fields.averageRating}
                ratingCount={spot.fields.ratingCount}
                myRating={myRating}
                onRate={onRate}
              />
            </div>
            {/* Entry fee */}
            {spot.fields.entryFee && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Entry Fee
                </h3>
                <p className="text-sm text-gray-600">{spot.fields.entryFee}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all"
            >
              Close
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>
      {/* Barangay sub-panel */}
      <AnimatePresence>
        {showBarangay && barangayName && bgyData && (
          <BarangayDetailPanel
            barangayName={barangayName}
            data={bgyData}
            onClose={() => setShowBarangay(false)}
          />
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TourismPage() {
  const [activeCategory, setActiveCategory] = useState<TourismCategory | "all">(
    "all",
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpotRecord | null>(
    null,
  );

  const publicSpots = useTourismStore((s) => s.publicSpots);
  const isLoading = useTourismStore((s) => s.isPublicLoading);
  const fetchPublicSpots = useTourismStore((s) => s.fetchPublicSpots);
  const visitCounts = useTourismStore((s) => s.visitCounts);
  const incrementVisit = useTourismStore((s) => s.incrementVisit);
  const rateSpot = useTourismStore((s) => s.rateSpot);
  const myRatings = useTourismStore((s) => s.myRatings);

  // Barangay data for the detail panels
  const barangayPublicRecords = useBarangayMapStore((s) => s.publicRecords);
  const fetchBarangayRecords = useBarangayMapStore((s) => s.fetchPublicRecords);
  const govBarangays = useGovernmentStore((s) => s.barangays);
  const fetchGovBarangays = useGovernmentStore((s) => s.fetchBarangays);

  useEffect(() => {
    fetchPublicSpots().catch(() => {});
  }, []);
  useEffect(() => {
    fetchBarangayRecords().catch(() => {});
  }, [fetchBarangayRecords]);
  useEffect(() => {
    fetchGovBarangays().catch(() => {});
  }, [fetchGovBarangays]);

  // Build barangay lookup (same logic as BarangayMapSection)
  const barangayDataMap = useCallback((): Record<
    string,
    BarangayDetailData
  > => {
    const govLookup = new Map<string, { captain: string; phone: string }>();
    for (const r of govBarangays) {
      const key = normalizeKey((r.fields as any).name ?? r.title ?? "");
      govLookup.set(key, {
        captain: (r.fields as any).captain ?? "",
        phone: (r.fields as any).phone ?? "",
      });
    }
    return Object.fromEntries(
      barangayPublicRecords.map((record) => {
        const key = normalizeKey(record.fields.name ?? record.title);
        const gov = govLookup.get(key);
        const touristAttractions = (record.fields.touristAttractions ?? "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        let festivals: { name: string; date?: string; description?: string }[];
        if (Array.isArray(record.fields.festivals)) {
          festivals = record.fields.festivals as any;
        } else {
          festivals = (record.fields.festivals ?? "")
            .split(",")
            .map((n: string) => ({ name: n.trim() }))
            .filter((f: any) => f.name);
        }
        return [
          key,
          {
            image: record.fields.image || "/betterlibmanan.png",
            description: record.fields.description || defaultBgy.description,
            touristAttractions: touristAttractions.length
              ? touristAttractions
              : [],
            population: record.fields.population || "N/A",
            area: record.fields.area || "N/A",
            festivals,
            captain: gov?.captain ?? "",
            phone: gov?.phone ?? "",
          },
        ];
      }),
    );
  }, [barangayPublicRecords, govBarangays]);

  const bgyData = barangayDataMap();

  const presentCategories = ORDERED_CATEGORIES.filter((cat) => {
    if (cat === "all") return true;
    return publicSpots.some((s) => s.fields.category === cat);
  });

  const sortedSpots = [...publicSpots].sort(
    (a, b) => (visitCounts[b.id] ?? 0) - (visitCounts[a.id] ?? 0),
  );

  const filteredSpots =
    activeCategory === "all"
      ? sortedSpots
      : sortedSpots.filter((s) => s.fields.category === activeCategory);

  // Keep selectedSpot in sync with updated data (e.g. after rating)
  useEffect(() => {
    if (!selectedSpot) return;
    const updated = publicSpots.find((s) => s.id === selectedSpot.id);
    if (updated) setSelectedSpot(updated);
  }, [publicSpots]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-blue-600/10 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24"
        >
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
            Explore the Natural &amp;
            <br className="hidden sm:block" /> Cultural Wonders
          </h1>
          <p className="mt-4 text-center text-sm text-gray-400 sm:text-base max-w-xl mx-auto leading-relaxed">
            From lush river landscapes to centuries-old heritage sites,
            Libmanan, Camarines Sur offers experiences waiting to be discovered.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-14">
            {[
              {
                label: "Tourist Spots",
                value: isLoading ? "—" : `${publicSpots.length}+`,
              },
              { label: "Local Delicacies", value: `${foodSpots.length}+` },
              { label: "Best Months", value: "Nov – Apr" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Category Filter ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-neutral-200 sticky top-[var(--navbar-h,96px)] z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-3">
            {presentCategories.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const Icon = cfg.icon;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                  ].join(" ")}
                >
                  <Icon className="text-xs" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Tourist Spots Grid ──────────────────────────────────────────────*/}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {activeCategory === "all"
                ? "All Tourist Spots"
                : CATEGORY_CONFIG[activeCategory].label}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {isLoading
                ? "Loading destinations…"
                : `${filteredSpots.length} destination${filteredSpots.length !== 1 ? "s" : ""} to explore`}
            </p>
          </div>
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SpotSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredSpots.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-neutral-400 text-sm">
                    No destinations in this category yet.
                  </div>
                ) : (
                  filteredSpots.map((spot, index) => {
                    const cfg =
                      CATEGORY_CONFIG[spot.fields.category] ??
                      CATEGORY_CONFIG.other;
                    const CategoryIcon = cfg.icon;
                    const barangayName =
                      spot.fields.barangayName || spot.fields.location || "";
                    return (
                      <motion.div
                        key={spot.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-neutral-300 cursor-pointer"
                        onClick={() => {
                          incrementVisit(spot.id);
                          setSelectedSpot(spot);
                        }}
                      >
                        <div
                          className={`h-44 flex items-end p-4 relative overflow-hidden ${cfg.gradient}`}
                        >
                          <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider">
                            <CategoryIcon className="text-[9px]" />
                            {cfg.label}
                          </span>
                          {spot.fields.averageRating && (
                            <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-yellow-300 text-xs font-bold">
                              <FaStar className="text-[9px]" />
                              {spot.fields.averageRating}
                              {spot.fields.ratingCount > 0 && (
                                <span className="text-white/70 text-[10px]">
                                  ({spot.fields.ratingCount})
                                </span>
                              )}
                            </span>
                          )}
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
                        <div className="p-5">
                          {barangayName && (
                            <div className="flex items-start gap-2 mb-3">
                              <FaMapMarkerAlt className="text-neutral-400 mt-0.5 shrink-0 text-xs" />
                              <span className="text-xs text-neutral-500">
                                {barangayName}
                              </span>
                            </div>
                          )}
                          {spot.fields.description && (
                            <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
                              {spot.fields.description}
                            </p>
                          )}
                          {spot.fields.tags && spot.fields.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {spot.fields.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {spot.fields.entryFee && (
                            <div className="mt-4 pt-3 border-t border-neutral-100">
                              <span className="text-xs text-neutral-500">
                                <span className="font-medium text-neutral-700">
                                  Entry:
                                </span>{" "}
                                {spot.fields.entryFee}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ── Local Food Spots ──────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                Local Food &amp; Delicacies
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Taste the authentic flavors of Libmanan
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <FaUtensils className="text-[10px]" /> {foodSpots.length}{" "}
              recommendations
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {foodSpots.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-orange-500">
                  <FaUtensils className="text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {food.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">
                    {food.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Travel Tips / FAQ ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl mb-6">
                Traveler's Tips
              </h2>
              <div className="space-y-4">
                {travelTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <motion.div
                      key={tip.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.07 }}
                      className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                        <Icon className="text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {tip.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.07 }}
                    className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-neutral-800">
                        {faq.question}
                      </span>
                      <FaChevronDown
                        className={`text-xs text-neutral-400 shrink-0 transition-transform duration-200 ${expandedFaq === faq.id ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed border-t border-neutral-100 pt-3">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Spot Detail Panel ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSpot && (
          <SpotDetailPanel
            spot={selectedSpot}
            myRating={myRatings[selectedSpot.id]}
            barangayData={bgyData}
            onClose={() => setSelectedSpot(null)}
            onRate={async (value) => {
              await rateSpot(selectedSpot.id, value);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

TourismPage.displayName = "TourismPage";
export default TourismPage;
