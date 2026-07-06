import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhone,
  FaSearch,
  FaTimes,
  FaShieldAlt,
  FaHospital,
  FaExclamationTriangle,
  FaFire,
  FaBuilding,
  FaBroadcastTower,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import { LuInfo, LuCirclePlus } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useContactStore } from "@/modules/admin/store/contactStore";
import { useEmergencyContactsStore } from "@/modules/admin/store/emergencyContactsStore";
import { useMedicalContactsStore } from "@/modules/admin/store/medicalContactsStore";
import { useOfficeDirectoryStore } from "@/modules/admin/store/officeDirectoryStore";
import { useSocialLinksStore } from "@/modules/admin/store/socialLinksStore";
import type { ContentRecord } from "@/modules/admin/types/admin.types";
import type { EmergencyContactCategory } from "@/modules/admin/services/emergency-contacts.api";
import type { SocialLinkPlatform } from "@/modules/admin/services/social-links.api";

// ─── Field accessor ───────────────────────────────────────────────────────────

function f(record: ContentRecord, key: string, fallback = ""): string {
  return (record.fields as any)[key] ?? fallback;
}

// ─── Category / platform metadata ────────────────────────────────────────────

const EMERGENCY_ACCENT: Record<EmergencyContactCategory, string> = {
  police: "bg-blue-600 text-white",
  disaster: "bg-amber-500 text-white",
  fire: "bg-red-600 text-white",
  welfare: "bg-teal-600 text-white",
  government: "bg-neutral-700 text-white",
  traffic: "bg-violet-600 text-white",
  medical: "bg-emerald-600 text-white",
  other: "bg-neutral-900 text-white",
};

const CATEGORY_ICON: Record<
  EmergencyContactCategory,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  police: FaShieldAlt,
  disaster: FaExclamationTriangle,
  fire: FaFire,
  welfare: FaHospital,
  government: FaBuilding,
  traffic: FaBroadcastTower,
  medical: FaHospital,
  other: FaBuilding,
};

const SOCIAL_ICON: Record<
  SocialLinkPlatform,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaPhone, // no TikTok icon in fa; fall back
  other: FaPhone,
};

const SOCIAL_HOVER: Record<SocialLinkPlatform, string> = {
  facebook: "hover:text-blue-600",
  twitter: "hover:text-gray-900",
  instagram: "hover:text-pink-600",
  youtube: "hover:text-red-600",
  tiktok: "hover:text-gray-900",
  other: "hover:text-gray-700",
};

// ─── Sections nav ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "contact-info", label: "Contact", icon: FaPhone },
  { id: "hotlines", label: "Hotlines", icon: FaShieldAlt },
  { id: "offices", label: "Offices", icon: FaBuilding },
];

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

// ─── Contact Page ─────────────────────────────────────────────────────────────

