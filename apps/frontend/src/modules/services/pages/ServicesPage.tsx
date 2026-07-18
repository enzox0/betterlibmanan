import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { FaSearch, FaTimes, FaArrowRight } from "react-icons/fa";
import { LuRefreshCw, LuInfo, LuCirclePlus } from "react-icons/lu";
import { useServicesStore } from "@/modules/admin/store/servicesStore";
import { resolveIcon } from "../utils/iconMap";
import type {
  ServiceCategoryRecord,
  LifeEventRecord,
} from "@/modules/admin/services/services.api";

// ─── Tab definitions ───────────────────────────────────────────────────────────

// "All" tab is null; category tabs are built dynamically from API data
type TabSlug = string | null;

// ─── Flattened service shape ───────────────────────────────────────────────────

interface FlatService {
  id: string;
  title: string;
  description: string;
  fee?: string;
  processingTime?: string;
  link?: string;
  requirements: string[];
  steps: string[];
  categorySlug: string;
  categoryTitle: string;
  categoryIconKey: string;
}

function flattenCategories(categories: ServiceCategoryRecord[]): FlatService[] {
  return categories.flatMap((cat) =>
    cat.services.map((s) => ({
      ...s,
      categorySlug: cat.slug,
      categoryTitle: cat.title,
      categoryIconKey: cat.iconKey,
    })),
  );
}

// ─── Skeleton components ───────────────────────────────────────────────────────

function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5 h-44"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-gray-200 shrink-0" />
            <div className="h-3 w-24 rounded bg-gray-200 mt-1" />
          </div>
          <div className="h-4 w-2/3 rounded bg-gray-200 mb-2" />
          <div className="h-3 w-full rounded bg-gray-100 mb-1.5" />
          <div className="h-3 w-4/5 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function SkeletonLifeEvents({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4 h-24 flex flex-col items-center gap-2"
        >
          <div className="h-10 w-10 rounded-lg bg-gray-200" />
          <div className="h-3 w-3/4 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

// ─── "No data" nudge ──────────────────────────────────────────────────────────

function NoDataNudge({ context }: { context: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <LuInfo className="h-6 w-6 text-blue-500" />
      </div>
      <p className="text-sm font-semibold text-blue-800 mb-1">
        No {context} available yet
      </p>
      <p className="text-xs text-blue-600 max-w-xs mx-auto leading-relaxed mb-4">
        This section doesn't have any data yet. Would you like to contribute or
        add information?
      </p>
      <Link
        to="/admin/register"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
      >
        <LuCirclePlus className="h-3.5 w-3.5" />
        Add Information
      </Link>
    </motion.div>
  );
}

// ─── ServicesPage ──────────────────────────────────────────────────────────────

