import { useState, useEffect, memo } from 'react';
import { FaDollarSign, FaEuroSign, FaYenSign, FaThermometerHalf, FaCalendarAlt, FaClock } from 'react-icons/fa';

interface CurrencyRates {
  USD: number;
  EUR: number;
  JPY: number;
}

const currencies = [
  { code: 'USD', icon: FaDollarSign, label: '1 USD = ₱' },
  { code: 'EUR', icon: FaEuroSign, label: '1 EUR = ₱' },
  { code: 'JPY', icon: FaYenSign, label: '1 JPY = ₱' },
];

// Isolated clock component — re-renders every second without touching the marquee
const LiveClock = memo(function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <FaCalendarAlt size={12} />
      <span>
        {now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
      <span>•</span>
      <FaClock size={12} />
      <span>
        {now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Manila',
        })}
      </span>
      <span>PHT</span>
    </>
  );
});

export function BottomUtilityBar() {
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [currentCurrencyIndex, setCurrentCurrencyIndex] = useState(0);

  const LATITUDE = 13.6956;
  const LONGITUDE = 123.1236;

  useEffect(() => {
    async function fetchData() {
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m`
        );
        const weatherData = await weatherResponse.json();
        setTemperature(Math.round(weatherData.current.temperature_2m));

        const currencyResponse = await fetch('https://api.exchangerate-api.com/v4/latest/PHP');
        const currencyData = await currencyResponse.json();
        setCurrencyRates({
          USD: 1 / currencyData.rates.USD,
          EUR: 1 / currencyData.rates.EUR,
          JPY: 1 / currencyData.rates.JPY,
        });
      } catch {
        setCurrencyRates({ USD: 57.0, EUR: 62.0, JPY: 0.39 });
        setTemperature(25);
      }
    }

    fetchData();
    const dataTimer = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(dataTimer);
  }, []);

  useEffect(() => {
    const currencyTimer = setInterval(() => {
      setCurrentCurrencyIndex((prev) => (prev + 1) % currencies.length);
    }, 3000);
    return () => clearInterval(currencyTimer);
  }, []);

  const currentCurrency = currencies[currentCurrencyIndex];
  const CurrencyIcon = currentCurrency.icon;
  const currencyValue = currencyRates
    ? currencyRates[currentCurrency.code as keyof CurrencyRates].toFixed(2)
    : currentCurrency.code === 'USD' ? '57.00' : currentCurrency.code === 'EUR' ? '62.00' : '0.39';
  const tempLabel = temperature !== null ? `${temperature}°C` : '25°C';

  // Static marquee items — clock lives in LiveClock so it never remounts the marquee
  const MarqueeItems = () => (
    <div className="flex items-center gap-8 text-xs pr-8">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <CurrencyIcon size={12} />
        <span>{currentCurrency.label} {currencyValue}</span>
      </div>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <FaThermometerHalf size={12} />
        <span>Libmanan {tempLabel}</span>
      </div>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <LiveClock />
      </div>
    </div>
  );

  return (
    <div className="bg-blue-900 text-white py-1.5 sm:py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: static row */}
        <div className="hidden sm:flex justify-end items-center gap-6 text-xs">
          <div className="flex items-center gap-2 h-6 overflow-hidden">
            <div key={currentCurrencyIndex} className="flex items-center gap-2 animate-slide-up">
              <CurrencyIcon size={12} />
              <span>{currentCurrency.label} {currencyValue}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaThermometerHalf size={12} />
            <span>Libmanan Camarines Sur {tempLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <LiveClock />
          </div>
        </div>

        {/* Mobile: seamless marquee using CSS animation on a stable element */}
        <div className="sm:hidden overflow-hidden">
          <div className="marquee-track">
            <MarqueeItems />
            {/* Exact duplicate for seamless loop */}
            <MarqueeItems />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }

        /* Marquee: scroll one full copy (50% of the doubled width) then reset */
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: inline-flex;
          white-space: nowrap;
          animation: marqueeScroll 22s linear infinite;
          /* will-change keeps the animation on the GPU — prevents repaint glitch */
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
