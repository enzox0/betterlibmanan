import React, { useState, useEffect } from "react";
import { lazyLoad, LazyLoader } from "@/app/router/lazy-loader";
import { SectionStepper } from "../components/ui/SectionStepper";

const HeroSection = lazyLoad(
  () => import("../components/sections/HeroSection"),
);
const PartnerLogos = lazyLoad(
  () => import("../components/sections/PartnerLogos"),
);
const BarangayMapSection = lazyLoad(
  () => import("../components/sections/BarangayMapSection"),
);
const PopularServicesSection = lazyLoad(
  () => import("../components/sections/PopularServicesSection"),
);
const AtAGlanceSection = lazyLoad(
  () => import("../components/sections/AtAGlanceSection"),
);
const WeatherMapSection = lazyLoad(
  () => import("../components/sections/WeatherMapSection"),
);
const TouristSpotsSection = lazyLoad(
  () => import("../components/sections/TouristSpotsSection"),
);
const HistorySection = lazyLoad(
  () => import("../components/sections/HistorySection"),
);
const LatestUpdatesSection = lazyLoad(
  () => import("../components/sections/LatestUpdatesSection"),
);
const ContactSection = lazyLoad(
  () => import("../components/sections/ContactSection"),
);
const QuizSection = lazyLoad(
  () => import("../components/sections/QuizSection"),
);
const FreedomWallCTASection = lazyLoad(
  () => import("../components/sections/FreedomWallCTASection"),
);

const SECTIONS = [
  { id: "section-hero", label: "Home" },
  { id: "section-partners", label: "Better LUGs" },
  { id: "section-barangay-map", label: "Barangay Map" },
  { id: "section-services", label: "Services" },
  { id: "section-at-a-glance", label: "At a Glance" },
  { id: "section-tourist-spots", label: "Tourist Spots" },
  { id: "section-weather", label: "Weather" },
  { id: "section-history", label: "History" },
  { id: "section-updates", label: "Latest Updates" },
  { id: "section-contact", label: "Contact" },
  { id: "section-freedom-wall-cta", label: "Freedom Wall" },
  { id: "section-quiz", label: "Quiz" },
];

export function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <SectionStepper sections={SECTIONS} />

      <div id="section-hero">
        <HeroSection />
      </div>
      <div id="section-partners">
        <PartnerLogos />
      </div>
      <div id="section-barangay-map">
        <BarangayMapSection isLoading={isLoading} />
      </div>
      <div id="section-services">
        <PopularServicesSection isLoading={isLoading} />
      </div>
      <div id="section-at-a-glance">
        <AtAGlanceSection isLoading={isLoading} />
      </div>
      <div id="section-tourist-spots">
        <TouristSpotsSection isLoading={isLoading} />
      </div>
      <div id="section-weather">
        <WeatherMapSection isLoading={isLoading} />
      </div>
      <div id="section-history">
        <HistorySection isLoading={isLoading} />
      </div>
      <div id="section-updates">
        <LatestUpdatesSection isLoading={isLoading} />
      </div>
      <div id="section-contact">
        <ContactSection isLoading={isLoading} />
      </div>
      <div id="section-freedom-wall-cta">
        <FreedomWallCTASection />
      </div>
      <div id="section-quiz">
        <QuizSection isLoading={isLoading} />
      </div>
    </div>
  );
}

HomePage.displayName = "HomePage";

export default HomePage;
