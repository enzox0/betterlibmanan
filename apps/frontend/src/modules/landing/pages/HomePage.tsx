import React, { useState, useEffect } from 'react';
import { lazyLoad, LazyLoader } from '@/app/router/lazy-loader';

const HeroSection = lazyLoad(() => import('../components/sections/HeroSection'));
const PartnerLogos = lazyLoad(() => import('../components/sections/PartnerLogos'));
const BarangayMapSection = lazyLoad(() => import('../components/sections/BarangayMapSection'));
const AppointmentSection = lazyLoad(() => import('../components/sections/AppointmentSection'));
const PopularServicesSection = lazyLoad(() => import('../components/sections/PopularServicesSection'));
const AtAGlanceSection = lazyLoad(() => import('../components/sections/AtAGlanceSection'));
const WeatherMapSection = lazyLoad(() => import('../components/sections/WeatherMapSection'));
const HistorySection = lazyLoad(() => import('../components/sections/HistorySection'));
const LatestUpdatesSection = lazyLoad(() => import('../components/sections/LatestUpdatesSection'));
const LeadershipSection = lazyLoad(() => import('../components/sections/LeadershipSection'));
const ContactSection = lazyLoad(() => import('../components/sections/ContactSection'));
const QuizSection = lazyLoad(() => import('../components/sections/QuizSection'));

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
      <HeroSection />
      <PartnerLogos />
      <BarangayMapSection isLoading={isLoading} />
      <AppointmentSection />
      <PopularServicesSection isLoading={isLoading} />
      <AtAGlanceSection isLoading={isLoading} />
      <WeatherMapSection isLoading={isLoading} />
      <HistorySection isLoading={isLoading} />
      <LatestUpdatesSection isLoading={isLoading} />
      <LeadershipSection isLoading={isLoading} />
      <ContactSection isLoading={isLoading} />
      <QuizSection isLoading={isLoading} />
    </div>
  );
}

HomePage.displayName = 'HomePage';

export default HomePage;
