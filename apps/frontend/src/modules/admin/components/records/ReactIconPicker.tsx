import { useState, useMemo, useRef, useEffect } from "react";
import { LuSearch, LuX, LuBox } from "react-icons/lu";
import * as Fa from "react-icons/fa";
import * as Md from "react-icons/md";
import * as Hi from "react-icons/hi";
import * as Hi2 from "react-icons/hi2";
import * as Bs from "react-icons/bs";
import * as Tb from "react-icons/tb";
import * as Lu from "react-icons/lu";

// ─── Pack map ──────────────────────────────────────────────────────────────────
type IconMod = Record<string, React.ComponentType<{ className?: string }>>;

const PACKS: Record<string, IconMod> = {
  fa: Fa as unknown as IconMod,
  md: Md as unknown as IconMod,
  hi: Hi as unknown as IconMod,
  hi2: Hi2 as unknown as IconMod,
  bs: Bs as unknown as IconMod,
  tb: Tb as unknown as IconMod,
  lu: Lu as unknown as IconMod,
};

// ─── Resolver ──────────────────────────────────────────────────────────────────
/**
 * Resolve a stored icon id (e.g. "fa:FaUsers") → React component.
 * Also handles legacy bare kebab-case names (e.g. "users" → lu:LuUsers).
 */
export function resolveIcon(
  id: string,
): React.ComponentType<{ className?: string }> {
  if (!id) return LuBox;

  let pack: string;
  let name: string;

  if (id.includes(":")) {
    [pack, name] = id.split(":", 2);
  } else {
    // Legacy: bare kebab-case → try lu:Lu<PascalCase>
    pack = "lu";
    name =
      "Lu" +
      id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
  }

  const mod = PACKS[pack];
  if (!mod) return LuBox;
  return (mod[name] as React.ComponentType<{ className?: string }>) ?? LuBox;
}

// ─── Icon registry ─────────────────────────────────────────────────────────────
export interface IconEntry {
  id: string; // "pack:ComponentName"  e.g. "fa:FaUsers"
  label: string; // human-readable label used for search
  category: string;
}

