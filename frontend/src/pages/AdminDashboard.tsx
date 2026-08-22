import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Footer } from '../components/ui/Footer';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminTabs } from '../components/admin/AdminTabs';
import { AdminToolbar } from '../components/admin/AdminToolbar';
import { UserManagement } from '../components/admin/UserManagement';
import { PopularCities } from '../components/admin/PopularCities';
import { PopularActivities } from '../components/admin/PopularActivities';
import { UserAnalytics } from '../components/admin/UserAnalytics';
import { AdminInsights } from '../components/admin/AdminInsights';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import {
  AdminTabType,
  AdminFilterState,
  AdminUser,
  AdminCityAnalytics,
  AdminActivityAnalytics,
} from '../types/admin';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTabType>('users');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<AdminFilterState>({
    searchQuery: '',
    groupBy: 'none',
    filterValue: 'all',
    sortBy: 'newest',
    dateRange: '30d',
  });

  // Data States
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cities, setCities] = useState<AdminCityAnalytics[]>([]);
  const [activities, setActivities] = useState<AdminActivityAnalytics[]>([]);
  const [stats, setStats] = useState(adminService.getStatsSummary());

  const loadData = useCallback(() => {
    setStats(adminService.getStatsSummary());
    setUsers(adminService.getUsers(filters));
    setCities(adminService.getPopularCities(filters));
    setActivities(adminService.getPopularActivities(filters));
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset filters when changing tabs
  const handleTabChange = (tab: AdminTabType) => {
    setActiveTab(tab);
    setFilters({
      searchQuery: '',
      groupBy: 'none',
      filterValue: 'all',
      sortBy: tab === 'users' ? 'newest' : 'popular-desc',
      dateRange,
    });
  };

  const handleFilterUpdate = (updates: Partial<AdminFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      groupBy: 'none',
      filterValue: 'all',
      sortBy: activeTab === 'users' ? 'newest' : 'popular-desc',
      dateRange,
    });
    showToast('info', 'Filters Reset', 'Default view restored.');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      showToast('success', 'Synchronized', 'Admin metrics and traveler logs refreshed.');
    }, 400);
  };

  // User Actions
  const handleUpdateUser = (
    userId: string,
    updates: Partial<Pick<AdminUser, 'fullName' | 'email' | 'country' | 'city' | 'status' | 'role'>>
  ) => {
    const updated = adminService.updateUser(userId, updates);
    if (updated) {
      loadData();
      showToast('success', 'User Updated', `${updated.fullName} account details saved successfully.`);
    }
  };

  const handleToggleUserStatus = (user: AdminUser) => {
    const updated = adminService.toggleUserStatus(user.id);
    if (updated) {
      loadData();
      showToast(
        updated.status === 'Active' ? 'success' : 'warning',
        `Account ${updated.status}`,
        `${updated.fullName} is now ${updated.status.toLowerCase()}.`
      );
    }
  };

  // Monthly trends & insights
  const monthlyTrends = useMemo(() => adminService.getMonthlyTrends(), []);
  const categoryDistributions = useMemo(() => adminService.getCategoryDistributions(), []);
  const currentInsights = useMemo(() => adminService.getInsights(activeTab), [activeTab]);

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navbar */}
      <LandingNavbar />

      {/* 2. Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6">
        {/* Page Header */}
        <AdminHeader
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range);
            setFilters((prev) => ({ ...prev, dateRange: range }));
          }}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Dashboard Summary KPI Cards */}
        <AdminStats stats={stats} />

        {/* Top Controls: Search, Group By, Filter, Sort By */}
        <AdminToolbar
          activeTab={activeTab}
          filters={filters}
          onFilterChange={handleFilterUpdate}
          onReset={handleResetFilters}
        />

        {/* Admin Navigation Tabs */}
        <AdminTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={{
            users: users.length,
            cities: cities.length,
            activities: activities.length,
          }}
        />

        {/* Two-Column Responsive Layout (Main Content on Left, Insights on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Main Content & Visualizations (8 cols on large screens) */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'users' && (
              <UserManagement
                users={users}
                onUpdateUser={handleUpdateUser}
                onToggleStatus={handleToggleUserStatus}
              />
            )}

            {activeTab === 'cities' && <PopularCities cities={cities} />}

            {activeTab === 'activities' && <PopularActivities activities={activities} />}

            {activeTab === 'analytics' && (
              <UserAnalytics
                monthlyTrends={monthlyTrends}
                categoryDistributions={categoryDistributions}
              />
            )}
          </div>

          {/* RIGHT: Contextual Admin Insights & Section Overview (4 cols on large screens) */}
          <div className="lg:col-span-4 sticky top-24">
            <AdminInsights activeTab={activeTab} insights={currentInsights} />
          </div>
        </div>
      </main>

      {/* 3. Universal Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
