import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaBalanceScale,
  FaSearch,
  FaTimes,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { mockLegislativeData } from "../data/mockData";
import CountUp from "@/shared/ui/CountUp";
import { ListRowSkeleton, Pagination } from "@/shared/ui";

const PAGE_SIZE = 20;

export function ResolutionFrameworkPage() {
  const data = mockLegislativeData.resolution;
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = data.documents.filter((doc) => {
    const matchesSearch =
      !search.trim() ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.number.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleTypeChange(type: string | null) {
    setActiveType(type);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
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
          {/* Back link */}
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
              Resolution Framework
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
              Resolutions passed by the Sangguniang Bayan ng Libmanan, Camarines
              Sur.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              {/* backdrop blur lives on its own layer so it doesn't bleed onto the icon */}
              <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 pointer-events-none" />
              <FaSearch
                size={13}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />
              <input
                type="text"
                placeholder="Search resolutions by title or number…"
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
              { label: "Total Resolutions", value: data.documents.length },
              { label: "Types", value: data.types.length },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">
                  <CountUp
                    from={0}
                    to={stat.value}
                    duration={1.5}
                    delay={0.3}
                  />
                </p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Definition + Types ────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Definition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neutral-600 to-neutral-900" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600">
                <FaBalanceScale size={15} />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-2">
                What is a Resolution?
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {data.definition}
              </p>
            </motion.div>

            {/* Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Types of Resolutions
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Filter documents by resolution type
              </p>
              <div className="flex flex-wrap gap-2">
                {data.types.map((type, index) => {
                  const isActive = activeType === type;
                  return (
                    <motion.button
                      key={type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      onClick={() => handleTypeChange(isActive ? null : type)}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                        isActive
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100",
                      ].join(" ")}
                    >
                      {type}
                    </motion.button>
                  );
                })}
              </div>
              {activeType && (
                <button
                  onClick={() => handleTypeChange(null)}
                  className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={9} /> Clear filter
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Documents ─────────────────────────────────────────────────── */}
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
                2025 Resolutions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {filtered.length > 0
                  ? `${filtered.length} resolution${filtered.length !== 1 ? "s" : ""}${search || activeType ? " matched" : ""}`
                  : "No resolutions matched"}
              </p>
            </div>
            <a
              href={data.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              View all on official portal
              <FaExternalLinkAlt size={9} />
            </a>
          </motion.div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
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
                    key={doc.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                  >
                    <FaCheckCircle
                      className="mt-0.5 shrink-0 text-neutral-400"
                      size={14}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                        <span className="text-[11px] font-bold text-neutral-600 tabular-nums">
                          #{doc.number}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {doc.sessionDate}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {doc.title}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
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
                  No resolutions matched
                </p>
                <p className="text-xs text-neutral-400">
                  Try a different keyword or clear the filter.
                </p>
                <button
                  onClick={() => {
                    handleSearchChange("");
                    handleTypeChange(null);
                  }}
                  className="mt-3 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Show all resolutions
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
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

ResolutionFrameworkPage.displayName = "ResolutionFrameworkPage";

export default ResolutionFrameworkPage;
