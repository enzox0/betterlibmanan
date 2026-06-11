import LogoLoop from '@/modules/landing/components/LogoLoop';

// LGU Logos from /betterLGUs folder
const LGU_LOGOS = [
  { src: "/betterLGUs/better-cainta-logo.svg", alt: "Better Cainta", title: "Better Cainta", href: "https://bettercainta.org" },
  { src: "/betterLGUs/better-calauan-logo.svg", alt: "Better Calauan", title: "Better Calauan", href: "https://bettercalauan.org" },
  { src: "/betterLGUs/better-solano-logo.svg", alt: "Better Solano", title: "Better Solano", href: "https://bettersolano.org" },
  { src: "/betterLGUs/betterGeneraltrias-logo.png", alt: "Better General Trias", title: "Better General Trias", href: "https://bettergeneraltrias.org" },
  { src: "/betterLGUs/betterallen_navbar.webp", alt: "Better Allen", title: "Better Allen", href: "https://betterallen.org" },
  { src: "/betterLGUs/betteraparri-5SgBAXRt.webp", alt: "Better Aparri", title: "Better Aparri", href: "https://betteraparri.org" },
  { src: "/betterLGUs/betterlb-icon-colored.svg", alt: "Better Lb", title: "Better Lb", href: "https://betterlb.org" },
  { src: "/betterLGUs/betterlibmanan-logo.png", alt: "Better Libmanan", title: "Better Libmanan", href: "https://betterlibmanan.org" },
  { src: "/betterLGUs/bettersanpablo-logo3-Cr753wFY.png", alt: "Better San Pablo", title: "Better San Pablo", href: "https://bettersanpablo.org" },
  { src: "/betterLGUs/cabuyao-city-seal.png", alt: "Cabuyao City", title: "Cabuyao City", href: "https://bettercabuyao.org" },
];

export default function PartnerLogos() {
  return (
    <section className="py-6 sm:py-10 bg-neutral-100 border-y border-border/40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:gap-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src="/bettergov-logo.svg" 
              alt="Better Gov Logo" 
              className="h-7 sm:h-10 w-auto opacity-70"
            />
            <div className="flex-shrink-0 text-center md:text-left">
              <p className="text-[10px] sm:text-xs font-medium text-primary uppercase tracking-[0.15em] mb-1">
                Better Gov • Better LGU
              </p>
              <h3 className="text-xs sm:text-base font-medium text-text-muted">
                Empowering local governance
              </h3>
            </div>
          </div>
          
          <div className="flex-1 w-full overflow-hidden">
            <LogoLoop
              logos={LGU_LOGOS}
              speed={30}
              direction="left"
              logoHeight={40}
              gap={32}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              ariaLabel="Partner LGUs"
              className="opacity-60 hover:opacity-100 transition-opacity duration-500"
              renderItem={(item, key) => (
                <a
                  href={(item as any).href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grayscale hover:grayscale-0 transition-all duration-300 flex items-center"
                >
                  <img
                    src={(item as any).src}
                    alt={(item as any).alt}
                    className="h-[var(--logoloop-logoHeight)] w-auto object-contain"
                    draggable={false}
                  />
                </a>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
