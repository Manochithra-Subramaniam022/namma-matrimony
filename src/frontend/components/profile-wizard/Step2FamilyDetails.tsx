'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Home, Briefcase, Users, DollarSign, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { formTranslations } from '@/frontend/utils/formTranslations';

const step2Schema = z.object({
  // Parents
  fatherName: z.string().min(2, 'Father name is required'),
  fatherStatus: z.enum(['ALIVE', 'LATE']).default('ALIVE'),
  fatherOccupation: z.string().optional(),
  fatherMobile: z.string().optional(),

  motherName: z.string().min(2, 'Mother name is required'),
  motherStatus: z.enum(['ALIVE', 'LATE']).default('ALIVE'),
  motherOccupation: z.string().optional(),
  motherMobile: z.string().optional(),

  // Dynamic Siblings
  siblingsList: z.array(
    z.object({
      name: z.string().min(1, 'Sibling name required'),
      relation: z.enum(['ELDER_BROTHER', 'YOUNGER_BROTHER', 'ELDER_SISTER', 'YOUNGER_SISTER']),
      maritalStatus: z.enum(['MARRIED', 'UNMARRIED']),
    })
  ).default([]),

  // Career
  workNature: z.enum(['PRIVATE', 'GOVT', 'BUSINESS', 'NRI', 'NOT_WORKING']).default('PRIVATE'),
  workSector: z.string().optional(),
  businessType: z.string().optional(),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  workMode: z.string().optional(),
  businessDetails: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  workCity: z.string().optional(),
  workMapLink: z.string().optional(),

  // Property & Assets
  houseType: z.enum(['OWN_HOUSE', 'OWN_APARTMENT', 'RENTED', 'ANCESTRAL']).default('OWN_HOUSE'),
  houseSqft: z.string().optional(),
  rentalIncomeMonthly: z.string().optional(),
  agriculturalLandAcres: z.string().optional(),
  vacantLandSqft: z.string().optional(),
  totalNetAssets: z.string().optional(),
  propertyComments: z.string().optional(),

  // Seer / Dowry Details (dynamically adjusted)
  goldPavun: z.string().optional(),
  seerCash: z.string().optional(),
  seerVehicle: z.string().optional(),
});

type Step2FormValues = z.infer<typeof step2Schema>;

