'use client';

import React, { useState } from 'react';
import { JathagamChart, HouseData } from './JathagamChart';
import { Sparkles, Trash2, RotateCcw } from 'lucide-react';

interface HoroscopeEditorProps {
  rasiHouses?: HouseData[];
  amsamHouses?: HouseData[];
  onChange?: (rasi: HouseData[], amsam: HouseData[]) => void;
  language?: 'TA' | 'EN';
}

const PLANETS = [
  { id: 'லக்', nameEn: 'Lagna (Ascendant)', nameTa: 'லக்னம் (லக்)' },
  { id: 'சூரி', nameEn: 'Sun (Suriyan)', nameTa: 'சூரியன் (சூரி)' },
  { id: 'சந்', nameEn: 'Moon (Chandran)', nameTa: 'சந்திரன் (சந்)' },
  { id: 'செவ்', nameEn: 'Mars (Sevvai)', nameTa: 'செவ்வாய் (செவ்)' },
  { id: 'புத', nameEn: 'Mercury (Budhan)', nameTa: 'புதன் (புத)' },
  { id: 'குரு', nameEn: 'Jupiter (Guru)', nameTa: 'குரு (குரு)' },
  { id: 'சுக்', nameEn: 'Venus (Sukran)', nameTa: 'சுக்கிரன் (சுக்)' },
  { id: 'சனி', nameEn: 'Saturn (Sani)', nameTa: 'சனி (சனி)' },
  { id: 'ராகு', nameEn: 'Rahu (Rahu)', nameTa: 'ராகு (ராகு)' },
  { id: 'கேது', nameEn: 'Ketu (Ketu)', nameTa: 'கேது (கேது)' },
];

const DEFAULT_HOUSES: HouseData[] = Array.from({ length: 12 }, (_, i) => ({
  houseIndex: i,
  planets: [],
}));

