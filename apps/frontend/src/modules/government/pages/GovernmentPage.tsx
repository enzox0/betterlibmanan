import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaClock,
  FaBuilding,
  FaSearch,
  FaTimes,
  FaArrowRight,
  FaLandmark,
  FaGavel,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { LuInfo, LuCirclePlus } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useGovernmentStore } from "@/modules/admin/store/governmentStore";
import type { ContentRecord } from "@/modules/admin/types/admin.types";

// ─── Field accessor helpers ───────────────────────────────────────────────────

function f(record: ContentRecord, key: string, fallback = ""): string {
  return (record.fields as any)[key] ?? fallback;
}

function fArr(record: ContentRecord, key: string): string[] {
  return (record.fields as any)[key] ?? [];
}

// ─── Section constants ────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "executive", label: "Executive", icon: FaLandmark },
  { id: "legislative", label: "Legislative", icon: FaGavel },
  { id: "offices", label: "Offices", icon: FaBuilding },
  { id: "barangays", label: "Barangays", icon: FaMapMarkerAlt },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </motion.div>
  );
}

function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

// ─── No-data nudge ────────────────────────────────────────────────────────────

function NoDataNudge({ context }: { context: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-10 text-center"
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function GovernmentPage() {
  const {
    executive,
    legislative,
    offices,
    barangays,
    isExecutiveLoading,
    isLegislativeLoading,
    isOfficesLoading,
    isBarangaysLoading,
    fetchExecutive,
    fetchLegislative,
    fetchOffices,
    fetchBarangays,
  } = useGovernmentStore();

  const [barangaySearch, setBarangaySearch] = useState("");

  useEffect(() => {
    fetchExecutive();
    fetchLegislative();
    fetchOffices();
    fetchBarangays();
  }, []);

  const filteredBarangays = barangaySearch.trim()
    ? barangays.filter(
        (b) =>
          f(b, "name").toLowerCase().includes(barangaySearch.toLowerCase()) ||
          f(b, "captain").toLowerCase().includes(barangaySearch.toLowerCase()),
      )
    : barangays;

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              Government Structure
              <br className="hidden sm:block" /> & Officials
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
              Meet the leadership, offices, and barangay units serving Libmanan,
              Camarines Sur.
            </p>
          </div>

          {/* Quick-jump chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={11} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Stats strip */}
          <div className="mt-8 flex justify-center gap-8 sm:gap-12">
            {[
              { label: "Exec. Officials", value: executive.length },
              { label: "SB Members", value: legislative.length },
              { label: "Offices", value: offices.length },
              { label: "Barangays", value: barangays.length },
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

      {/* ── Executive Branch ──────────────────────────────────────────── */}
      <section id="executive" className="py-10 sm:py-14 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Executive Branch"
            subtitle="The executive officials leading Libmanan's governance"
          />
          {isExecutiveLoading ? (
            <SectionSkeleton count={2} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {executive.map((official, index) => (
                <motion.div
                  key={official.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="p-6">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                      <FaLandmark size={9} />
                      {f(official, "title")}
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-gray-900">
                      {f(official, "name")}
                    </h3>
                    <div className="mt-4 space-y-2.5 text-sm text-gray-600">
                      {f(official, "email") && (
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <FaEnvelope size={12} className="text-gray-400" />
                          </div>
                          <a
                            href={`mailto:${f(official, "email")}`}
                            className="truncate transition-colors hover:text-blue-600"
                          >
                            {f(official, "email")}
                          </a>
                        </div>
                      )}
                      {f(official, "phone") && (
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <FaPhone size={12} className="text-gray-400" />
                          </div>
                          <a
                            href={`tel:${f(official, "phone")}`}
                            className="transition-colors hover:text-blue-600"
                          >
                            {f(official, "phone")}
                          </a>
                        </div>
                      )}
                      {f(official, "hours") && (
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <FaClock size={12} className="text-gray-400" />
                          </div>
                          <span>{f(official, "hours")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {!isExecutiveLoading && executive.length === 0 && (
                <div className="col-span-full">
                  <NoDataNudge context="executive officials" />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Legislative Branch ────────────────────────────────────────── */}
      <section
        id="legislative"
        className="py-10 sm:py-14 bg-white scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Legislative Branch"
            subtitle="Sangguniang Bayan members of Libmanan"
          />
          {isLegislativeLoading ? (
            <SectionSkeleton count={6} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {legislative.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-600">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-0.5">
                      {f(member, "position")}
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {f(member, "name")}
                    </h3>
                    {fArr(member, "committees").length > 0 && (
                      <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                        {fArr(member, "committees").join(" · ")}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              {!isLegislativeLoading && legislative.length === 0 && (
                <div className="col-span-full">
                  <NoDataNudge context="legislative members" />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Municipal Offices ─────────────────────────────────────────── */}
      <section id="offices" className="py-10 sm:py-14 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Municipal Offices"
            subtitle="Department heads and key offices of Libmanan"
          />
          {isOfficesLoading ? (
            <SectionSkeleton count={9} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offices.map((office, index) => (
                <motion.div
                  key={office.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                      <FaBuilding size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">
                        {f(office, "name")}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                        {f(office, "description")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    {f(office, "phone") && (
                      <div className="flex items-center gap-1.5">
                        <FaPhone className="shrink-0 text-gray-400" size={10} />
                        <a
                          href={`tel:${f(office, "phone")}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {f(office, "phone")}
                        </a>
                      </div>
                    )}
                    {f(office, "email") && (
                      <div className="flex items-center gap-1.5">
                        <FaEnvelope
                          className="shrink-0 text-gray-400"
                          size={10}
                        />
                        <a
                          href={`mailto:${f(office, "email")}`}
                          className="truncate hover:text-blue-600 transition-colors"
                        >
                          {f(office, "email")}
                        </a>
                      </div>
                    )}
                  </div>
                  {f(office, "link") && (
                    <div className="mt-auto pt-3">
                      <Link
                        to={f(office, "link")}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View Services
                        <FaArrowRight
                          size={9}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </div>
                  )}
                </motion.div>
              ))}
              {!isOfficesLoading && offices.length === 0 && (
                <div className="col-span-full">
                  <NoDataNudge context="municipal offices" />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Barangay Units ────────────────────────────────────────────── */}
      <section id="barangays" className="py-10 sm:py-14 bg-white scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header + search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Barangay Units
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {barangays.length} barangays of Libmanan
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={11}
              />
              <input
                type="text"
                placeholder="Search barangay or captain…"
                value={barangaySearch}
                onChange={(e) => setBarangaySearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-8 pr-8 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
              <AnimatePresence>
                {barangaySearch && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setBarangaySearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={10} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {isBarangaysLoading ? (
            <SectionSkeleton count={8} />
          ) : (
            <AnimatePresence mode="wait">
              {filteredBarangays.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                >
                  {filteredBarangays.map((barangay, index) => (
                    <motion.div
                      key={barangay.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100">
                          <FaMapMarkerAlt
                            className="text-neutral-500"
                            size={11}
                          />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 leading-snug">
                          {f(barangay, "name")}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 mb-1.5">
                        {f(barangay, "captain")}
                      </p>
                      <a
                        href={`tel:${f(barangay, "phone")}`}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <FaPhone size={9} />
                        {f(barangay, "phone")}
                      </a>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {barangaySearch ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-neutral-300">
                        <FaSearch size={12} className="text-neutral-400" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-700 mb-1">
                        No barangays matched
                      </p>
                      <p className="text-xs text-neutral-400">
                        Try a different name or captain.
                      </p>
                      <button
                        onClick={() => setBarangaySearch("")}
                        className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Show all barangays
                      </button>
                    </div>
                  ) : (
                    <NoDataNudge context="barangays" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}

GovernmentPage.displayName = "GovernmentPage";
export default GovernmentPage;
