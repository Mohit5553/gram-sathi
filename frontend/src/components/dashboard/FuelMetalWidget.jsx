import React, { useState, useEffect } from 'react';
import { Fuel, Coins, Landmark, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const FuelMetalWidget = () => {
  const { t, i18n } = useTranslation();
  const [fuel, setFuel] = useState(null);
  const [metals, setMetals] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fuelRes, metalsRes, currencyRes] = await Promise.all([
        api.get('/dashboard/fuel'),
        api.get('/dashboard/metals'),
        api.get('/dashboard/currency')
      ]);
      setFuel(fuelRes.data);
      setMetals(metalsRes.data);
      setCurrency(currencyRes.data);
    } catch (err) {
      console.error('Failed to load rates data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTrend = (value) => {
    if (!value) return null;
    const isPositive = value > 0;
    return (
      <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5 ${
        isPositive 
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
      }`}>
        {isPositive ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
        {isPositive ? `+${value}%` : `${value}%`}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-100 dark:bg-slate-900 animate-pulse h-full min-h-[220px] rounded-[24px] border border-border p-5 space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 w-1/3 rounded"></div>
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Fuel Prices Card */}
      <div className="bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 h-full min-h-[220px] bg-white dark:bg-slate-950 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-400 to-amber-500"></div>
        <div>
          <header className="flex justify-between items-center border-b border-border/65 pb-2.5 mb-3">
            <h3 className="font-extrabold text-foreground font-heading text-xs sm:text-sm flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-orange-500" />
              {t('dashboard.fuel')}
            </h3>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{i18n.language?.startsWith('hi') ? 'गोंडा, यूपी' : 'Gonda, UP'}</span>
          </header>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{i18n.language?.startsWith('hi') ? '⛽ पेट्रोल' : '⛽ Petrol'}</span>
              <strong className="text-sm text-foreground">₹{fuel?.petrol || '95.12'} <span className="text-[10px] text-muted-foreground font-medium">/{i18n.language?.startsWith('hi') ? 'लीटर' : 'L'}</span></strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{i18n.language?.startsWith('hi') ? '🛢️ डीजल' : '🛢️ Diesel'}</span>
              <strong className="text-sm text-foreground">₹{fuel?.diesel || '88.54'} <span className="text-[10px] text-muted-foreground font-medium">/{i18n.language?.startsWith('hi') ? 'लीटर' : 'L'}</span></strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{i18n.language?.startsWith('hi') ? '☘️ सीएनजी' : '☘️ CNG'}</span>
              <strong className="text-sm text-foreground">₹{fuel?.cng || '76.90'} <span className="text-[10px] text-muted-foreground font-medium">/{i18n.language?.startsWith('hi') ? 'किग्रा' : 'kg'}</span></strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{i18n.language?.startsWith('hi') ? '🔥 एलपीजी (14.2kg)' : '🔥 LPG (14.2kg)'}</span>
              <strong className="text-sm text-foreground">₹{fuel?.lpg || '895.00'}</strong>
            </div>
          </div>
        </div>

        <footer className="text-[9px] text-slate-400 mt-3.5 pt-2 border-t border-border/40">
          {i18n.language?.startsWith('hi') ? 'अद्यतन: दैनिक सुबह 6:00 बजे' : 'Updated: Daily 6:00 AM'}
        </footer>
      </div>

      {/* 2. Gold & Silver Card */}
      <div className="bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 h-full min-h-[220px] bg-white dark:bg-slate-950 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-400 to-amber-500"></div>
        <div>
          <header className="flex justify-between items-center border-b border-border/65 pb-2.5 mb-3">
            <h3 className="font-extrabold text-foreground font-heading text-xs sm:text-sm flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-yellow-500" />
              {t('dashboard.metals')}
            </h3>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{i18n.language?.startsWith('hi') ? 'बाजार' : 'Market'}</span>
          </header>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{i18n.language?.startsWith('hi') ? '🏆 सोना 24K' : '🏆 Gold 24K'}</span>
              <strong className="text-sm text-foreground flex items-center">
                ₹{metals?.gold24K || '9,950'} 
                <span className="text-[10px] text-muted-foreground font-medium ml-1">/{i18n.language?.startsWith('hi') ? 'ग्राम' : 'gm'}</span>
                {renderTrend(metals?.gold24KChange || 0.12)}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{i18n.language?.startsWith('hi') ? '🥇 सोना 22K' : '🥇 Gold 22K'}</span>
              <strong className="text-sm text-foreground flex items-center">
                ₹{metals?.gold22K || '9,125'} 
                <span className="text-[10px] text-muted-foreground font-medium ml-1">/{i18n.language?.startsWith('hi') ? 'ग्राम' : 'gm'}</span>
                {renderTrend(metals?.gold22KChange || -0.05)}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{i18n.language?.startsWith('hi') ? '🥈 चांदी' : '🥈 Silver'}</span>
              <strong className="text-sm text-foreground flex items-center">
                ₹{metals?.silver || '109'} 
                <span className="text-[10px] text-muted-foreground font-medium ml-1">/{i18n.language?.startsWith('hi') ? 'ग्राम' : 'gm'}</span>
                {renderTrend(metals?.silverChange || 0.22)}
              </strong>
            </div>
          </div>
        </div>

        <footer className="text-[9px] text-slate-400 mt-3.5 pt-2 border-t border-border/40">
          {i18n.language?.startsWith('hi') ? 'अद्यतन: प्रति घंटा ताज़ा' : 'Updated: Hourly Refreshed'}
        </footer>
      </div>

      {/* 3. Global Dollar Rate Card */}
      <div className="bg-card rounded-[24px] border border-border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 h-full min-h-[220px] bg-white dark:bg-slate-950 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <div>
          <header className="flex justify-between items-center border-b border-border/65 pb-2.5 mb-3">
            <h3 className="font-extrabold text-foreground font-heading text-xs sm:text-sm flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-emerald-600" />
              {t('dashboard.currency')}
            </h3>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{i18n.language?.startsWith('hi') ? 'विदेशी मुद्रा' : 'FX Rates'}</span>
          </header>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">🇺🇸 USD / INR</span>
              <strong className="text-sm text-foreground flex items-center">
                ₹{currency?.usdToInr || '83.25'}
                {renderTrend(currency?.usdChange)}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">🇪🇺 EUR / INR</span>
              <strong className="text-sm text-foreground flex items-center">
                ₹{currency?.eurToInr || '90.12'}
                {renderTrend(currency?.eurChange)}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-350">🇦🇪 AED / INR</span>
              <strong className="text-sm text-foreground flex items-center">
                ₹{currency?.aedToInr || '22.66'}
                {renderTrend(currency?.aedChange)}
              </strong>
            </div>
          </div>
        </div>

        <footer className="text-[9px] text-slate-400 mt-3.5 pt-2 border-t border-border/40">
          {i18n.language?.startsWith('hi') ? 'अद्यतन: वास्तविक समय सूचकांक' : 'Updated: Real-time Indices'}
        </footer>
      </div>

    </div>
  );
};

export default FuelMetalWidget;