export function HoroscopeEditor({
  rasiHouses = DEFAULT_HOUSES,
  amsamHouses = DEFAULT_HOUSES,
  onChange,
  language = 'TA',
}: HoroscopeEditorProps) {
  const [activeChart, setActiveChart] = useState<'rasi' | 'amsam'>('rasi');
  const [selectedPlanet, setSelectedPlanet] = useState<string>('லக்');
  const [currentRasi, setCurrentRasi] = useState<HouseData[]>(rasiHouses.length ? rasiHouses : DEFAULT_HOUSES);
  const [currentAmsam, setCurrentAmsam] = useState<HouseData[]>(amsamHouses.length ? amsamHouses : DEFAULT_HOUSES);

  const activeData = activeChart === 'rasi' ? currentRasi : currentAmsam;

  const handleHouseClick = (houseIndex: number) => {
    if (!selectedPlanet) return;

    const targetList = activeChart === 'rasi' ? [...currentRasi] : [...currentAmsam];
    const existingIndex = targetList.findIndex((h) => h.houseIndex === houseIndex);

    if (existingIndex >= 0) {
      const house = targetList[existingIndex];
      const hasPlanet = house.planets.includes(selectedPlanet);

      let updatedPlanets: string[];
      if (hasPlanet) {
        // Remove planet if clicked again
        updatedPlanets = house.planets.filter((p) => p !== selectedPlanet);
      } else {
        // Also remove this planet from any other house first (since planet can only be in one house)
        targetList.forEach((h, idx) => {
          if (h.planets.includes(selectedPlanet)) {
            targetList[idx] = { ...h, planets: h.planets.filter((p) => p !== selectedPlanet) };
          }
        });
        updatedPlanets = [...house.planets, selectedPlanet];
      }

      targetList[existingIndex] = { ...house, planets: updatedPlanets };
    } else {
      targetList.push({ houseIndex, planets: [selectedPlanet] });
    }

    if (activeChart === 'rasi') {
      setCurrentRasi(targetList);
      onChange?.(targetList, currentAmsam);
    } else {
      setCurrentAmsam(targetList);
      onChange?.(currentRasi, targetList);
    }
  };

  const handleClearChart = () => {
    const empty = Array.from({ length: 12 }, (_, i) => ({ houseIndex: i, planets: [] }));
    if (activeChart === 'rasi') {
      setCurrentRasi(empty);
      onChange?.(empty, currentAmsam);
    } else {
      setCurrentAmsam(empty);
      onChange?.(currentRasi, empty);
    }
  };

  return (
    <div className="bg-[#FFFDF9] border border-primary/15 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 border-b border-primary/10 pb-3 sm:pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-primary font-serif flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? 'ஜாதக கட்ட அமைப்பு (Horoscope Chart)' : '12-House Astrology Chart Editor'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {language === 'TA'
              ? 'கிரகத்தைத் தேர்ந்தெடுத்து கட்டத்தில் கிளிக் செய்து சேர்க்கவும்'
              : 'Select a planet below and click any house in the chart to place it.'}
          </p>
        </div>

        {/* Chart Selector Tabs */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 bg-primary/10 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveChart('rasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              activeChart === 'rasi' ? 'bg-primary text-white shadow-xs' : 'text-gray-700 hover:text-primary'
            }`}
          >
            {language === 'TA' ? 'ராசி கட்டம் (Rasi)' : 'Rasi Chart'}
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('amsam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              activeChart === 'amsam' ? 'bg-primary text-white shadow-xs' : 'text-gray-700 hover:text-primary'
            }`}
          >
            {language === 'TA' ? 'அம்சம் (Amsam)' : 'Amsam Chart'}
          </button>
        </div>
      </div>

      {/* Planet Selection Palette */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            {language === 'TA' ? 'கிரகங்களைத் தேர்வு செய்க' : 'Select Planet to Place'}:
          </span>
          <button
            type="button"
            onClick={handleClearChart}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {language === 'TA' ? 'கட்டத்தை அழிக்க' : 'Reset Chart'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2">
          {PLANETS.map((planet) => {
            const isSelected = selectedPlanet === planet.id;
            return (
              <button
                key={planet.id}
                type="button"
                onClick={() => setSelectedPlanet(planet.id)}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-[#D4AF37]/50 scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                {language === 'TA' ? planet.nameTa : planet.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 12-House Chart */}
      <div className="flex justify-center p-1.5 sm:p-2 bg-white rounded-xl sm:rounded-2xl border border-primary/10 shadow-inner overflow-hidden">
        <div className="relative">
          <JathagamChart
            title={activeChart === 'rasi' ? 'ராசி' : 'அம்சம்'}
            houses={activeData}
            centerElement={
              <div className="flex flex-col items-center justify-center p-2 text-center select-none">
                <span className="text-sm sm:text-base font-black text-primary font-serif">
                  {activeChart === 'rasi' ? (language === 'TA' ? 'ராசி' : 'RASI') : (language === 'TA' ? 'அம்சம்' : 'AMSAM')}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 hidden sm:inline">
                  {language === 'TA' ? 'கிளிக் செய்து மாற்றவும்' : 'Click house to toggle'}
                </span>
              </div>
            }
          />

          {/* Transparent Click Overlay Grid corresponding to the 4x4 layout */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-auto">
            {/* Row 1: 0 (Meenam), 1 (Mesham), 2 (Rishabam), 3 (Mithunam) */}
            <div onClick={() => handleHouseClick(0)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="12. Meenam" />
            <div onClick={() => handleHouseClick(1)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="1. Mesham" />
            <div onClick={() => handleHouseClick(2)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="2. Rishabam" />
            <div onClick={() => handleHouseClick(3)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="3. Mithunam" />

            {/* Row 2: 11 (Kumbam), CENTER, CENTER, 4 (Kadagam) */}
            <div onClick={() => handleHouseClick(11)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="11. Kumbam" />
            <div className="col-span-2 row-span-2 pointer-events-none" />
            <div onClick={() => handleHouseClick(4)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="4. Kadagam" />

            {/* Row 3: 10 (Makaram), (CENTER), (CENTER), 5 (Simmam) */}
            <div onClick={() => handleHouseClick(10)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="10. Makaram" />
            <div onClick={() => handleHouseClick(5)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="5. Simmam" />

            {/* Row 4: 9 (Dhanusu), 8 (Vrichigam), 7 (Thulam), 6 (Kanni) */}
            <div onClick={() => handleHouseClick(9)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="9. Dhanusu" />
            <div onClick={() => handleHouseClick(8)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="8. Vrichigam" />
            <div onClick={() => handleHouseClick(7)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="7. Thulam" />
            <div onClick={() => handleHouseClick(6)} className="cursor-pointer hover:bg-primary/10 transition-colors" title="6. Kanni" />
          </div>
        </div>
      </div>
    </div>
  );
}
