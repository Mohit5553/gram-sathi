import React, { useState, useEffect } from 'react';
import { 
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, 
  Wind, Droplets, Thermometer, Sunrise, Sunset, 
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const WeatherWidget = ({ latitude = 27.13, longitude = 81.96, locationName = 'Gonda, Uttar Pradesh', className = '' }) => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/dashboard/weather?lat=${latitude}&lon=${longitude}`);
        setWeather(response.data);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
        setError('Weather data unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  const getWeatherIcon = (type, size = 32) => {
    switch (type) {
      case 'clear':
        return <Sun size={size} className="text-amber-400 animate-spin-slow" />;
      case 'rain':
        return <CloudRain size={size} className="text-sky-300 animate-pulse" />;
      case 'snow':
        return <CloudSnow size={size} className="text-slate-200" />;
      case 'storm':
        return <CloudLightning size={size} className="text-yellow-400" />;
      case 'cloudy':
      default:
        return <Cloud size={size} className="text-slate-300" />;
    }
  };

  if (loading) {
    return (
      <div className={`w-full h-full min-h-[320px] bg-slate-100 dark:bg-slate-900 animate-pulse rounded-[24px] border border-border p-5 flex flex-col justify-between ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 rounded"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/2 rounded"></div>
        </div>
        <div className="flex justify-between items-end">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 w-24 rounded-xl"></div>
          <div className="space-y-2 w-1/3">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`w-full h-full min-h-[320px] bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-5 rounded-[24px] flex flex-col justify-center items-center text-center ${className}`}>
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <h3 className="font-bold text-rose-900 dark:text-rose-300 text-sm">{t('weather.failed', 'Weather Update Failed')}</h3>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{t('weather.failedDesc', 'Unable to contact weather service. Check connection.')}</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-sky-400/90 via-sky-500 to-blue-600 text-white rounded-[24px] shadow-sm border border-sky-300/25 p-5 flex flex-col h-full min-h-[320px] relative overflow-hidden group ${className}`}>
      
      {/* Absolute Decorative Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-amber-400/30 blur-[40px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

      <header className="flex justify-between items-start pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5 text-sky-100 text-xs font-bold uppercase tracking-wider">
            <Sun size={12} className="animate-spin-slow" /> {t('dashboard.weather')}
          </div>
          <h3 className="text-lg font-bold font-heading line-clamp-1 mt-1">{locationName}</h3>
        </div>
      </header>

      {/* Content area */}
      <div className="flex-1 flex flex-col justify-center py-4 overflow-y-auto no-scrollbar">
        {/* Temperature & Icon Split Row */}
        <div className="grid grid-cols-2 gap-4 items-center">
          {/* Left Column: Temperature Details */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.conditionType, 40)}
              <span className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                {weather.temperature}°C
              </span>
            </div>
            <div className="text-xs font-bold text-sky-100">{t('weather.cond.' + weather.condition.toLowerCase().replace(' ', ''), weather.condition)}</div>
          </div>

          {/* Right Column: Stacked Stats with vertical left-border divider */}
          <div className="space-y-2 border-l border-white/20 pl-4 text-[11px] font-semibold text-sky-100 text-left">
            <div className="flex justify-between items-center pb-0.5 border-b border-white/5">
              <span className="flex items-center gap-1"><Droplets size={11} /> {t('weather.humidity')}</span>
              <strong className="text-white">{weather.humidity}%</strong>
            </div>
            <div className="flex justify-between items-center pb-0.5 border-b border-white/5">
              <span className="flex items-center gap-1"><CloudRain size={11} /> {t('weather.rainChance')}</span>
              <strong className="text-white">{weather.rainProbability}%</strong>
            </div>
            <div className="flex justify-between items-center pb-0.5 border-b border-white/5">
              <span className="flex items-center gap-1"><Wind size={11} /> {t('weather.windSpeed')}</span>
              <strong className="text-white">{weather.windSpeed} km/h</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1"><Thermometer size={11} /> {t('weather.feelsLike')}</span>
              <strong className="text-white">{weather.feelsLike}°C</strong>
            </div>
          </div>
        </div>

        {/* Accordion 7-Day Forecast */}
        {showForecast && (
          <div className="mt-4 border-t border-white/20 pt-3 space-y-2 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-2 gap-2 text-[10px] text-sky-100 bg-sky-950/20 rounded-xl p-2 border border-white/5">
              <div className="flex items-center gap-1">
                <Sunrise size={11} className="text-yellow-300" />
                <span>{t('weather.sunrise')}: <strong>{weather.sunrise}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Sunset size={11} className="text-orange-400" />
                <span>{t('weather.sunset')}: <strong>{weather.sunset}</strong></span>
              </div>
            </div>

            <h4 className="text-[10px] font-bold uppercase tracking-wider text-sky-100 mb-1">{t('weather.forecast')}</h4>
            <div className="space-y-1.5 overflow-y-auto max-h-32 pr-1 no-scrollbar">
              {weather.forecast.map((day, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] text-sky-50 bg-white/5 hover:bg-white/10 transition-colors p-1.5 rounded-lg">
                  <span className="w-10 font-semibold">{day.day}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    {getWeatherIcon(day.conditionType, 12)}
                    <span className="w-16 truncate text-left">{t('weather.cond.' + day.condition.toLowerCase().replace(' ', ''), day.condition)}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-sky-200">
                    <CloudRain size={8} /> {day.rainProbability}%
                  </span>
                  <span className="font-bold">
                    {day.tempMax}° / <span className="text-sky-200 font-medium">{day.tempMin}°</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand Button / Footer */}
      <footer className="mt-auto border-t border-white/10 pt-3 flex justify-between items-center text-[10px] text-sky-100/85">
        <span>{t('weather.updated')}</span>
        <button 
          onClick={() => setShowForecast(!showForecast)}
          className="flex items-center gap-1 font-bold text-white hover:text-sky-200 transition-colors cursor-pointer bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
        >
          {showForecast ? (
            <>
              {t('weather.hideForecast')} <ChevronUp size={11} />
            </>
          ) : (
            <>
              {t('weather.showForecast')} <ChevronDown size={11} />
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default WeatherWidget;