export function ContactPage() {
  const [officeSearch, setOfficeSearch] = useState("");

  const contactRecords = useContactStore((s) => s.publicRecords);
  const isContactLoading = useContactStore((s) => s.isPublicLoading);
  const fetchContacts = useContactStore((s) => s.fetchPublicRecords);

  const emergencyRecords = useEmergencyContactsStore((s) => s.publicRecords);
  const isEmergencyLoading = useEmergencyContactsStore(
    (s) => s.isPublicLoading,
  );
  const fetchEmergency = useEmergencyContactsStore((s) => s.fetchPublicRecords);

  const medicalRecords = useMedicalContactsStore((s) => s.publicRecords);
  const isMedicalLoading = useMedicalContactsStore((s) => s.isPublicLoading);
  const fetchMedical = useMedicalContactsStore((s) => s.fetchPublicRecords);

  const officeRecords = useOfficeDirectoryStore((s) => s.records);
  const isOfficesLoading = useOfficeDirectoryStore((s) => s.isLoading);
  const fetchOffices = useOfficeDirectoryStore((s) => s.fetchRecords);

  const socialRecords = useSocialLinksStore((s) => s.records);
  const fetchSocial = useSocialLinksStore((s) => s.fetchRecords);

  useEffect(() => {
    fetchContacts();
    fetchEmergency();
    fetchMedical();
    fetchOffices();
    fetchSocial();
  }, []);

  const filteredOffices = officeSearch.trim()
    ? officeRecords.filter((o) =>
        f(o, "name").toLowerCase().includes(officeSearch.toLowerCase()),
      )
    : officeRecords;

  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ────────────────────────────────────────────────────── */}
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
              Get in Touch
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
              The Municipal Government of Libmanan is here to serve you — for
              services, inquiries, and urgent assistance.
            </p>
          </div>

          {/* Contact chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {contactRecords.map((info) => {
              const type = f(info, "type");
              const Icon =
                type === "phone"
                  ? FaPhone
                  : type === "email"
                    ? FaPhone
                    : FaPhone;
              return (
                <a
                  key={info.id}
                  href={f(info, "href") || "#"}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={10} />
                  {f(info, "value")}
                </a>
              );
            })}
          </div>

          {/* Quick-jump chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-400 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={10} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { label: "Contact Channels", value: contactRecords.length },
              {
                label: "Emergency Hotlines",
                value: emergencyRecords.length + medicalRecords.length,
              },
              { label: "Offices", value: officeRecords.length },
              { label: "Social Channels", value: socialRecords.length },
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

      {/* ── Contact Info Cards ──────────────────────────────────────── */}
      <section id="contact-info" className="py-10 sm:py-14 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Contact Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Primary channels to reach the Municipal Government
            </p>
          </motion.div>

          {isContactLoading && contactRecords.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : contactRecords.length === 0 ? (
            <NoDataNudge context="contact information" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactRecords.map((info, index) => (
                <motion.a
                  key={info.id}
                  href={f(info, "href") || "#"}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                    <FaPhone size={14} />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-1">
                    {f(info, "label")}
                  </p>
                  <p className="text-sm font-bold text-gray-900 break-words leading-snug">
                    {f(info, "value")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {f(info, "description")}
                  </p>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Hotlines ────────────────────────────────────────────────── */}
      <section id="hotlines" className="py-10 sm:py-14 bg-white scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Emergency Hotlines
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              For emergencies and urgent situations — available anytime
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* General Emergency */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                <h3 className="text-sm font-bold text-gray-900">
                  General Emergency
                </h3>
                <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
                  {emergencyRecords.length} lines
                </span>
              </div>
              {isEmergencyLoading && emergencyRecords.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : emergencyRecords.length === 0 ? (
                <NoDataNudge context="emergency hotlines" />
              ) : (
                <div className="space-y-2">
                  {emergencyRecords.map((contact, index) => {
                    const cat =
                      (f(contact, "category") as EmergencyContactCategory) ||
                      "other";
                    const Icon = CATEGORY_ICON[cat];
                    const accent = EMERGENCY_ACCENT[cat];
                    return (
                      <motion.a
                        key={contact.id}
                        href={`tel:${f(contact, "number").replace(/\s/g, "")}`}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: index * 0.05 }}
                        className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900">
                            {f(contact, "name")}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {f(contact, "description")}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-gray-900 tabular-nums">
                            {f(contact, "number")}
                          </p>
                          <p className="text-[10px] text-blue-600 font-medium group-hover:underline">
                            Call now
                          </p>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Medical + Social */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Medical Emergency
                </h3>
                <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {medicalRecords.length} lines
                </span>
              </div>
              {isMedicalLoading && medicalRecords.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : medicalRecords.length === 0 ? (
                <NoDataNudge context="medical hotlines" />
              ) : (
                <div className="space-y-2">
                  {medicalRecords.map((contact, index) => (
                    <motion.a
                      key={contact.id}
                      href={`tel:${f(contact, "number").replace(/\s/g, "")}`}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.07 }}
                      className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 transition-all duration-200 hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                        <FaHospital size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">
                          {f(contact, "name")}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {f(contact, "description")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-emerald-600 tabular-nums">
                          {f(contact, "number")}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium group-hover:underline">
                          Call now
                        </p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}

              {/* Social links */}
              {socialRecords.length > 0 && (
                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    Follow on Social Media
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Stay updated with announcements and community news
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {socialRecords.map((link) => {
                      const platform =
                        (f(link, "platform") as SocialLinkPlatform) || "other";
                      const Icon = SOCIAL_ICON[platform];
                      const hoverColor = SOCIAL_HOVER[platform];
                      return (
                        <a
                          key={link.id}
                          href={f(link, "href")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:border-neutral-300 hover:shadow-sm ${hoverColor}`}
                        >
                          <Icon size={13} />
                          {f(link, "name")}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Office Directory ─────────────────────────────────────────── */}
      <section id="offices" className="py-10 sm:py-14 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Office Directory
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Direct contact numbers for all {officeRecords.length} municipal
                offices
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={11}
              />
              <input
                type="text"
                placeholder="Search office…"
                value={officeSearch}
                onChange={(e) => setOfficeSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-8 pr-8 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
              <AnimatePresence>
                {officeSearch && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setOfficeSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={10} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {isOfficesLoading && officeRecords.length === 0 ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : officeRecords.length === 0 ? (
            <NoDataNudge context="office directory entries" />
          ) : (
            <AnimatePresence mode="wait">
              {filteredOffices.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                >
                  {filteredOffices.map((office, index) => (
                    <motion.a
                      key={office.id}
                      href={`tel:${f(office, "number").replace(/\s/g, "")}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.02 }}
                      className="group flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                        <FaPhone size={11} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                          {f(office, "name")}
                        </p>
                        <p className="mt-1 text-xs font-medium text-blue-600 tabular-nums">
                          {f(office, "number")}
                        </p>
                      </div>
                    </motion.a>
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
                    No offices matched
                  </p>
                  <p className="text-xs text-neutral-400">
                    Try a different office name.
                  </p>
                  <button
                    onClick={() => setOfficeSearch("")}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Show all offices
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}

ContactPage.displayName = "ContactPage";
export default ContactPage;
