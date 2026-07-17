import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMarqueeImagesStore } from "@/modules/admin/store/marqueeImagesStore";
import SafeImage, { getProxiedUrl } from "../ui/SafeImage";

const CATEGORIES = [
  { label: "All", slug: null },
  { label: "Certificates", slug: "certificates" },
  { label: "Business", slug: "business" },
  { label: "Social", slug: "social-services" },
  { label: "Health", slug: "health" },
  { label: "Taxation", slug: "tax-payments" },
] as const;

type CategoryLabel = (typeof CATEGORIES)[number]["label"];

const POPULAR_SEARCHES = [
  "birth certificate",
  "business permit",
  "cedula",
  "real property tax",
];

// Maps popular tag labels to their service category routes
const TAG_ROUTES: Record<string, string> = {
  "Birth Certificate": "/services/certificates",
  "Business Permit": "/services/business",
  "Real Property Tax": "/services/tax-payments",
};

function SearchCard() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryLabel>("All");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const showDropdown = focused;

  // Navigate to services with the current query
  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/services?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/services");
    }
    setFocused(false);
  };

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredSuggestions = POPULAR_SEARCHES.filter((s) =>
    query.trim() === "" ? true : s.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      {/* Main card */}
      <div className="rounded-xl bg-white p-3 shadow-xl sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <svg
            className="h-3.5 w-3.5 text-neutral-700 sm:h-4 sm:w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            />
          </svg>
          <span className="text-sm font-bold text-neutral-900 sm:text-lg">
            Find a Municipal Service
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="e.g., birth certificate, business permit"
            className={`h-9 w-full flex-1 rounded-lg border px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 transition-colors sm:h-10 sm:text-sm ${
              focused
                ? "border-blue-600 ring-2 ring-blue-100"
                : "border-neutral-200"
            }`}
          />
          <button
            aria-label="Search"
            onClick={handleSearch}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 sm:h-10 sm:w-10"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14m-6-6 6 6-6 6"
              />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] text-neutral-500 sm:text-xs">
            Popular:
          </span>
          {["Birth Certificate", "Business Permit", "Real Property Tax"].map(
            (tag) => (
              <button
                key={tag}
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigate(
                    TAG_ROUTES[tag] ?? `/services?q=${encodeURIComponent(tag)}`,
                  );
                }}
                className="rounded-full sm:bg-blue-50 px-2 py-0 text-[10px] font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:px-3 sm:py-1 sm:text-xs"
              >
                {tag}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
          >
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 px-3 py-3 sm:px-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setActiveCategory(cat.label);
                    if (cat.slug) {
                      navigate(`/services/${cat.slug}`);
                    } else {
                      navigate("/services");
                    }
                    setFocused(false);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    activeCategory === cat.label
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Popular searches */}
            <div className="py-1.5">
              <div className="flex items-center gap-1.5 px-3 pb-1.5 pt-2 sm:px-4">
                <svg
                  className="h-3 w-3 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Popular Searches
                </span>
              </div>

              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((item) => (
                  <button
                    key={item}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/services?q=${encodeURIComponent(item)}`);
                      setFocused(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-neutral-50 sm:px-4"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      />
                    </svg>
                    <span className="text-xs text-neutral-800 sm:text-sm">
                      {item}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-neutral-400 sm:px-4">
                  No suggestions for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MarqueeRow({
  images,
  duration,
  reverse = false,
}: {
  images: { src: string; alt: string }[];
  duration: number;
  reverse?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (images.length === 0) {
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === images.length && isMounted) {
        setIsLoaded(true);
      }
    };

    images.forEach((img) => {
      const imgEl = new Image();
      imgEl.src = getProxiedUrl(img.src);
      imgEl.onload = checkAllLoaded;
      imgEl.onerror = checkAllLoaded;
    });

    return () => {
      isMounted = false;
    };
  }, [images]);

  const strip = (idx: number) => (
    <div key={idx} className="flex h-full shrink-0">
      {images.map((img, i) => (
        <div
          key={`${idx}-${i}`}
          className="relative h-full w-56 shrink-0 overflow-hidden sm:w-64 lg:w-72"
        >
          <SafeImage
            src={img.src}
            alt={img.alt}
            className="h-full w-full object-cover"
            containerClassName="h-full w-full"
          />
        </div>
      ))}
    </div>
  );

  if (!isLoaded || images.length === 0) {
    return <div className="w-full flex-1" />;
  }

  return (
    <div className="w-full flex-1 overflow-hidden">
      <div
        className="flex h-full w-fit will-change-transform"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite ${reverse ? "reverse" : "normal"}`,
        }}
      >
        {strip(0)}
        {strip(1)}
        {strip(2)}
        {strip(3)}
      </div>
    </div>
  );
}

function mulberry32(seed: number) {
  let s = (seed * 0xffffffff) >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0xffffffff;
  };
}

function shuffleArray<T>(array: T[], seed: number = Math.random()): T[] {
  const rand = mulberry32(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function HeroSection() {
  const publicRecords = useMarqueeImagesStore((s) => s.publicRecords);
  const fetchPublicRecords = useMarqueeImagesStore((s) => s.fetchPublicRecords);
  const navigate = useNavigate();

  const seedRef = useRef(Math.random());

  useEffect(() => {
    fetchPublicRecords().catch(() => {});
  }, [fetchPublicRecords]);

  const rowImages = useMemo(() => {
    const allImages = publicRecords
      .filter((r) => r.fields.imageUrl)
      .map((r) => ({
        src: r.fields.imageUrl as string,
        alt: (r.fields.alt ?? r.title) as string,
      }));

    const shuffled = shuffleArray(allImages, seedRef.current);

    const rows: [typeof allImages, typeof allImages, typeof allImages] = [
      [],
      [],
      [],
    ];
    shuffled.forEach((img, i) => rows[i % 3].push(img));
    return rows;
  }, [publicRecords]);

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-25%); }
        }
      `}</style>

      <section className="relative overflow-hidden bg-gray-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col"
        >
          <MarqueeRow images={rowImages[0]} duration={90} reverse />
          <MarqueeRow images={rowImages[1]} duration={70} />
          <MarqueeRow images={rowImages[2]} duration={55} reverse />
        </div>

        <div aria-hidden="true" className="absolute inset-0 bg-gray-950/75" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-gray-950/60"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gray-950 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-950 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.7)_100%)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <div className="mx-auto flex min-h-[auto] max-w-7xl items-center px-4 pb-6 pt-6 sm:min-h-[70dvh] sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
            <div className="grid w-full items-center gap-4 lg:grid-cols-2 lg:gap-6">
              <div className="text-center lg:text-left">
                <h1 className="mb-3 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl xl:text-5xl">
                  Welcome to <span className="text-yellow-400">Better</span>
                  <span className="text-blue-400">Libmanan</span>.org
                </h1>
                <p className="mb-4 max-w-2xl text-xs leading-relaxed text-gray-300 sm:text-base lg:text-lg">
                  Access government services, information, and resources for the
                  people of Libmanan, Camarines Sur.
                </p>
                <div className="flex flex-col justify-center gap-2 sm:flex-row lg:justify-start">
                  <button
                    onClick={() => navigate("/services")}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 sm:px-4 sm:text-sm"
                  >
                    Browse Municipal Services
                  </button>
                  <button
                    onClick={() => navigate("/contact")}
                    className="rounded-lg border border-white px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-gray-900 sm:px-4 sm:text-sm"
                  >
                    Contact
                  </button>
                </div>
              </div>

              <SearchCard />
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

HeroSection.displayName = "HeroSection";

export default HeroSection;
