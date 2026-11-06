'use client';

import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { BRANDING } from '@/constants/branding';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export default function BrandLogo({
  size = 'md',
  className = '',
  showSubtitle = true,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: {
      iconBox: 'w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl',
      heart: 'w-3 h-3 sm:w-4 sm:h-4',
      sparkle: 'w-1.5 h-1.5 sm:w-2.5 sm:h-2.5',
      title: 'text-xs sm:text-base md:text-lg',
      sub: 'text-[8px] sm:text-[9px]',
      gap: 'gap-1.5 sm:gap-2',
    },
    md: {
      iconBox: 'w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl',
      heart: 'w-3.5 h-3.5 sm:w-5 sm:h-5',
      sparkle: 'w-2 h-2 sm:w-3 sm:h-3',
      title: 'text-sm sm:text-xl md:text-2xl',
      sub: 'text-[9px] sm:text-xs',
      gap: 'gap-1.5 sm:gap-2.5',
    },
    lg: {
      iconBox: 'w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl',
      heart: 'w-4.5 h-4.5 sm:w-6 sm:h-6',
      sparkle: 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5',
      title: 'text-base sm:text-2xl md:text-3xl',
      sub: 'text-[10px] sm:text-sm',
      gap: 'gap-2 sm:gap-3',
    },
  }[size];

  return (
    <div className={`flex items-center ${sizeClasses.gap} group select-none shrink-0 ${className}`}>
      {/* Auspicious Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className={`${sizeClasses.iconBox} bg-gradient-to-br from-primary via-primary-light to-[#580016] p-0.5 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
          <div className="w-full h-full bg-white/10 rounded-[inherit] flex items-center justify-center border border-[#D4AF37]/40 backdrop-blur-xs">
            <div className="relative flex items-center justify-center">
              <Heart className={`${sizeClasses.heart} text-[#D4AF37] fill-[#D4AF37]/35 transition-transform group-hover:scale-110`} />
              <Sparkles className={`${sizeClasses.sparkle} text-[#FFFDF9] absolute -top-1 -right-1 animate-pulse`} />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none sm:leading-tight shrink-0">
        <span className={`font-serif font-black tracking-tight text-primary ${sizeClasses.title} drop-shadow-xs whitespace-nowrap`}>
          {BRANDING.brandNameTamil}
        </span>
        {showSubtitle && (
          <span className={`font-bold tracking-widest uppercase text-[#B45309] font-sans mt-0.5 ${sizeClasses.sub} whitespace-nowrap hidden sm:inline`}>
            {BRANDING.brandName}
          </span>
        )}
      </div>
    </div>
  );
}