export function Step2FamilyDetails({
  onNext,
  onPrev,
  language = 'TA',
  initialData,
  gender = 'MALE',
}: {
  onNext: (data: Step2FormValues) => void;
  onPrev: () => void;
  language?: 'TA' | 'EN';
  initialData?: any;
  gender?: string;
}) {
  const t = formTranslations[language];

  const rawFatherLiving = initialData?.fatherLivingStatus || (initialData?.fatherStatus === 'LATE' ? 'LATE' : (initialData?.family?.fatherLivingStatus || initialData?.jathagamData?.fatherLivingStatus || 'ALIVE'));
  const initialFatherStatus = rawFatherLiving === 'LATE' ? 'LATE' : 'ALIVE';
  const initialFatherOccupation = initialData?.fatherOccupation || (initialData?.fatherStatus && initialData?.fatherStatus !== 'LATE' && initialData?.fatherStatus !== 'ALIVE' ? initialData.fatherStatus : '') || initialData?.family?.fatherStatus || initialData?.jathagamData?.fatherOccupation || '';

  const rawMotherLiving = initialData?.motherLivingStatus || (initialData?.motherStatus === 'LATE' ? 'LATE' : (initialData?.family?.motherLivingStatus || initialData?.jathagamData?.motherLivingStatus || 'ALIVE'));
  const initialMotherStatus = rawMotherLiving === 'LATE' ? 'LATE' : 'ALIVE';
  const initialMotherOccupation = initialData?.motherOccupation || (initialData?.motherStatus && initialData?.motherStatus !== 'LATE' && initialData?.motherStatus !== 'ALIVE' ? initialData.motherStatus : '') || initialData?.family?.motherStatus || initialData?.jathagamData?.motherOccupation || '';

  const resolveInitialSiblings = (data: any) => {
    if (Array.isArray(data?.siblingsList) && data.siblingsList.length > 0) return data.siblingsList;
    if (Array.isArray(data?.jathagamData?.siblingsList) && data.jathagamData.siblingsList.length > 0) return data.jathagamData.siblingsList;
    if (Array.isArray(data?.siblings) && data.siblings.length > 0) return data.siblings;
    if (Array.isArray(data?.family?.siblings) && data.family.siblings.length > 0) return data.family.siblings;
    if (data?.family?.siteLand) {
      try {
        const parsed = JSON.parse(data.family.siteLand);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    if (data?.siteLand) {
      try {
        const parsed = JSON.parse(data.siteLand);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {
      fatherName: initialData?.fatherName || initialData?.family?.fatherName || initialData?.jathagamData?.fatherName || '',
      fatherStatus: initialFatherStatus,
      fatherOccupation: initialFatherStatus === 'LATE' ? '' : initialFatherOccupation,
      fatherMobile: initialFatherStatus === 'LATE' ? '' : (initialData?.fatherMobile || initialData?.family?.fatherMobile || initialData?.jathagamData?.fatherMobile || ''),

      motherName: initialData?.motherName || initialData?.family?.motherName || initialData?.jathagamData?.motherName || '',
      motherStatus: initialMotherStatus,
      motherOccupation: initialMotherStatus === 'LATE' ? '' : initialMotherOccupation,
      motherMobile: initialMotherStatus === 'LATE' ? '' : (initialData?.motherMobile || initialData?.family?.motherMobile || initialData?.jathagamData?.motherMobile || ''),

      siblingsList: resolveInitialSiblings(initialData),

      workNature: initialData?.workNature || initialData?.family?.workNature || initialData?.jathagamData?.workNature || 'PRIVATE',
      workSector: initialData?.workSector || initialData?.jathagamData?.workSector || '',
      businessType: initialData?.businessType || initialData?.jathagamData?.businessType || '',
      companyName: initialData?.companyName || initialData?.family?.organisation || initialData?.jathagamData?.companyName || '',
      designation: initialData?.designation || initialData?.family?.designation || initialData?.jathagamData?.designation || '',
      workMode: initialData?.workMode || initialData?.jathagamData?.workMode || '',
      businessDetails: initialData?.businessDetails || initialData?.jathagamData?.businessDetails || '',
      monthlyIncome: initialData?.monthlyIncome || initialData?.jathagamData?.monthlyIncome || '',
      annualIncome: initialData?.annualIncome || initialData?.family?.salary || initialData?.jathagamData?.annualIncome || '',
      workCity: initialData?.workCity || initialData?.family?.workingAddress || initialData?.jathagamData?.workCity || '',
      workMapLink: initialData?.workMapLink || initialData?.family?.googleLocation || initialData?.jathagamData?.workMapLink || '',

      houseType: initialData?.houseType || initialData?.family?.houseType || initialData?.jathagamData?.houseType || 'OWN_HOUSE',
      houseSqft: initialData?.houseSqft || initialData?.family?.houseSqFt || initialData?.jathagamData?.houseSqft || '',
      rentalIncomeMonthly: initialData?.rentalIncomeMonthly || initialData?.family?.rentalIncome || initialData?.jathagamData?.rentalIncomeMonthly || '',
      agriculturalLandAcres: initialData?.agriculturalLandAcres || initialData?.family?.thottam || initialData?.jathagamData?.agriculturalLandAcres || '',
      vacantLandSqft: initialData?.vacantLandSqft || initialData?.family?.vacantLand || initialData?.jathagamData?.vacantLandSqft || '',
      totalNetAssets: initialData?.totalNetAssets || initialData?.family?.totalAssetValue || initialData?.jathagamData?.totalNetAssets || '',
      propertyComments: initialData?.propertyComments || initialData?.family?.assetComments || initialData?.jathagamData?.propertyComments || '',

      goldPavun: initialData?.goldPavun || initialData?.jathagamData?.goldPavun || '',
      seerCash: initialData?.seerCash || initialData?.jathagamData?.seerCash || '',
      seerVehicle: initialData?.seerVehicle || initialData?.jathagamData?.seerVehicle || '',
    },
  });

  // Re-sync when initialData is updated
  useEffect(() => {
    if (initialData) {
      const fLiving = initialData?.fatherLivingStatus || (initialData?.fatherStatus === 'LATE' ? 'LATE' : (initialData?.family?.fatherLivingStatus || initialData?.jathagamData?.fatherLivingStatus || 'ALIVE'));
      const fStatus = fLiving === 'LATE' ? 'LATE' : 'ALIVE';
      const fOcc = initialData?.fatherOccupation || (initialData?.fatherStatus && initialData?.fatherStatus !== 'LATE' && initialData?.fatherStatus !== 'ALIVE' ? initialData.fatherStatus : '') || initialData?.family?.fatherStatus || initialData?.jathagamData?.fatherOccupation || '';

      const mLiving = initialData?.motherLivingStatus || (initialData?.motherStatus === 'LATE' ? 'LATE' : (initialData?.family?.motherLivingStatus || initialData?.jathagamData?.motherLivingStatus || 'ALIVE'));
      const mStatus = mLiving === 'LATE' ? 'LATE' : 'ALIVE';
      const mOcc = initialData?.motherOccupation || (initialData?.motherStatus && initialData?.motherStatus !== 'LATE' && initialData?.motherStatus !== 'ALIVE' ? initialData.motherStatus : '') || initialData?.family?.motherStatus || initialData?.jathagamData?.motherOccupation || '';

      reset({
        fatherName: initialData?.fatherName || initialData?.family?.fatherName || initialData?.jathagamData?.fatherName || '',
        fatherStatus: fStatus,
        fatherOccupation: fStatus === 'LATE' ? '' : fOcc,
        fatherMobile: fStatus === 'LATE' ? '' : (initialData?.fatherMobile || initialData?.family?.fatherMobile || initialData?.jathagamData?.fatherMobile || ''),

        motherName: initialData?.motherName || initialData?.family?.motherName || initialData?.jathagamData?.motherName || '',
        motherStatus: mStatus,
        motherOccupation: mStatus === 'LATE' ? '' : mOcc,
        motherMobile: mStatus === 'LATE' ? '' : (initialData?.motherMobile || initialData?.family?.motherMobile || initialData?.jathagamData?.motherMobile || ''),

        siblingsList: resolveInitialSiblings(initialData),

        workNature: initialData?.workNature || initialData?.family?.workNature || initialData?.jathagamData?.workNature || 'PRIVATE',
        workSector: initialData?.workSector || initialData?.jathagamData?.workSector || '',
        businessType: initialData?.businessType || initialData?.jathagamData?.businessType || '',
        companyName: initialData?.companyName || initialData?.family?.organisation || initialData?.jathagamData?.companyName || '',
        designation: initialData?.designation || initialData?.family?.designation || initialData?.jathagamData?.designation || '',
        workMode: initialData?.workMode || initialData?.jathagamData?.workMode || '',
        businessDetails: initialData?.businessDetails || initialData?.jathagamData?.businessDetails || '',
        monthlyIncome: initialData?.monthlyIncome || initialData?.jathagamData?.monthlyIncome || '',
        annualIncome: initialData?.annualIncome || initialData?.family?.salary || initialData?.jathagamData?.annualIncome || '',
        workCity: initialData?.workCity || initialData?.family?.workingAddress || initialData?.jathagamData?.workCity || '',
        workMapLink: initialData?.workMapLink || initialData?.family?.googleLocation || initialData?.jathagamData?.workMapLink || '',

        houseType: initialData?.houseType || initialData?.family?.houseType || initialData?.jathagamData?.houseType || 'OWN_HOUSE',
        houseSqft: initialData?.houseSqft || initialData?.family?.houseSqFt || initialData?.jathagamData?.houseSqft || '',
        rentalIncomeMonthly: initialData?.rentalIncomeMonthly || initialData?.family?.rentalIncome || initialData?.jathagamData?.rentalIncomeMonthly || '',
        agriculturalLandAcres: initialData?.agriculturalLandAcres || initialData?.family?.thottam || initialData?.jathagamData?.agriculturalLandAcres || '',
        vacantLandSqft: initialData?.vacantLandSqft || initialData?.family?.vacantLand || initialData?.jathagamData?.vacantLandSqft || '',
        totalNetAssets: initialData?.totalNetAssets || initialData?.family?.totalAssetValue || initialData?.jathagamData?.totalNetAssets || '',
        propertyComments: initialData?.propertyComments || initialData?.family?.assetComments || initialData?.jathagamData?.propertyComments || '',

        goldPavun: initialData?.goldPavun || initialData?.jathagamData?.goldPavun || '',
        seerCash: initialData?.seerCash || initialData?.jathagamData?.seerCash || '',
        seerVehicle: initialData?.seerVehicle || initialData?.jathagamData?.seerVehicle || '',
      });
    }
  }, [initialData, reset]);

  const { fields: siblingFields, append: appendSibling, remove: removeSibling } = useFieldArray({
    control,
    name: 'siblingsList',
  });

  const watchFatherStatus = watch('fatherStatus');
  const watchMotherStatus = watch('motherStatus');
  const watchWorkNature = watch('workNature');
  const watchWorkSector = watch('workSector');
  const watchBusinessType = watch('businessType');
  const watchWorkMode = watch('workMode');
  const watchHouseType = watch('houseType');

  const handleFormSubmit = (data: Step2FormValues) => {
    const cleanedData = {
      ...data,
      fatherOccupation: data.fatherStatus === 'LATE' ? '' : data.fatherOccupation,
      fatherMobile: data.fatherStatus === 'LATE' ? '' : data.fatherMobile,
      motherOccupation: data.motherStatus === 'LATE' ? '' : data.motherOccupation,
      motherMobile: data.motherStatus === 'LATE' ? '' : data.motherMobile,
    };
    onNext(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. PARENTS DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '1. பெற்றோர் விவரங்கள் (Parents Information)' : '1. Parents Information'}
          </h3>
        </div>

        {/* Father Details */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-primary/10 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-primary font-serif">
              {language === 'TA' ? 'தந்தை விவரங்கள் (Father Details)' : 'Father Information'}
            </h4>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setValue('fatherStatus', 'ALIVE')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchFatherStatus === 'ALIVE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'உயிருடன் உள்ளார் (Alive)' : 'Alive'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('fatherStatus', 'LATE');
                  setValue('fatherOccupation', '');
                  setValue('fatherMobile', '');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchFatherStatus === 'LATE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'மறைந்தார் (Late)' : 'Late'}
              </button>
            </div>
          </div>

          <div className={watchFatherStatus === 'LATE' ? 'max-w-md' : 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA'
                  ? (watchFatherStatus === 'LATE' ? 'மறைந்த தந்தை பெயர் (Late Father Name)' : 'தந்தை பெயர் (Father Name)')
                  : (watchFatherStatus === 'LATE' ? 'Late Father Name' : 'Father Full Name')}
              </label>
              <input
                type="text"
                {...register('fatherName')}
                placeholder={watchFatherStatus === 'LATE' ? 'e.g. Late S. Subramaniam' : 'e.g. S. Subramaniam'}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
              {errors.fatherName && <p className="text-xs text-red-600 font-semibold mt-1">{errors.fatherName.message}</p>}
            </div>

            {watchFatherStatus !== 'LATE' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தந்தை தொழில் / நிலை' : 'Father Occupation'}
                  </label>
                  <input
                    type="text"
                    {...register('fatherOccupation')}
                    placeholder="e.g. Business / Agriculture / Retired"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தந்தை மொபைல் எண்' : 'Father Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('fatherMobile')}
                    placeholder="9876543210"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mother Details */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-primary/10 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-primary font-serif">
              {language === 'TA' ? 'தாய் விவரங்கள் (Mother Details)' : 'Mother Information'}
            </h4>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setValue('motherStatus', 'ALIVE')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchMotherStatus === 'ALIVE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'உயிருடன் உள்ளார் (Alive)' : 'Alive'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('motherStatus', 'LATE');
                  setValue('motherOccupation', '');
                  setValue('motherMobile', '');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  watchMotherStatus === 'LATE' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {language === 'TA' ? 'மறைந்தார் (Late)' : 'Late'}
              </button>
            </div>
          </div>

          <div className={watchMotherStatus === 'LATE' ? 'max-w-md' : 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 after:content-['*'] after:ml-1 after:text-primary">
                {language === 'TA'
                  ? (watchMotherStatus === 'LATE' ? 'மறைந்த தாய் பெயர் (Late Mother Name)' : 'தாய் பெயர் (Mother Name)')
                  : (watchMotherStatus === 'LATE' ? 'Late Mother Name' : 'Mother Full Name')}
              </label>
              <input
                type="text"
                {...register('motherName')}
                placeholder={watchMotherStatus === 'LATE' ? 'e.g. Late S. Lakshmi' : 'e.g. S. Lakshmi'}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
              {errors.motherName && <p className="text-xs text-red-600 font-semibold mt-1">{errors.motherName.message}</p>}
            </div>

            {watchMotherStatus !== 'LATE' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தாய் தொழில் / நிலை' : 'Mother Occupation'}
                  </label>
                  <input
                    type="text"
                    {...register('motherOccupation')}
                    placeholder="e.g. Homemaker / Teacher / Govt"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {language === 'TA' ? 'தாய் மொபைல் எண்' : 'Mother Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register('motherMobile')}
                    placeholder="9876543210"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC SIBLINGS DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4 flex justify-between items-center gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-black text-primary font-serif">
              {language === 'TA' ? '2. உடன்பிறப்புகள் விவரங்கள் (Siblings Details)' : '2. Siblings Details'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'TA' ? 'அண்ணன், தம்பி, அக்கா, தங்கை விவரங்களை சேர்க்கலாம்' : 'Add brothers and sisters'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => appendSibling({ name: '', relation: 'ELDER_BROTHER', maritalStatus: 'UNMARRIED' })}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-light transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'TA' ? 'உடன்பிறப்பு சேர்க்க' : 'Add Sibling'}
          </button>
        </div>

        {siblingFields.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-3.5 sm:p-4 text-center bg-gray-50 rounded-xl sm:rounded-2xl border border-dashed border-gray-200">
            {language === 'TA' ? 'உடன்பிறப்புகள் இல்லை என்றால் தவிர்க்கலாம்' : 'No siblings added yet (Optional)'}
          </p>
        ) : (
          <div className="space-y-3">
            {siblingFields.map((field, idx) => (
              <div key={field.id} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3 items-center">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    {...register(`siblingsList.${idx}.name`)}
                    placeholder="Sibling Full Name"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <select
                    {...register(`siblingsList.${idx}.relation`)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-bold"
                  >
                    <option value="ELDER_BROTHER">{language === 'TA' ? 'அண்ணன் (Elder Brother)' : 'Elder Brother'}</option>
                    <option value="YOUNGER_BROTHER">{language === 'TA' ? 'தம்பி (Younger Brother)' : 'Younger Brother'}</option>
                    <option value="ELDER_SISTER">{language === 'TA' ? 'அக்கா (Elder Sister)' : 'Elder Sister'}</option>
                    <option value="YOUNGER_SISTER">{language === 'TA' ? 'தங்கை (Younger Sister)' : 'Younger Sister'}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    {...register(`siblingsList.${idx}.maritalStatus`)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-medium"
                  >
                    <option value="UNMARRIED">{language === 'TA' ? 'திருமணம் ஆகாதவர்' : 'Unmarried'}</option>
                    <option value="MARRIED">{language === 'TA' ? 'திருமணம் ஆனவர்' : 'Married'}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSibling(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. GROOM / BRIDE CAREER & BUSINESS DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '3. தொழில் & பணி விரிவான விவரங்கள் (Career & Business)' : '3. Detailed Career & Business Profile'}
          </h3>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {watchWorkNature === 'BUSINESS'
              ? (language === 'TA' ? 'சுயதொழில் / வணிகம்' : 'Business / Self-Employed')
              : watchWorkNature === 'NOT_WORKING'
              ? (language === 'TA' ? 'பணியில் இல்லை' : 'Not Working')
              : (language === 'TA' ? 'உத்தியோகம் / பணி' : 'Employment / Job')}
          </span>
        </div>

        {/* Work Nature Selector Chips */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
            {language === 'TA' ? 'பணியின் தன்மை / தொழில் நிலை (Employment / Business Nature)' : 'Employment / Business Nature'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
            {[
              { id: 'PRIVATE', nameEn: 'Private Company', nameTa: 'தனியார் நிறுவனம்' },
              { id: 'GOVT', nameEn: 'Govt / PSU', nameTa: 'அரசுப் பணி' },
              { id: 'BUSINESS', nameEn: 'Business / Self', nameTa: 'சொந்த தொழில்' },
              { id: 'NRI', nameEn: 'Abroad / NRI', nameTa: 'வெளிநாடு (NRI)' },
              { id: 'NOT_WORKING', nameEn: 'Not Working', nameTa: 'பணியில் இல்லை' },
            ].map((wn, idx) => (
              <button
                key={wn.id}
                type="button"
                onClick={() => setValue('workNature', wn.id as any)}
                className={`h-11 px-2 rounded-xl text-xs font-bold transition-all border ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  watchWorkNature === wn.id
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'TA' ? wn.nameTa : wn.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* CASE A: BUSINESS / SELF-EMPLOYED DETAILED FORM */}
        {watchWorkNature === 'BUSINESS' ? (
          <div className="space-y-4 pt-2 border-t border-primary/10">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                {language === 'TA'
                  ? 'வணிகத்தின் வகை, தயாரிப்புகள், ஊழியர்கள் மற்றும் செயல்பாட்டு விவரங்களை தெளிவாக குறிப்பிடவும்.'
                  : 'Please specify your business structure, industry, role, products/services, and scale.'}
              </span>
            </div>

            {/* Business Structure / Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'வணிக அமைப்பு / நிறுவனம் முறை (Business Structure)' : 'Business Structure / Type'}
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { id: 'PROPRIETORSHIP', nameTa: 'தனியுரிமை (Proprietorship)', nameEn: 'Proprietorship' },
                  { id: 'PARTNERSHIP', nameTa: 'கூட்டாண்மை (Partnership)', nameEn: 'Partnership' },
                  { id: 'PVT_LTD', nameTa: 'பிரைவேட் லிமிடெட் (Pvt Ltd)', nameEn: 'Pvt Ltd' },
                  { id: 'FACTORY_MILL', nameTa: 'ஆலை / மில் (Factory / Mill)', nameEn: 'Factory / Mill' },
                  { id: 'FAMILY_BUSINESS', nameTa: 'குடும்பத் தொழில் (Family Business)', nameEn: 'Family Business' },
                  { id: 'RETAIL_SHOWROOM', nameTa: 'சில்லறை / ஷோரூம் (Retail / Showroom)', nameEn: 'Retail' },
                  { id: 'WHOLESALE_TRADE', nameTa: 'மொத்த வர்த்தகம் (Wholesale / Trade)', nameEn: 'Wholesale' },
                  { id: 'EXPORT_IMPORT', nameTa: 'ஏற்றுமதி - இறக்குமதி (Export / Import)', nameEn: 'Export / Import' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setValue('businessType', st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      watchBusinessType === st.id
                        ? 'bg-[#D4AF37] text-gray-900 border-[#b59226] shadow-xs'
                        : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {language === 'TA' ? st.nameTa : st.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Industry / Sector Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'தொழில் துறை / பிரிவு (Business Industry / Sector)' : 'Business Industry / Sector'}
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { id: 'TEXTILES', nameTa: 'ஜவுளி & ஆயத்த ஆடை (Textiles & Garments)', nameEn: 'Textiles' },
                  { id: 'MANUFACTURING', nameTa: 'உற்பத்தித் துறை (Manufacturing)', nameEn: 'Manufacturing' },
                  { id: 'CONSTRUCTION', nameTa: 'கட்டுமானம் & ரியல் எஸ்டேட் (Construction / Builders)', nameEn: 'Construction' },
                  { id: 'IT_SERVICES', nameTa: 'ஐடி & மென்பொருள் நிறுவனம் (IT & Tech Services)', nameEn: 'IT & Software' },
                  { id: 'AGRO_MILLING', nameTa: 'விவசாய வர்த்தகம் & மில் (Agro / Oil / Rice Mill)', nameEn: 'Agro Milling' },
                  { id: 'AUTOMOBILE', nameTa: 'வாகனத் துறை & உதிரிபாகங்கள் (Automobile & Spares)', nameEn: 'Automobile' },
                  { id: 'FOOD_HOSPITALITY', nameTa: 'உணவு & உணவகம் (Food & Hospitality)', nameEn: 'Food / Hotel' },
                  { id: 'HEALTHCARE_PHARMA', nameTa: 'மருத்துவம் & பார்மசி (Healthcare / Pharma)', nameEn: 'Healthcare' },
                  { id: 'LOGISTICS', nameTa: 'சரக்கு போக்குவரத்து (Transport & Logistics)', nameEn: 'Transport' },
                  { id: 'OTHER_BIZ', nameTa: 'இதர வணிகம் (Other Business)', nameEn: 'Other' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setValue('workSector', sec.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      watchWorkSector === sec.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {language === 'TA' ? sec.nameTa : sec.nameEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'நிறுவனம் / வணிகப் பெயர் (Company / Business Name)' : 'Company / Business Name'}
                </label>
                <input
                  type="text"
                  {...register('companyName')}
                  placeholder="e.g. SELSOFT Technologies / Sri Murugan Textiles"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'தொழிலில் உங்கள் பொறுப்பு (Role in Business)' : 'Role / Position in Business'}
                </label>
                <input
                  type="text"
                  {...register('designation')}
                  placeholder="e.g. நிறுவனர் & CEO / Managing Director / Proprietor / Partner"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'தொழில் நடைபெறும் இடம் (Business Location City)' : 'Business Location City'}
                </label>
                <input
                  type="text"
                  {...register('workCity')}
                  placeholder="e.g. Tirupur / Coimbatore / Erode"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'மாத வருமானம் (Monthly Income in ₹)' : 'Monthly Income (₹)'}
                </label>
                <input
                  type="text"
                  {...register('monthlyIncome')}
                  placeholder="e.g. 1,50,000"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'ஆண்டு வருமானம் / விற்றுமுதல் (Annual Profit / Turnover)' : 'Annual Profit / Turnover'}
                </label>
                <input
                  type="text"
                  {...register('annualIncome')}
                  placeholder="e.g. ₹20 LPA / Turnover ₹2 Cr+"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'கூகுள் வரைபட இருப்பிடம் (Google Map Link)' : 'Business Google Map Link'}
                </label>
                <input
                  type="url"
                  {...register('workMapLink')}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'தொழில் பற்றிய கூடுதல் விரிவான குறிப்புகள் (Business Overview & Scale)' : 'Business Products, Services & Scale'}
                </label>
                <textarea
                  rows={2}
                  {...register('businessDetails')}
                  placeholder="தொழில் தயாரிப்புகள், ஊழியர்கள் எண்ணிக்கை, எத்தனை வருடங்களாக இயங்குகிறது போன்ற விவரங்கள் (e.g. Manufacturing and exporting knitwear with 40+ employees, operating for 10+ years)"
                  className="w-full p-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        ) : watchWorkNature === 'NOT_WORKING' ? (
          /* CASE B: NOT WORKING */
          <div className="space-y-4 pt-2 border-t border-primary/10">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-2">
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                {language === 'TA' ? 'தற்போது பணியில் இல்லை' : 'Currently Not Working'}
              </span>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                {language === 'TA'
                  ? 'மேற்படிப்பு, அரசுத் தேர்வுக்கான தயாரிப்பில் அல்லது இல்லத்தரசியாக இருப்பின் கீழே உள்ள குறிப்பில் தெரிவிக்கலாம்.'
                  : 'If you are preparing for exams, pursuing higher studies, or managing the home, you can mention it below.'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'கூடுதல் குறிப்பு (Optional Notes)' : 'Optional Career Notes'}
              </label>
              <input
                type="text"
                {...register('businessDetails')}
                placeholder="e.g. Preparing for TNPSC Group 1 / UPSC / Higher Studies"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>
        ) : (
          /* CASE C: PRIVATE / GOVT / NRI EMPLOYMENT DETAILED FORM */
          <div className="space-y-4 pt-2 border-t border-primary/10">
            
            {/* Industry / Domain Chips */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'பணிபுரியும் துறை / பிரிவு (Industry / Domain)' : 'Industry / Domain'}
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { id: 'IT_SOFTWARE', nameTa: 'தகவல் தொழில்நுட்பம் (IT & Software)', nameEn: 'IT & Software' },
                  { id: 'BANKING_FINANCE', nameTa: 'வங்கி & நிதி (Banking & Finance)', nameEn: 'Banking & Finance' },
                  { id: 'CORE_ENGINEERING', nameTa: 'பொறியியல் & உற்பத்தி (Core Engineering)', nameEn: 'Engineering' },
                  { id: 'HEALTHCARE', nameTa: 'மருத்துவம் & பார்மசி (Healthcare / Hospital)', nameEn: 'Healthcare' },
                  { id: 'GOVT_CIVIL', nameTa: 'அரசுப் பணி & நிர்வாகம் (Govt / Civil Services)', nameEn: 'Govt Services' },
                  { id: 'EDUCATION', nameTa: 'கல்வி & பேராசிரியர் (Education / Teaching)', nameEn: 'Education' },
                  { id: 'SALES_MARKETING', nameTa: 'விற்பனை & சந்தைப்படுத்தல் (Sales & Marketing)', nameEn: 'Sales & Marketing' },
                  { id: 'AVIATION_SHIPPING', nameTa: 'விமானம் & கப்பல் துறை (Aviation / Shipping)', nameEn: 'Aviation / Marine' },
                  { id: 'OTHER_INDUSTRY', nameTa: 'இதர துறை (Other Industry)', nameEn: 'Other' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setValue('workSector', sec.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      watchWorkSector === sec.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {language === 'TA' ? sec.nameTa : sec.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Mode Chips */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                {language === 'TA' ? 'பணி முறை (Work Mode)' : 'Work Mode'}
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { id: 'OFFICE', nameTa: 'அலுவலக நேரடிப் பணி (Work From Office)', nameEn: 'Office' },
                  { id: 'HYBRID', nameTa: 'கலப்பு முறை (Hybrid)', nameEn: 'Hybrid' },
                  { id: 'WFH', nameTa: 'வீட்டிலிருந்தே பணி (Remote / WFH)', nameEn: 'Remote / WFH' },
                  { id: 'ONSITE', nameTa: 'வெளிநாட்டு நேரடிப் பணி (Onsite Abroad)', nameEn: 'Onsite Abroad' },
                ].map((wm) => (
                  <button
                    key={wm.id}
                    type="button"
                    onClick={() => setValue('workMode', wm.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      watchWorkMode === wm.id
                        ? 'bg-[#D4AF37] text-gray-900 border-[#b59226] shadow-xs'
                        : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {language === 'TA' ? wm.nameTa : wm.nameEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'நிறுவனம் / அலுவலகப் பெயர் (Company / Organization Name)' : 'Company / Organization Name'}
                </label>
                <input
                  type="text"
                  {...register('companyName')}
                  placeholder="e.g. TCS / Zoho / L&T / State Bank of India"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'பதவி / பதவிப் பெயர் (Designation / Job Title)' : 'Designation / Job Title'}
                </label>
                <input
                  type="text"
                  {...register('designation')}
                  placeholder="e.g. Lead Software Architect / Branch Manager / Assistant Engineer"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'பணிபுரியும் நகரம் / நாடு (Work City / Country)' : 'Work City / Country'}
                </label>
                <input
                  type="text"
                  {...register('workCity')}
                  placeholder="e.g. Chennai / Bangalore / Coimbatore / Singapore"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'மாத சம்பளம் (Monthly Salary in ₹)' : 'Monthly Salary (₹)'}
                </label>
                <input
                  type="text"
                  {...register('monthlyIncome')}
                  placeholder="e.g. 85,000"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'ஆண்டு வருமானம் (Annual CTC in LPA)' : 'Annual CTC (LPA)'}
                </label>
                <input
                  type="text"
                  {...register('annualIncome')}
                  placeholder="e.g. 12 LPA"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'அலுவலக கூகுள் வரைபட இணைப்பு (Office Map Link)' : 'Office Map Link (Optional)'}
                </label>
                <input
                  type="url"
                  {...register('workMapLink')}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  {language === 'TA' ? 'பணி மற்றும் அனுபவம் பற்றிய குறிப்பு (Job Description / Role Details)' : 'Job Description / Experience Details'}
                </label>
                <textarea
                  rows={2}
                  {...register('businessDetails')}
                  placeholder="உங்கள் பணிப் பொறுப்புகள் அல்லது அனுபவம் பற்றிய குறிப்புகள் (e.g. 6+ years experience in Software Development, leading a cloud infrastructure team)"
                  className="w-full p-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. PROPERTY & ASSETS DETAILS */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm space-y-4 sm:space-y-6">
        <div className="border-b border-primary/10 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-xl font-black text-primary font-serif flex items-center gap-2">
            <Home className="w-5 h-5 text-[#D4AF37] shrink-0" />
            {language === 'TA' ? '4. சொத்து மற்றும் பூர்வீக விவரங்கள்' : '4. Property & Asset Details'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {language === 'TA' ? 'வீட்டு வகை (House Ownership)' : 'House Ownership Status'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {[
                { id: 'OWN_HOUSE', nameEn: 'Own Independent House', nameTa: 'சொந்த வீடு / பங்களா' },
                { id: 'OWN_APARTMENT', nameEn: 'Own Apartment / Flat', nameTa: 'சொந்த அடுக்குமாடி' },
                { id: 'RENTED', nameEn: 'Rented House', nameTa: 'வாடகை வீடு' },
                { id: 'ANCESTRAL', nameEn: 'Ancestral Village Home', nameTa: 'பூர்வீக வீடு' },
              ].map((ht) => (
                <button
                  key={ht.id}
                  type="button"
                  onClick={() => setValue('houseType', ht.id as any)}
                  className={`h-11 px-2 rounded-xl text-xs font-bold transition-all border ${
                    watchHouseType === ht.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-[#FFFDF9] text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'TA' ? ht.nameTa : ht.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'வீட்டு தரைப்பரப்பு (Built-up Area in Sq.Ft)' : 'House Area (Sq.Ft)'}
            </label>
            <input
              type="text"
              {...register('houseSqft')}
              placeholder="e.g. 2400 Sq.Ft"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'மாத வாடகை வருமானம் (Monthly Rental Income)' : 'Monthly Rental Income (₹)'}
            </label>
            <input
              type="text"
              {...register('rentalIncomeMonthly')}
              placeholder="e.g. 30,000"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'விவசாய நிலம் / தோட்டம் (Acres / Cents)' : 'Agricultural Land (Acres / Cents)'}
            </label>
            <input
              type="text"
              {...register('agriculturalLandAcres')}
              placeholder="e.g. 5 Acres / 50 Cents"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'காலி மனை / வணிக இடம் (Vacant Land Sq.Ft)' : 'Vacant Plot / Commercial (Sq.Ft)'}
            </label>
            <input
              type="text"
              {...register('vacantLandSqft')}
              placeholder="e.g. 2400 Sq.Ft"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'மொத்த சொத்து மதிப்பு (Estimated Net Assets)' : 'Total Net Assets Estimate'}
            </label>
            <input
              type="text"
              {...register('totalNetAssets')}
              placeholder="e.g. 2 - 3 Crores"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              {language === 'TA' ? 'கூடுதல் சொத்து விவரங்கள் / குறிப்புகள்' : 'Additional Asset Notes / Comments'}
            </label>
            <input
              type="text"
              {...register('propertyComments')}
              placeholder="e.g. Borewell with good water source, coconut trees, rental commercial shops"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-gray-900 font-medium text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Dowry / Seer Details */}
        <div className="pt-4 border-t border-primary/10">
          <h4 className="text-xs font-bold text-primary uppercase mb-3 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
            {gender === 'FEMALE'
              ? (language === 'TA' ? 'வழங்கும் சீர்வரிசை விவரங்கள் (Seer / Dowry Plan)' : 'Seer / Dowry Expected to Provide')
              : (language === 'TA' ? 'எதிர்பார்க்கும் சீர்வரிசை / அன்பளிப்பு விவரங்கள்' : 'Expected Seer / Dowry Overview')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {language === 'TA' ? 'தங்கம் / பவுன் (Gold in Sovereigns / Pavun)' : 'Gold (in Pavun)'}
              </label>
              <input
                type="text"
                {...register('goldPavun')}
                placeholder="e.g. 50 Pavun"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {language === 'TA' ? 'ரொக்கம் / பணம் (Cash in Lakhs)' : 'Cash / Deposit'}
              </label>
              <input
                type="text"
                {...register('seerCash')}
                placeholder="e.g. 10 Lakhs"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {language === 'TA' ? 'வாகனம் (Vehicle / Car)' : 'Vehicle (Car / Two Wheeler)'}
              </label>
              <input
                type="text"
                {...register('seerVehicle')}
                placeholder="e.g. SUV / Car"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-0 justify-between items-center pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{language === 'TA' ? 'முந்தைய படி' : 'Back to Step 1'}</span>
        </button>

        <button
          type="submit"
          className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 sm:px-10 py-3.5 rounded-full font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{language === 'TA' ? 'அடுத்த படிக்குச் செல்க →' : 'Continue to Step 3 →'}</span>
        </button>
      </div>
    </form>
  );
}