export const ICONS: IconEntry[] = [
  // ── People & community ───────────────────────────────────────────────────────
  { id: "fa:FaUsers", label: "users / people", category: "People" },
  { id: "fa:FaUserTie", label: "user tie / official", category: "People" },
  { id: "fa:FaChild", label: "child / youth", category: "People" },
  { id: "fa:FaBaby", label: "baby / infant", category: "People" },
  {
    id: "fa:FaHandshake",
    label: "handshake / partnership",
    category: "People",
  },
  { id: "hi2:HiMiniUsers", label: "users group", category: "People" },
  { id: "md:MdPeople", label: "people / community", category: "People" },
  { id: "md:MdPerson", label: "person / individual", category: "People" },
  { id: "md:MdFamilyRestroom", label: "family", category: "People" },
  { id: "md:MdElderly", label: "elderly / senior", category: "People" },
  {
    id: "md:MdPregnantWoman",
    label: "pregnant / maternal",
    category: "People",
  },
  { id: "md:MdAccessible", label: "accessible / pwd", category: "People" },

  // ── Buildings & places ───────────────────────────────────────────────────────
  { id: "fa:FaBuilding", label: "building / office", category: "Buildings" },
  { id: "fa:FaLandmark", label: "landmark / capitol", category: "Buildings" },
  { id: "fa:FaHome", label: "home / house", category: "Buildings" },
  { id: "fa:FaWarehouse", label: "warehouse / storage", category: "Buildings" },
  {
    id: "hi:HiOfficeBuilding",
    label: "office building",
    category: "Buildings",
  },
  { id: "hi2:HiMiniBuildingOffice2", label: "office 2", category: "Buildings" },
  {
    id: "md:MdLocationCity",
    label: "city / municipality",
    category: "Buildings",
  },
  {
    id: "md:MdApartment",
    label: "apartment / residential",
    category: "Buildings",
  },
  { id: "bs:BsBuilding", label: "building outline", category: "Buildings" },
  { id: "md:MdVilla", label: "villa / chapel", category: "Buildings" },

  // ── Land & geography ─────────────────────────────────────────────────────────
  {
    id: "fa:FaMapMarkedAlt",
    label: "map marked / area",
    category: "Geography",
  },
  { id: "fa:FaMapMarker", label: "map marker / pin", category: "Geography" },
  { id: "fa:FaMap", label: "map", category: "Geography" },
  { id: "fa:FaGlobeAsia", label: "globe asia", category: "Geography" },
  { id: "bs:BsGeoAlt", label: "geo alt / location", category: "Geography" },
  { id: "md:MdTerrain", label: "terrain / land", category: "Geography" },
  { id: "md:MdPlace", label: "place / marker", category: "Geography" },
  { id: "tb:TbMapPin", label: "map pin", category: "Geography" },
  { id: "tb:TbRuler", label: "ruler / area", category: "Geography" },
  { id: "tb:TbRuler2", label: "ruler 2 / measure", category: "Geography" },
  { id: "md:MdSquareFoot", label: "sq foot / area", category: "Geography" },

  // ── Government & awards ──────────────────────────────────────────────────────
  { id: "fa:FaAward", label: "award / honor", category: "Government" },
  { id: "fa:FaMedal", label: "medal", category: "Government" },
  { id: "fa:FaShieldAlt", label: "shield / security", category: "Government" },
  {
    id: "fa:FaBalanceScale",
    label: "balance scale / justice",
    category: "Government",
  },
  { id: "fa:FaGavel", label: "gavel / law", category: "Government" },
  { id: "fa:FaFlag", label: "flag", category: "Government" },
  {
    id: "hi:HiBadgeCheck",
    label: "badge check / verified",
    category: "Government",
  },
  {
    id: "hi:HiIdentification",
    label: "id / identification",
    category: "Government",
  },
  { id: "md:MdGavel", label: "gavel", category: "Government" },
  { id: "md:MdStars", label: "stars / class", category: "Government" },
  { id: "md:MdVerified", label: "verified / class", category: "Government" },
  { id: "bs:BsTrophyFill", label: "trophy", category: "Government" },

  // ── Health & welfare ─────────────────────────────────────────────────────────
  { id: "fa:FaHospital", label: "hospital / health", category: "Health" },
  { id: "fa:FaHospitalAlt", label: "hospital alt", category: "Health" },
  { id: "fa:FaAmbulance", label: "ambulance", category: "Health" },
  { id: "fa:FaHeartbeat", label: "heartbeat / health", category: "Health" },
  { id: "fa:FaPills", label: "pills / medicine", category: "Health" },
  { id: "fa:FaUserMd", label: "doctor / physician", category: "Health" },
  { id: "md:MdLocalHospital", label: "local hospital", category: "Health" },
  {
    id: "md:MdHealthAndSafety",
    label: "health and safety",
    category: "Health",
  },
  { id: "md:MdMedicalServices", label: "medical services", category: "Health" },
  { id: "md:MdVaccines", label: "vaccines", category: "Health" },

  // ── Education ────────────────────────────────────────────────────────────────
  {
    id: "fa:FaGraduationCap",
    label: "graduation / education",
    category: "Education",
  },
  { id: "fa:FaSchool", label: "school / building", category: "Education" },
  { id: "fa:FaBookOpen", label: "book open / literacy", category: "Education" },
  {
    id: "fa:FaChalkboardTeacher",
    label: "teacher / class",
    category: "Education",
  },
  { id: "md:MdSchool", label: "school", category: "Education" },
  { id: "md:MdMenuBook", label: "menu book", category: "Education" },
  { id: "md:MdLibraryBooks", label: "library books", category: "Education" },
  { id: "md:MdScience", label: "science / stem", category: "Education" },

  // ── Finance & economy ────────────────────────────────────────────────────────
  { id: "fa:FaMoneyBill", label: "money bill / budget", category: "Finance" },
  {
    id: "fa:FaMoneyBillWave",
    label: "money wave / funds",
    category: "Finance",
  },
  { id: "fa:FaCoins", label: "coins / revenue", category: "Finance" },
  { id: "fa:FaChartBar", label: "chart bar / stats", category: "Finance" },
  { id: "fa:FaChartPie", label: "chart pie / breakdown", category: "Finance" },
  { id: "fa:FaChartLine", label: "chart line / growth", category: "Finance" },
  { id: "fa:FaBriefcase", label: "briefcase / business", category: "Finance" },
  {
    id: "fa:FaCreditCard",
    label: "credit card / payment",
    category: "Finance",
  },
  { id: "md:MdTrendingUp", label: "trending up / growth", category: "Finance" },
  {
    id: "md:MdAttachMoney",
    label: "money / peso / finance",
    category: "Finance",
  },
  {
    id: "md:MdAccountBalance",
    label: "account balance / bank",
    category: "Finance",
  },
  { id: "md:MdBarChart", label: "bar chart", category: "Finance" },

  // ── Infrastructure ───────────────────────────────────────────────────────────
  {
    id: "fa:FaRoad",
    label: "road / infrastructure",
    category: "Infrastructure",
  },
  { id: "fa:FaTruck", label: "truck / transport", category: "Infrastructure" },
  { id: "fa:FaBus", label: "bus / transit", category: "Infrastructure" },
  { id: "fa:FaWater", label: "water / supply", category: "Infrastructure" },
  { id: "fa:FaBolt", label: "bolt / electricity", category: "Infrastructure" },
  {
    id: "fa:FaHardHat",
    label: "hard hat / construction",
    category: "Infrastructure",
  },
  { id: "fa:FaWrench", label: "wrench / repair", category: "Infrastructure" },
  {
    id: "md:MdConstruction",
    label: "construction",
    category: "Infrastructure",
  },
  {
    id: "md:MdDirectionsBus",
    label: "directions bus",
    category: "Infrastructure",
  },
  {
    id: "md:MdLocalGasStation",
    label: "gas station",
    category: "Infrastructure",
  },
  {
    id: "md:MdElectricalServices",
    label: "electrical services",
    category: "Infrastructure",
  },
  {
    id: "md:MdPlumbing",
    label: "plumbing / water",
    category: "Infrastructure",
  },

  // ── Agriculture & environment ────────────────────────────────────────────────
  { id: "fa:FaSeedling", label: "seedling / farming", category: "Environment" },
  { id: "fa:FaTree", label: "tree / environment", category: "Environment" },
  { id: "fa:FaLeaf", label: "leaf / ecology", category: "Environment" },
  { id: "fa:FaMountain", label: "mountain / terrain", category: "Environment" },
  { id: "fa:FaFish", label: "fish / fishery", category: "Environment" },
  {
    id: "fa:FaTractor",
    label: "tractor / agriculture",
    category: "Environment",
  },
  { id: "fa:FaSun", label: "sun / solar", category: "Environment" },
  {
    id: "fa:FaCloudRain",
    label: "cloud rain / weather",
    category: "Environment",
  },
  { id: "md:MdPark", label: "park / nature", category: "Environment" },
  {
    id: "md:MdWaterDrop",
    label: "water drop / hydro",
    category: "Environment",
  },

  // ── Communication & social ───────────────────────────────────────────────────
  { id: "fa:FaPhone", label: "phone / contact", category: "Communication" },
  { id: "fa:FaEnvelope", label: "envelope / email", category: "Communication" },
  {
    id: "fa:FaBullhorn",
    label: "bullhorn / announce",
    category: "Communication",
  },
  {
    id: "fa:FaNewspaper",
    label: "newspaper / news",
    category: "Communication",
  },
  { id: "fa:FaWifi", label: "wifi / internet", category: "Communication" },
  {
    id: "md:MdCampaign",
    label: "campaign / announce",
    category: "Communication",
  },
  {
    id: "md:MdNotifications",
    label: "notifications / alert",
    category: "Communication",
  },
  { id: "md:MdEmail", label: "email / mail", category: "Communication" },

  // ── Documents & services ─────────────────────────────────────────────────────
  { id: "fa:FaFileAlt", label: "file alt / document", category: "Documents" },
  {
    id: "fa:FaClipboardList",
    label: "clipboard list / form",
    category: "Documents",
  },
  { id: "fa:FaIdCard", label: "id card", category: "Documents" },
  { id: "fa:FaPassport", label: "passport / id", category: "Documents" },
  {
    id: "fa:FaFileSignature",
    label: "file signature / permit",
    category: "Documents",
  },
  { id: "fa:FaReceipt", label: "receipt / clearance", category: "Documents" },
  { id: "fa:FaCertificate", label: "certificate", category: "Documents" },
  { id: "md:MdDescription", label: "description / doc", category: "Documents" },
  { id: "md:MdAssignment", label: "assignment / form", category: "Documents" },
  {
    id: "md:MdFolderOpen",
    label: "folder open / records",
    category: "Documents",
  },
  { id: "md:MdArticle", label: "article / content", category: "Documents" },
  { id: "md:MdPrint", label: "print / printing", category: "Documents" },

  // ── Safety & emergency ───────────────────────────────────────────────────────
  {
    id: "fa:FaFireExtinguisher",
    label: "fire extinguisher",
    category: "Safety",
  },
  { id: "fa:FaFireAlt", label: "fire / hazard", category: "Safety" },
  {
    id: "fa:FaBroadcastTower",
    label: "broadcast tower / radio / R2TMC",
    category: "Safety",
  },
  {
    id: "fa:FaExclamationTriangle",
    label: "warning / disaster",
    category: "Safety",
  },
  { id: "fa:FaLifeRing", label: "life ring / rescue", category: "Safety" },
  { id: "fa:FaFirstAid", label: "first aid / welfare", category: "Safety" },
  {
    id: "md:MdLocalFireDepartment",
    label: "fire department",
    category: "Safety",
  },
  { id: "md:MdWarning", label: "warning / mdrrmo", category: "Safety" },
  { id: "md:MdSecurity", label: "security / police", category: "Safety" },
];

