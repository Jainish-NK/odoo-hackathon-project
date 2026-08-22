import React from 'react';
import { Users, MapPin, Compass, BarChart3 } from 'lucide-react';
import { AdminTabType } from '../../types/admin';

interface AdminTabsProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
  counts?: {
    users: number;
    cities: number;
    activities: number;
  };
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs = [
    {
      id: 'users' as AdminTabType,
      label: 'Manage Users',
      icon: Users,
      count: counts?.users,
    },
    {
      id: 'cities' as AdminTabType,
      label: 'Popular Cities',
      icon: MapPin,
      count: counts?.cities,
    },
    {
      id: 'activities' as AdminTabType,
      label: 'Popular Activities',
      icon: Compass,
      count: counts?.activities,
    },
    {
      id: 'analytics' as AdminTabType,
      label: 'User Trends & Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-[#FFF9EE] p-2 rounded-3xl border border-[#DAD4C7]/80 shadow-2xs overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 min-w-max sm:min-w-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-selected={isActive}
              role="tab"
              className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#252525] text-white shadow-xs'
                  : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#F4C95D]' : 'text-[#8C867B]'
                }`}
              />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-[#F4C95D]'
                      : 'bg-[#FCFAF5] border border-[#DAD4C7] text-[#6F6A60]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
