'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CASTE_OPTIONS,
  DropdownOption,
} from '@/constants/demographics';
import {
  DEFAULT_CASTE_KOOTTAM_MAP,
  CasteKoottamConfig,
  getKoottamFieldLabel,
} from '@/constants/casteKoottam';
import {
  Building,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ListPlus,
  RotateCcw,
  Tag,
  Users
} from 'lucide-react';

interface CasteKoottamManagerProps {
  language?: 'TA' | 'EN';
  showToast?: (text: string, type?: 'success' | 'error') => void;
}

export default function CasteKoottamManager({
  language = 'TA',
  showToast,
}: CasteKoottamManagerProps) {
  const [config, setConfig] = useState<CasteKoottamConfig>(DEFAULT_CASTE_KOOTTAM_MAP);
  const [selectedCaste, setSelectedCaste] = useState<string>('Kongu Vellala Gounder');
  const [casteSearchQuery, setCasteSearchQuery] = useState('');
  const [koottamSearchQuery, setKoottamSearchQuery] = useState('');
  
  // Single add state
  const [newKoottamInput, setNewKoottamInput] = useState('');
  
  // Bulk add modal state
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkTextInput, setBulkTextInput] = useState('');
  
  // New caste modal state
  const [showNewCasteModal, setShowNewCasteModal] = useState(false);
  const [newCasteNameEn, setNewCasteNameEn] = useState('');
  const [newCasteNameTa, setNewCasteNameTa] = useState('');
  
  // Confirm Reset modal state
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    if (showToast) {
      showToast(text, type);
    } else {
      alert(text);
    }
  };

  // 1. Fetch current config from API
  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      // Check localStorage cached version first for instant display
      const cached = localStorage.getItem('namma_caste_koottam_config');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            setConfig({ ...DEFAULT_CASTE_KOOTTAM_MAP, ...parsed });
          }
        } catch {}
      }

      const res = await fetch('/api/admin/caste-koottam');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        localStorage.setItem('namma_caste_koottam_config', JSON.stringify(data.config));
      }
    } catch (err: any) {
      console.warn('Failed to load caste-koottam config from API, using default', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save changes to backend API
  const saveChangesToApi = async (updatedConfig: CasteKoottamConfig, successMessage?: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/caste-koottam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newConfig: updatedConfig }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(updatedConfig);
        localStorage.setItem('namma_caste_koottam_config', JSON.stringify(updatedConfig));
        setHasUnsavedChanges(false);
        notify(
          successMessage ||
            (language === 'TA'
              ? 'கூட்டங்கள் பட்டியல் வெற்றிகரமாகச் சேமிக்கப்பட்டது!'
              : 'Koottam list saved successfully!'),
          'success'
        );
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      notify(
        language === 'TA'
          ? 'சேமிப்பதில் பிழை ஏற்பட்டது: ' + err.message
          : 'Failed to save changes: ' + err.message,
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Active list of castes (standard + any custom added in config)
  const allCastes = useMemo(() => {
    const casteSet = new Map<string, { labelEn: string; labelTa: string }>();

    // 1. Standard castes
    CASTE_OPTIONS.forEach((c) => {
      casteSet.set(c.value, { labelEn: c.labelEn, labelTa: c.labelTa });
    });

    // 2. Custom castes present in config
    Object.keys(config).forEach((cName) => {
      if (!casteSet.has(cName)) {
        casteSet.set(cName, { labelEn: cName, labelTa: cName });
      }
    });

    return Array.from(casteSet.entries()).map(([value, labels]) => ({
      value,
      labelEn: labels.labelEn,
      labelTa: labels.labelTa,
      count: (config[value] || []).length,
    }));
  }, [config]);

  // Filtered castes by search
  const filteredCastes = useMemo(() => {
    if (!casteSearchQuery.trim()) return allCastes;
    const q = casteSearchQuery.toLowerCase().trim();
    return allCastes.filter(
      (c) =>
        c.value.toLowerCase().includes(q) ||
        c.labelEn.toLowerCase().includes(q) ||
        c.labelTa.toLowerCase().includes(q)
    );
  }, [allCastes, casteSearchQuery]);

  // Current selected caste's koottams
  const currentKoottams = useMemo(() => {
    return config[selectedCaste] || DEFAULT_CASTE_KOOTTAM_MAP[selectedCaste] || [];
  }, [config, selectedCaste]);

  // Filtered koottams by search query
  const filteredKoottams = useMemo(() => {
    if (!koottamSearchQuery.trim()) return currentKoottams;
    const q = koottamSearchQuery.toLowerCase().trim();
    return currentKoottams.filter((k) => k.toLowerCase().includes(q));
  }, [currentKoottams, koottamSearchQuery]);

  // Field metadata for the current caste
  const fieldMeta = useMemo(() => {
    return getKoottamFieldLabel(selectedCaste, language);
  }, [selectedCaste, language]);

  // Handler: Add a single Koottam
  const handleAddSingleKoottam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const item = newKoottamInput.trim();
    if (!item) return;

    if (currentKoottams.includes(item)) {
      notify(
        language === 'TA'
          ? 'இந்தக் கூட்டம் ஏற்கனவே பட்டியலில் உள்ளது!'
          : 'This koottam is already in the list!',
        'error'
      );
      return;
    }

    const updatedList = [...currentKoottams, item];
    const updatedConfig = { ...config, [selectedCaste]: updatedList };

    setConfig(updatedConfig);
    setNewKoottamInput('');
    setHasUnsavedChanges(true);

    // Auto-save to server
    await saveChangesToApi(
      updatedConfig,
      language === 'TA'
        ? `"${item}" கூட்டம் வெற்றிகரமாகச் சேர்க்கப்பட்டது!`
        : `"${item}" added successfully!`
    );
  };

  // Handler: Delete a Koottam
  const handleDeleteKoottam = async (koottamToDelete: string) => {
    const updatedList = currentKoottams.filter((k) => k !== koottamToDelete);
    const updatedConfig = { ...config, [selectedCaste]: updatedList };

    setConfig(updatedConfig);
    setHasUnsavedChanges(true);

    // Auto-save to server
    await saveChangesToApi(
      updatedConfig,
      language === 'TA'
        ? `"${koottamToDelete}" நீக்கப்பட்டது.`
        : `"${koottamToDelete}" removed.`
    );
  };

  // Handler: Bulk Add Koottams
  const handleBulkAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkTextInput.trim()) return;

    // Split by newlines, commas, semicolons
    const rawItems = bulkTextInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawItems.length === 0) return;

    const existingSet = new Set(currentKoottams);
    const toAdd = rawItems.filter((item) => !existingSet.has(item));

    if (toAdd.length === 0) {
      notify(
        language === 'TA'
          ? 'உள்ளிட்ட அனைத்து கூட்டங்களும் ஏற்கனவே பட்டியலில் உள்ளன!'
          : 'All entered koottams are already in the list!',
        'error'
      );
      return;
    }

    const updatedList = [...currentKoottams, ...toAdd];
    const updatedConfig = { ...config, [selectedCaste]: updatedList };

    setConfig(updatedConfig);
    setBulkTextInput('');
    setShowBulkAddModal(false);
    setHasUnsavedChanges(true);

    await saveChangesToApi(
      updatedConfig,
      language === 'TA'
        ? `${toAdd.length} கூட்டங்கள் வெற்றிகரமாகச் சேர்க்கப்பட்டன!`
        : `${toAdd.length} koottams added successfully!`
    );
  };

  // Handler: Reset current caste to standard defaults
  const handleConfirmReset = async () => {
    const defaultList = DEFAULT_CASTE_KOOTTAM_MAP[selectedCaste] || [];
    const updatedConfig = { ...config, [selectedCaste]: [...defaultList] };

    setConfig(updatedConfig);
    setShowResetConfirmModal(false);
    setHasUnsavedChanges(true);

    await saveChangesToApi(
      updatedConfig,
      language === 'TA'
        ? `"${selectedCaste}" கூட்டம் இயல்புநிலைக்கு மீட்டமைக்கப்பட்டது.`
        : `"${selectedCaste}" reset to default koottam list.`
    );
  };

  // Handler: Add a brand new caste
  const handleCreateNewCaste = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCasteNameEn.trim();
    if (!name) return;

    if (config[name]) {
      notify(
        language === 'TA' ? 'இந்த சாதி ஏற்கனவே உள்ளது!' : 'This caste already exists!',
        'error'
      );
      return;
    }

    const updatedConfig = {
      ...config,
      [name]: ['General / Default Kulam (பொது குலம்)'],
    };

    setConfig(updatedConfig);
    setSelectedCaste(name);
    setNewCasteNameEn('');
    setNewCasteNameTa('');
    setShowNewCasteModal(false);
    setHasUnsavedChanges(true);

    saveChangesToApi(
      updatedConfig,
      language === 'TA'
        ? `"${name}" சாதி வெற்றிகரமாக உருவாக்கப்பட்டது!`
        : `"${name}" caste created successfully!`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP BANNER */}
      <div className="bg-gradient-to-br from-primary via-[#580016] to-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-[#D4AF37]/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/25 text-[#F3E5AB] text-xs font-bold border border-[#D4AF37]/40">
              <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'TA' ? 'நிர்வாக வரையறை' : 'Admin Controlled Data'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
              {language === 'TA' ? 'சாதி & கூட்டம் மேலாண்மை' : 'Main Caste & Koottam Manager'}
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-2xl leading-relaxed">
              {language === 'TA'
                ? 'ஒவ்வொரு முதன்மை சாதிக்கும் உரிய கூட்டங்கள், குலங்கள் மற்றும் கோத்ரங்களை இங்கு நிர்வாகி வரையறுக்கலாம். இங்கு சேர்க்கப்படும் அல்லது நீக்கப்படும் விவரங்கள் வரன் பதிவு படிவத்தில் (Registration Wizard) உடனடியாக மாறும்.'
                : 'Define and customize the official Koottam, Kulam, and Gotram lists for each main caste. Updates made here are instantly reflected in candidate registration and search filters.'}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => saveChangesToApi(config)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-gray-950 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? (language === 'TA' ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (language === 'TA' ? 'சேமிக்க (Save)' : 'Save All')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN WORKSPACE: LEFT (CASTES) & RIGHT (KOOTTAMS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* LEFT COLUMN: MAIN CASTES SELECTOR */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm p-4 sm:p-5 flex flex-col space-y-3.5">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 font-serif">
                {language === 'TA' ? 'முதன்மை சாதிகள்' : 'Main Castes'}
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                {filteredCastes.length} {language === 'TA' ? 'சாதிகள்' : 'castes'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowNewCasteModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              title="Add New Caste"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'TA' ? 'புதிய சாதி' : '+ New Caste'}</span>
            </button>
          </div>

          {/* Search Castes input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={casteSearchQuery}
              onChange={(e) => setCasteSearchQuery(e.target.value)}
              placeholder={language === 'TA' ? 'சாதியைத் தேடுக...' : 'Search caste...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FFFDF9] focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Castes List */}
          <div className="flex-1 overflow-y-auto max-h-[550px] space-y-1.5 pr-1">
            {filteredCastes.map((c) => {
              const isSelected = selectedCaste === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setSelectedCaste(c.value);
                    setKoottamSearchQuery('');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-[#FFFDF9] hover:bg-gray-50 text-gray-700 border-gray-200/80'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate">{language === 'TA' ? c.labelTa : c.labelEn}</div>
                    <div className={`text-[10px] font-normal truncate ${isSelected ? 'text-rose-200' : 'text-gray-400'}`}>
                      {c.value}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: KOOTTAMS MANAGER FOR SELECTED CASTE */}
        <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm p-4 sm:p-6 flex flex-col space-y-4">
          
          {/* Header of Selected Caste */}
          <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border border-[#D4AF37]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  {fieldMeta.title}
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">
                  {currentKoottams.length} {language === 'TA' ? 'கூட்டங்கள் உள்ளன' : 'Koottams Defined'}
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-serif font-black text-gray-900 mt-1">
                {selectedCaste}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBulkAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20"
                title="Bulk Add multiple koottams"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>{language === 'TA' ? 'மொத்தமாகச் சேர்' : 'Bulk Add'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition-all cursor-pointer"
                title="Reset to system defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'TA' ? 'மீட்டமை' : 'Reset'}</span>
              </button>
            </div>
          </div>

          {/* Quick Add Single Koottam Form */}
          <form onSubmit={handleAddSingleKoottam} className="flex gap-2">
            <input
              type="text"
              value={newKoottamInput}
              onChange={(e) => setNewKoottamInput(e.target.value)}
              placeholder={
                language === 'TA'
                  ? `புதிய கூட்டத்தின் பெயரை உள்ளிடவும் (எ.கா. Sempoothan / செம்பூதன்)...`
                  : `Enter new koottam/gotram name to add...`
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary bg-[#FFFDF9]"
            />
            <button
              type="submit"
              disabled={!newKoottamInput.trim() || isSaving}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'TA' ? 'சேர்' : 'Add'}</span>
            </button>
          </form>

          {/* Search inside current Koottams */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={koottamSearchQuery}
                onChange={(e) => setKoottamSearchQuery(e.target.value)}
                placeholder={language === 'TA' ? 'கூட்டங்களைத் தேடுக...' : 'Search within koottams...'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#FFFDF9] focus:outline-none focus:border-primary"
              />
            </div>

            <span className="text-[11px] text-gray-500 font-medium shrink-0">
              {filteredKoottams.length} / {currentKoottams.length}
            </span>
          </div>

          {/* KOOTTAMS CARDS / TAGS GRID */}
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredKoottams.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl p-6">
                <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700 font-serif">
                  {language === 'TA' ? 'கூட்டங்கள் எதுவும் இல்லை' : 'No Koottams Found'}
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  {language === 'TA'
                    ? 'மேலே உள்ள படிவத்தைப் பயன்படுத்தி இந்தப் பிரிவில் புதிய கூட்டங்களைச் சேர்க்கலாம் அல்லது மொத்தமாகச் சேர்க்கலாம்.'
                    : 'Use the input above to add koottams for this caste or click "Bulk Add".'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                {filteredKoottams.map((k, idx) => (
                  <div
                    key={k}
                    className="group bg-[#FFFDF9] hover:bg-white border border-gray-200 hover:border-primary/40 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-gray-400 font-bold shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-xs font-bold text-gray-800 truncate" title={k}>
                        {k}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteKoottam(k)}
                      className="text-gray-300 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title={language === 'TA' ? `நீக்கு: ${k}` : `Delete: ${k}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Save Reminder */}
          {hasUnsavedChanges && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-800 animate-in fade-in">
              <span className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{language === 'TA' ? 'சேமிக்கப்படாத மாற்றங்கள் உள்ளன' : 'You have unsaved changes.'}</span>
              </span>
              <button
                type="button"
                onClick={() => saveChangesToApi(config)}
                disabled={isSaving}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer"
              >
                {isSaving ? '...' : (language === 'TA' ? 'சேமிக்க' : 'Save')}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: BULK ADD KOOTTAMS */}
      {showBulkAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-primary/20 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-serif">
                  {language === 'TA' ? 'மொத்தமாக கூட்டங்களைச் சேர்த்தல்' : 'Bulk Add Koottams'}
                </h3>
                <span className="text-xs text-primary font-bold">{selectedCaste}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'TA'
                ? 'கூட்டங்களின் பெயர்களைப் புதிய வரியிலோ (New Line) அல்லது கமாவால் (Comma) பிரித்தோ ஒட்டவும். ஏற்கனவே உள்ள கூட்டங்கள் தானாகத் தவிர்க்கப்படும்.'
                : 'Paste koottam names separated by commas or each on a new line. Existing duplicates will be automatically ignored.'}
            </p>

            <form onSubmit={handleBulkAddSubmit} className="space-y-4">
              <textarea
                rows={7}
                value={bulkTextInput}
                onChange={(e) => setBulkTextInput(e.target.value)}
                placeholder={
                  language === 'TA'
                    ? 'செம்பூதன்\nபொருளாந்தை\nகண்ணன்\nமணியன்...'
                    : 'Sempoothan\nPorulaanthai\nKannan\nManiyan...'
                }
                className="w-full p-3.5 text-xs sm:text-sm font-mono rounded-xl border border-gray-300 focus:outline-none focus:border-primary bg-[#FFFDF9]"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  {language === 'TA' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!bulkTextInput.trim()}
                  className="px-5 py-2 rounded-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white text-xs font-bold shadow-md"
                >
                  {language === 'TA' ? 'மொத்தமாகச் சேர்' : 'Import All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW CUSTOM CASTE */}
      {showNewCasteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-primary/20 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 font-serif">
                {language === 'TA' ? 'புதிய சாதிப் பிரிவு சேர்த்தல்' : 'Add New Main Caste'}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCasteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewCaste} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'TA' ? 'சாதி பெயர் (ஆங்கிலத்தில் / பொதுப்பெயர்)' : 'Caste Name (Standard / English)'}
                </label>
                <input
                  type="text"
                  required
                  value={newCasteNameEn}
                  onChange={(e) => setNewCasteNameEn(e.target.value)}
                  placeholder="e.g. Kongu Vellala Gounder / Vanniyar"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'TA' ? 'சாதி பெயர் (தமிழில் - விருப்பத்தேர்வு)' : 'Caste Name (Tamil - Optional)'}
                </label>
                <input
                  type="text"
                  value={newCasteNameTa}
                  onChange={(e) => setNewCasteNameTa(e.target.value)}
                  placeholder="எ.கா. கொங்கு வேளாளர்"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCasteModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  {language === 'TA' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newCasteNameEn.trim()}
                  className="px-5 py-2 rounded-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white text-xs font-bold shadow-md"
                >
                  {language === 'TA' ? 'சாதியை உருவாக்கு' : 'Create Caste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM RESET TO DEFAULTS */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-primary/20 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-900 font-serif">
                {language === 'TA' ? 'இயல்புநிலைக்கு மீட்டமைக்கவா?' : 'Reset to System Defaults?'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'TA'
                  ? `"${selectedCaste}" சாதிக்கான கூட்டங்கள் ஆரம்ப இயல்புநிலைக்கு மாற்றப்படும். தொடரலாமா?`
                  : `Are you sure you want to reset koottams for "${selectedCaste}" back to the system defaults?`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                {language === 'TA' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
              >
                {language === 'TA' ? 'ஆம், மீட்டமை' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