// ─── Derived categories ────────────────────────────────────────────────────────
const CATEGORIES = Array.from(new Set(ICONS.map((i) => i.category))).sort(
  (a, b) => a.localeCompare(b),
);

// ─── Component ────────────────────────────────────────────────────────────────
interface IconPickerProps {
  value: string;
  onChange: (id: string) => void;
  hasError?: boolean;
}

export function LucideIconPicker({
  value,
  onChange,
  hasError = false,
}: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ICONS.filter((icon) => {
      const matchesCategory =
        activeCategory === "All" || icon.category === activeCategory;
      const matchesQuery =
        !q || icon.label.includes(q) || icon.id.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [query, activeCategory]);

  const SelectedIcon = value ? resolveIcon(value) : null;
  const selectedLabel = ICONS.find((i) => i.id === value)?.label ?? value;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all",
          hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50",
        ].join(" ")}
      >
        {SelectedIcon ? (
          <>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <SelectedIcon className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 truncate text-gray-800">
              {selectedLabel}
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear icon"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                  setOpen(false);
                }
              }}
              className="ml-auto flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <LuX className="h-3.5 w-3.5" />
            </span>
          </>
        ) : (
          <span className="text-gray-400">— Select an icon —</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Icon picker"
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: "340px" }}
        >
          {/* Search bar */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 flex-shrink-0">
            <LuSearch className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search icons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <LuX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto px-2 pt-1.5 pb-1 flex-shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={[
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="col-span-8 py-6 text-center text-xs text-gray-400">
                No icons found{query ? ` for "${query}"` : ""}
              </p>
            ) : (
              filtered.map((icon) => {
                const Icon = resolveIcon(icon.id);
                const isSelected = icon.id === value;
                return (
                  <button
                    key={icon.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    title={icon.label}
                    onClick={() => {
                      onChange(icon.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={[
                      "flex items-center justify-center rounded-lg p-2 transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      isSelected
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-3 py-1.5 flex-shrink-0">
            <p className="text-[10px] text-gray-400">
              {filtered.length} icon{filtered.length !== 1 ? "s" : ""}
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
              {query ? ` matching "${query}"` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LucideIconPicker;
