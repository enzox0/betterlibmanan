import { useState, useEffect } from 'react';
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

export function BottomUtilityBar() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [currentCurrencyIndex, setCurrentCurrencyIndex] = useState(0);

  const LATITUDE = 13.6956;
  const LONGITUDE = 123.1236;

  useEffect(() => {
    const dateTimer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(dateTimer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m`
        );
        const weatherData = await weatherResponse.json();
        setTemperature(Math.round(weatherData.current.temperature_2m));

        const currencyResponse = await fetch(
          'https://api.exchangerate-api.com/v4/latest/PHP'
        );
        const currencyData = await currencyResponse.json();
        setCurrencyRates({
          USD: 1 / currencyData.rates.USD,
          EUR: 1 / currencyData.rates.EUR,
          JPY: 1 / currencyData.rates.JPY,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setCurrencyRates({
          USD: 57.00,
          EUR: 62.00,
          JPY: 0.39,
        });
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

  return (
    <div className="bg-blue-900 text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden sm:flex flex-wrap justify-end items-center gap-6 text-sm">
          <div className="flex items-center gap-2 h-6 overflow-hidden">
            <div
              key={currentCurrencyIndex}
              className="flex items-center gap-2 animate-slide-up"
            >
              <CurrencyIcon size={14} />
              <span>
                {currentCurrency.label} {currencyRates ? currencyRates[currentCurrency.code as keyof CurrencyRates].toFixed(2) : currentCurrency.code === 'USD' ? '57.00' : currentCurrency.code === 'EUR' ? '62.00' : '0.39'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaThermometerHalf size={14} />
            <span>Libmanan Camarines Sur {temperature !== null ? `${temperature}°C` : '25°C'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt size={14} />
            <span>
              {currentDateTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span>•</span>
            <FaClock size={14} />
            <span>
              {currentDateTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Manila'
              })}
            </span>
            <span>PHT</span>
          </div>
        </div>
        <div className="sm:hidden whitespace-nowrap overflow-hidden">
          <div className="inline-block animate-marquee">
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CurrencyIcon size={14} />
                <span>
                  {currentCurrency.label} {currencyRates ? currencyRates[currentCurrency.code as keyof CurrencyRates].toFixed(2) : currentCurrency.code === 'USD' ? '57.00' : currentCurrency.code === 'EUR' ? '62.00' : '0.39'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaThermometerHalf size={14} />
                <span>Libmanan Camarines Sur {temperature !== null ? `${temperature}°C` : '25°C'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt size={14} />
                <span>
                  {currentDateTime.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span>•</span>
                <FaClock size={14} />
                <span>
                  {currentDateTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Manila'
                  })}
                </span>
                <span>PHT</span>
              </div>
              <div className="flex items-center gap-2">
                <CurrencyIcon size={14} />
                <span>
                  {currentCurrency.label} {currencyRates ? currencyRates[currentCurrency.code as keyof CurrencyRates].toFixed(2) : currentCurrency.code === 'USD' ? '57.00' : currentCurrency.code === 'EUR' ? '62.00' : '0.39'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaThermometerHalf size={14} />
                <span>Libmanan Camarines Sur {temperature !== null ? `${temperature}°C` : '25°C'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt size={14} />
                <span>
                  {currentDateTime.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span>•</span>
                <FaClock size={14} />
                <span>
                  {currentDateTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Manila'
                  })}
                </span>
                <span>PHT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
