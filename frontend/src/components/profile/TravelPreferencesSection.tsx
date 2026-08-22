import React, { useState } from 'react';
import {
  Compass,
  Check,
  Coins,
  Bell,
} from 'lucide-react';
import { User } from '../../types/auth';
import { Button } from '../ui/Button';

export interface TravelPreferencesSectionProps {
  user: User;
  onSave: (updates: Partial<User>) => Promise<boolean>;
}

const AVAILABLE_STYLES = [
  { id: 'Cultural', label: 'Cultural & Heritage', emoji: '🏛️' },
  { id: 'Adventure', label: 'Adventure & Outdoors', emoji: '🧗' },
  { id: 'Nature', label: 'Nature & Wildlife', emoji: '🌲' },
  { id: 'Relaxation', label: 'Beach & Wellness', emoji: '🏖️' },
  { id: 'Culinary', label: 'Food & Wine', emoji: '🍷' },
  { id: 'Luxury', label: 'Luxury Escapes', emoji: '✨' },
  { id: 'Road Trips', label: 'Scenic Road Trips', emoji: '🚗' },
  { id: 'Photography', label: 'Photography & Art', emoji: '📸' },
];

const BUDGET_LEVELS: Array<{ id: 'Budget' | 'Moderate' | 'Luxury'; label: string; desc: string }> = [
  { id: 'Budget', label: 'Budget Conscious', desc: 'Hostels, public transit & authentic local eats.' },
  { id: 'Moderate', label: 'Balanced Explorer', desc: 'Boutique hotels, curated activities & mid-range dining.' },
  { id: 'Luxury', label: 'Premium & Luxury', desc: '5-star resorts, private transfers & fine dining.' },
];

const CURRENCIES = [
  { code: 'INR (₹)', name: 'Indian Rupee' },
  { code: 'USD ($)', name: 'US Dollar' },
  { code: 'EUR (€)', name: 'Euro' },
  { code: 'GBP (£)', name: 'British Pound' },
];

export const TravelPreferencesSection: React.FC<TravelPreferencesSectionProps> = ({
  user,
  onSave,
}) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(user.travelStyles || ['Cultural', 'Nature']);
  const [budgetPref, setBudgetPref] = useState<'Budget' | 'Moderate' | 'Luxury'>(user.budgetPreference || 'Moderate');
  const [currency, setCurrency] = useState<string>(user.preferredCurrency || 'INR (₹)');
  const [emailNotifications, setEmailNotifications] = useState<boolean>(user.emailNotifications !== false);
  const [tripReminders, setTripReminders] = useState<boolean>(user.tripReminders !== false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId) ? prev.filter((s) => s !== styleId) : [...prev, styleId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      travelStyles: selectedStyles,
      budgetPreference: budgetPref,
      preferredCurrency: currency,
      emailNotifications,
      tripReminders,
    });
    setIsSaving(false);
  };

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm space-y-7">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DAD4C7]/60">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#4E7360]" /> Travel Preferences
          </h2>
          <p className="text-xs text-[#6F6A60] mt-0.5">
            Tailor your itinerary recommendations and budget defaults.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving..."
          leftIcon={<Check className="w-3.5 h-3.5" />}
          className="shadow-2xs font-bold"
        >
          Save Preferences
        </Button>
      </div>

      {/* 1. Travel Styles Multi-select */}
      <div className="space-y-3">
        <label className="text-xs sm:text-sm font-semibold text-[#252525] block">
          Favorite Travel Styles (Pick all that apply)
        </label>
        <div className="flex flex-wrap gap-2.5">
          {AVAILABLE_STYLES.map((style) => {
            const isSelected = selectedStyles.includes(style.id);
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => toggleStyle(style.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#4E7360] text-white shadow-xs border border-[#4E7360]'
                    : 'bg-white/80 hover:bg-white text-[#252525] border border-[#DAD4C7] hover:border-[#8C867B]'
                }`}
              >
                <span>{style.emoji}</span>
                <span>{style.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Budget Level Selector */}
      <div className="space-y-3 pt-2">
        <label className="text-xs sm:text-sm font-semibold text-[#252525] block">
          Budget Preference
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUDGET_LEVELS.map((level) => {
            const isSelected = budgetPref === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => setBudgetPref(level.id)}
                className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-[#FCFAF5] border-[#E5B740] ring-2 ring-[#F4C95D]/30 shadow-xs'
                    : 'bg-white/80 hover:bg-white border-[#DAD4C7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#252525]">
                    {level.label}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#E3B443] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6F6A60] leading-relaxed">
                  {level.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Preferred Currency & Notification Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#DAD4C7]/60">
        {/* Preferred Currency */}
        <div className="space-y-2">
          <label htmlFor="currency-select" className="text-xs sm:text-sm font-semibold text-[#252525] flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#C29326]" /> Preferred Currency
          </label>
          <div className="relative">
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-11 px-3.5 text-xs font-medium bg-white/90 border border-[#DAD4C7] hover:border-[#8C867B] focus:border-[#E3B443] rounded-xl text-[#252525] transition-all outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-[#8C867B]">
            Used for itinerary budget estimates and calculations.
          </p>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <span className="text-xs sm:text-sm font-semibold text-[#252525] flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#4E7360]" /> Communication Preferences
          </span>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-[#252525] cursor-pointer">
              <input
                type="checkbox"
                checked={tripReminders}
                onChange={(e) => setTripReminders(e.target.checked)}
                className="w-4 h-4 rounded text-[#4E7360] focus:ring-[#4E7360] accent-[#4E7360] cursor-pointer"
              />
              <span>Send trip reminders and upcoming itinerary updates</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#252525] cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-[#4E7360] focus:ring-[#4E7360] accent-[#4E7360] cursor-pointer"
              />
              <span>Receive seasonal travel inspiration and destination guides</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
