import React, { useState, useEffect } from 'react';
import { lazyLoad, LazyLoader } from '../../app/router/lazy-loader';

const HeroSection = lazyLoad(() => import('./sections/HeroSection'));
const AppointmentSection = lazyLoad(() => import('./sections/AppointmentSection'));
const PopularServicesSection = lazyLoad(() => import('./sections/PopularServicesSection'));
const AtAGlanceSection = lazyLoad(() => import('./sections/AtAGlanceSection'));
const WeatherMapSection = lazyLoad(() => import('./sections/WeatherMapSection'));
const HistorySection = lazyLoad(() => import('./sections/HistorySection'));
const LatestUpdatesSection = lazyLoad(() => import('./sections/LatestUpdatesSection'));
const LeadershipSection = lazyLoad(() => import('./sections/LeadershipSection'));
const ContactSection = lazyLoad(() => import('./sections/ContactSection'));
const QuizSection = lazyLoad(() => import('./sections/QuizSection'));

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
