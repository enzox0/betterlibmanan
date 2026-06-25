import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { useMarqueeImagesStore } from "@/modules/admin/store/marqueeImagesStore";

// ---------------------------------------------------------------------------
// MarqueeRow
//
// Preloads all images before rendering to prevent layout shift and flicker.
// Duplicates the strip 4x to ensure seamless infinite loop with no visible cut.
// ---------------------------------------------------------------------------
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
      imgEl.src = img.src;
      imgEl.onload = checkAllLoaded;
      imgEl.onerror = checkAllLoaded; // Treat errors as loaded to prevent blocking
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
          <img
            src={img.src}
            alt={img.alt}
            loading="eager"
            decoding="sync"
            width={400}
            height={220}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );

  if (!isLoaded || images.length === 0) {
    // Invisible placeholder while images load
    return <div className="w-full flex-1" />;
  }

  // Render 4 copies to ensure seamless loop at any viewport size & speed
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

// ───────────────────────────────────────────────────────────────────────────────
// Utility: Seeded Fisher-Yates shuffle
//
// Accepts an optional seed in [0, 1). Using the same seed produces the same
// order — which we want within a React render cycle — but a different seed
// (generated once per component mount) gives a different order every page load.
// ───────────────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  // Simple 32-bit PRNG that turns a float seed into a sequence of floats.
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

// ───────────────────────────────────────────────────────────────────────────────
// HeroSection
// ───────────────────────────────────────────────────────────────────────────────
export function HeroSection() {
  const publicRecords = useMarqueeImagesStore((s) => s.publicRecords);
  const fetchPublicRecords = useMarqueeImagesStore((s) => s.fetchPublicRecords);

  // Stable per-mount seed: randomised once when the component mounts, never
  // changes again so the marquee order is consistent within a session but
  // different on every page load / hard refresh.
  const seedRef = useRef(Math.random());

  useEffect(() => {
    fetchPublicRecords().catch(() => {
      // Silently fail - will use cached records
    });
  }, [fetchPublicRecords]);

  // Recompute only when the record list itself changes (new upload, delete,
  // status change) OR when the per-mount seed changes (i.e. only on mount).
  const rowImages = useMemo(() => {
    const allImages = publicRecords
      .filter((r) => r.fields.imageUrl)
      .map((r) => ({
        src: r.fields.imageUrl as string,
        alt: (r.fields.alt ?? r.title) as string,
      }));

    // Seeded Fisher-Yates so the result is stable within the same mount but
    // different across page loads.
    const shuffled = shuffleArray(allImages, seedRef.current);

    const rows: [typeof allImages, typeof allImages, typeof allImages] = [
      [],
      [],
      [],
    ];
    shuffled.forEach((img, i) => rows[i % 3].push(img));
    return rows;
  }, [publicRecords]); // seedRef.current never changes after mount so omitting it is intentional

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-25%); }
        }
      `}</style>

      <section className="relative overflow-hidden bg-gray-950">
        {/* ── BACKGROUND: three marquee rows ──────────────────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col"
        >
          <MarqueeRow images={rowImages[0]} duration={90} reverse />
          <MarqueeRow images={rowImages[1]} duration={70} />
          <MarqueeRow images={rowImages[2]} duration={55} reverse />
        </div>

        {/* ── OVERLAYS ─────────────────────────────────────────────────── */}
        <div aria-hidden="true" className="absolute inset-0 bg-gray-950/75" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-gray-950/60"
        />
        {/* Top & bottom edge fades */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gray-950 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-950 to-transparent"
        />
        {/* Center spotlight dimming - radial gradient darkens toward center */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.7)_100%)]"
        />

        {/* ── HERO CONTENT ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 pb-12 pt-10 sm:min-h-[80vh] sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">
            <div className="grid w-full items-center gap-8 lg:grid-cols-2">
              {/* Left – headline + CTAs */}
              <div className="text-center lg:text-left">
                <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                  Welcome to <span className="text-yellow-400">Better</span>
                  <span className="text-blue-400">Libmanan</span>.org
                </h1>
                <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg lg:text-xl">
                  Access government services, information, and resources for the
                  people of Libmanan, Camarines Sur.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <button className="rounded-xl bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 sm:px-5 sm:text-base">
                    Browse Services
                  </button>
                  <button className="rounded-xl border border-white px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-gray-900 sm:px-5 sm:text-base">
                    Contact Us
                  </button>
                </div>
              </div>

              {/* Right – search card */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-neutral-700"
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
                    <span className="text-xl font-bold text-neutral-900 sm:text-2xl">
                      Find a Service
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      placeholder="e.g., birth certificate, business permit"
                      className="h-10 w-full flex-1 rounded-xl border border-neutral-200 px-4 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 sm:h-12 sm:px-5"
                    />
                    <button
                      aria-label="Search"
                      className="flex h-9 w-full items-center justify-center rounded-xl bg-neutral-900 text-white transition-colors hover:bg-neutral-800 sm:h-10 sm:w-10"
                    >
                      <svg
                        className="h-4 w-4"
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

                  <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-xs text-neutral-500 sm:text-sm">
                      Popular:
                    </span>
                    {[
                      "Birth Certificate",
                      "Business Permit",
                      "Real Property Tax",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

HeroSection.displayName = "HeroSection";

export default HeroSection;
