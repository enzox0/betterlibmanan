import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaScroll,
  FaSearch,
  FaTimes,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { LuInfo, LuCirclePlus } from "react-icons/lu";
import {
  fetchLegislativeSettings,
  fetchOrdinances,
  type PublicLegislativeSettings,
  type PublicLegislativeDoc,
} from "../api/legislative.public.api";
import { ListRowSkeleton, Pagination } from "@/shared/ui";

const PAGE_SIZE = 20;

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

export function OrdinanceFrameworkPage() {
  const [settings, setSettings] = useState<PublicLegislativeSettings | null>(
    null,
  );
  const [docs, setDocs] = useState<PublicLegislativeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchLegislativeSettings(), fetchOrdinances()])
      .then(([s, ords]) => {
        if (cancelled) return;
        setSettings(s);
        setDocs(ords);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = docs.filter((doc) => {
    const matchesSearch =
      !search.trim() ||
      doc.fields.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.fields.number.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !activeCategory ||
      doc.fields.title.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setPage(1);
  }

  const categories = settings?.ordinanceCategories ?? [];

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
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
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20"
        >
          <Link
            to="/legislative"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white"
          >
            <FaArrowLeft size={10} />
            Legislative
          </Link>

          <div className="text-center">
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 backdrop-blur-sm mb-4">
              Sangguniang Bayan ng Libmanan
            </span>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              Ordinance Framework
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
              Municipal ordinances enacted by the Sangguniang Bayan ng Libmanan,
              Camarines Sur.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 pointer-events-none" />
              <FaSearch
                size={13}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />
              <input
                type="text"
                placeholder="Search ordinances by title or number…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="relative z-10 w-full pl-11 pr-10 py-3.5 rounded-xl bg-transparent border border-transparent text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FaTimes size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { label: "Total Ordinances", value: docs.length },
              { label: "Categories", value: categories.length },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Definition + Categories ──────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Definition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-700" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600">
                <FaScroll size={15} />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                What is an Ordinance?
              </h2>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-2.5 w-full rounded bg-gray-200" />
                  <div className="h-2.5 w-full rounded bg-gray-100" />
                  <div className="h-2.5 w-4/5 rounded bg-gray-100" />
                </div>
              ) : (
                <p className="text-sm text-gray-500 leading-relaxed">
                  {settings?.ordinanceDefinition ?? "—"}
                </p>
              )}
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Categories
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Filter documents by ordinance category
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, index) => {
                  const isActive = activeCategory === cat;
                  return (
                    <motion.button
                      key={cat}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      onClick={() =>
                        handleCategoryChange(isActive ? null : cat)
                      }
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100",
                      ].join(" ")}
                    >
                      {cat}
                    </motion.button>
                  );
                })}
              </div>
              {activeCategory && (
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={9} /> Clear filter
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Documents ────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Ordinances
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {filtered.length > 0
                  ? `${filtered.length} ordinance${filtered.length !== 1 ? "s" : ""}${search || activeCategory ? " matched" : ""}`
                  : "No ordinances matched"}
              </p>
            </div>
            {settings?.ordinanceExternalLink && (
              <a
                href={settings.ordinanceExternalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all on official portal
                <FaExternalLinkAlt size={9} />
              </a>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListRowSkeleton key={i} />
                ))}
              </motion.div>
            ) : filtered.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {paginated.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                  >
                    <FaCheckCircle
                      className="mt-0.5 shrink-0 text-blue-500"
                      size={14}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                        <span className="text-[11px] font-bold text-blue-600 tabular-nums">
                          #{doc.fields.number}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {doc.fields.sessionDate}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {doc.fields.title}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : docs.length === 0 ? (
              /* ── No content yet (backend has no ordinances) ── */
              <NoDataNudge context="ordinances" />
            ) : (
              /* ── No search / filter match ── */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-neutral-200 bg-white p-10 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-neutral-300">
                  <FaSearch size={12} className="text-neutral-400" />
                </div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  No ordinances matched
                </p>
                <p className="text-xs text-neutral-400">
                  Try a different keyword or clear the filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory(null);
                    setPage(1);
                  }}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Show all ordinances
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

OrdinanceFrameworkPage.displayName = "OrdinanceFrameworkPage";

export default OrdinanceFrameworkPage;