export function ServicesPage() {
  const publicCategories = useServicesStore((s) => s.publicCategories);
  const publicLifeEvents = useServicesStore((s) => s.publicLifeEvents);
  const isLoading = useServicesStore((s) => s.isPublicCategoriesLoading);
  const isLifeEventsLoading = useServicesStore(
    (s) => s.isPublicLifeEventsLoading,
  );
  const fetchPublicCategories = useServicesStore(
    (s) => s.fetchPublicCategories,
  );
  const fetchPublicLifeEvents = useServicesStore(
    (s) => s.fetchPublicLifeEvents,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabSlug>(null);
  const [activeLifeEvent, setActiveLifeEvent] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchPublicCategories().catch(() => {});
    fetchPublicLifeEvents().catch(() => {});
  }, []);

  // Pre-fill search from ?q= query param (e.g. coming from HeroSection)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
      setActiveTab(null);
      setActiveLifeEvent(null);
    }
  }, [searchParams]);

  // Build the flattened service list from live categories
  const allServices = useMemo(
    () => flattenCategories(publicCategories),
    [publicCategories],
  );

  // Build tab list dynamically
  const TABS = useMemo(
    () => [
      { label: "All", slug: null as TabSlug },
      ...publicCategories.map((c) => ({
        label: c.title,
        slug: c.slug as TabSlug,
      })),
    ],
    [publicCategories],
  );

  // Derive visible services
  const displayedServices = useMemo(() => {
    let pool = allServices;

    if (activeTab !== null) {
      pool = pool.filter((s) => s.categorySlug === activeTab);
    }

    if (activeLifeEvent && !searchQuery.trim()) {
      const event = publicLifeEvents.find((e) => e.id === activeLifeEvent);
      if (event) {
        pool = pool.filter((s) => event.serviceIds.includes(s.id));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.categoryTitle.toLowerCase().includes(q),
      );
    }

    return pool;
  }, [searchQuery, activeTab, activeLifeEvent, allServices, publicLifeEvents]);

  const isSearching = searchQuery.trim().length > 0;
  const isLifeEventActive = !!activeLifeEvent && !isSearching;

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTab(null);
    setActiveLifeEvent(null);
  };

  // Active life event label for display
  const activeLifeEventLabel = publicLifeEvents.find(
    (e) => e.id === activeLifeEvent,
  )?.title;

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
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
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20"
        >
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
            Find the Service
            <br className="hidden sm:block" /> You Need
          </h1>
          <p className="mt-3 text-center text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
            Explore all available municipal services for the people of Libmanan,
            Camarines Sur.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 pointer-events-none" />
              <FaSearch
                size={13}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />
              <input
                type="text"
                placeholder="Search services — e.g. birth certificate, business permit…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveLifeEvent(null);
                }}
                className="relative z-10 w-full pl-11 pr-10 py-3.5 rounded-xl bg-transparent border border-transparent text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                  >
                    <FaTimes size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* ── Life Events ── */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                Browse by Life Event
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Find services based on what's happening in your life
              </p>
            </div>

            {isLifeEventsLoading && publicLifeEvents.length === 0 ? (
              <SkeletonLifeEvents />
            ) : publicLifeEvents.length === 0 ? (
              <NoDataNudge context="life events" />
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                {publicLifeEvents.map((event, index) => {
                  const Icon = resolveIcon(event.iconKey);
                  const isActive = activeLifeEvent === event.id;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.04 }}
                    >
                      <button
                        onClick={() => {
                          setActiveLifeEvent(isActive ? null : event.id);
                          setSearchQuery("");
                          setActiveTab(null);
                        }}
                        className={[
                          "w-full flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all duration-200",
                          isActive
                            ? "border-neutral-900 bg-neutral-900 text-white shadow-lg shadow-neutral-400/20"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:shadow-sm",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                            isActive
                              ? "border-white/10 bg-white/10 text-white"
                              : "border-neutral-200 bg-neutral-100 text-neutral-600",
                          ].join(" ")}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          className={[
                            "text-xs font-semibold leading-snug",
                            isActive ? "text-white" : "text-neutral-800",
                          ].join(" ")}
                        >
                          {event.title}
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── All Services ── */}
          <div id="all-services">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                  {isSearching
                    ? `${displayedServices.length} result${displayedServices.length !== 1 ? "s" : ""} for "${searchQuery}"`
                    : isLifeEventActive
                      ? `${displayedServices.length} service${displayedServices.length !== 1 ? "s" : ""} for "${activeLifeEventLabel}"`
                      : activeTab !== null
                        ? `${TABS.find((t) => t.slug === activeTab)?.label ?? ""} — ${displayedServices.length} service${displayedServices.length !== 1 ? "s" : ""}`
                        : `All Services — ${allServices.length}`}
                </h2>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {isSearching || isLifeEventActive || activeTab !== null
                    ? "Showing filtered results"
                    : "Every municipal service available in Libmanan"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    fetchPublicCategories().catch(() => {});
                    fetchPublicLifeEvents().catch(() => {});
                  }}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
                  title="Refresh"
                >
                  <LuRefreshCw size={14} />
                </button>
                {(isSearching || isLifeEventActive || activeTab !== null) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <FaTimes size={11} />
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Inline tab bar (built from live categories) */}
            {!isLoading && publicCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActiveTab(tab.slug);
                      setSearchQuery("");
                      setActiveLifeEvent(null);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      activeTab === tab.slug
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && allServices.length === 0 && <SkeletonCards />}

            {/* No categories at all */}
            {!isLoading && publicCategories.length === 0 && (
              <NoDataNudge context="services" />
            )}

            {/* Services grid */}
            {!isLoading && publicCategories.length > 0 && (
              <AnimatePresence mode="wait">
                {displayedServices.length > 0 ? (
                  <motion.div
                    key={`${activeTab}-${searchQuery}-${activeLifeEvent}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {displayedServices.map((service, index) => {
                      const CategoryIcon = resolveIcon(service.categoryIconKey);
                      const hasDetails =
                        (service.requirements?.length ?? 0) > 0 ||
                        (service.steps?.length ?? 0) > 0;
                      const isEmpty =
                        !service.fee && !service.processingTime && !hasDetails;

                      return (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                        >
                          <Link
                            to={`/services/${service.categorySlug}`}
                            className="group flex flex-col h-full rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600">
                                <CategoryIcon size={14} />
                              </div>
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mt-0.5">
                                {service.categoryTitle}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </h3>
                            <p className="text-sm text-neutral-500 leading-relaxed flex-1">
                              {service.description}
                            </p>

                            {/* "No data yet" nudge for empty services */}
                            {isEmpty && (
                              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-2 text-[11px] text-amber-700">
                                <LuInfo className="h-3.5 w-3.5 shrink-0" />
                                No details yet — want to contribute?
                              </div>
                            )}

                            {(service.fee || service.processingTime) && (
                              <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap gap-x-4 gap-y-1">
                                {service.fee && (
                                  <span className="text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-700">
                                      Fee:
                                    </span>{" "}
                                    {service.fee}
                                  </span>
                                )}
                                {service.processingTime && (
                                  <span className="text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-700">
                                      Processing:
                                    </span>{" "}
                                    {service.processingTime}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600">
                              View details
                              <FaArrowRight
                                size={10}
                                className="transition-transform group-hover:translate-x-1"
                              />
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-neutral-200 bg-white p-10 text-center"
                  >
                    <div className="mx-auto w-12 h-12 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center mb-4">
                      <FaSearch size={14} className="text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700 mb-1">
                      Nothing matched your search
                    </p>
                    <p className="text-xs text-neutral-400">
                      Try different keywords or select a different category.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Show all services
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

ServicesPage.displayName = "ServicesPage";

export default ServicesPage;
