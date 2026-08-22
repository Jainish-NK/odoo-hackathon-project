import {
  AdminStatsSummary,
  AdminUser,
  AdminCityAnalytics,
  AdminActivityAnalytics,
  MonthlyTrendData,
  CategoryDistribution,
  AdminInsightItem,
  AdminFilterState,
  AdminTabType,
} from '../types/admin';
import {
  mockAdminStats,
  mockAdminUsers,
  mockPopularCities,
  mockPopularActivities,
  mockMonthlyTrends,
  mockCategoryDistributions,
  mockAdminInsights,
} from '../data/adminData';

const STORAGE_KEY_ADMIN_USERS = 'globetrotter_admin_users_db_v1';

const getStoredUsers = (): AdminUser[] => {
  const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(mockAdminUsers));
  return mockAdminUsers;
};

export const adminService = {
  /**
   * Fetch KPI Overview Stats
   */
  getStatsSummary(): AdminStatsSummary {
    const users = getStoredUsers();
    return {
      ...mockAdminStats,
      totalUsers: Math.max(mockAdminStats.totalUsers, users.length * 1850),
    };
  },

  /**
   * Fetch All Users with search, group, and filters
   */
  getUsers(filters: Partial<AdminFilterState> = {}): AdminUser[] {
    let list = getStoredUsers();

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q) ||
          (u.city && u.city.toLowerCase().includes(q))
      );
    }

    if (filters.filterValue && filters.filterValue !== 'all') {
      list = list.filter((u) => u.status.toLowerCase() === filters.filterValue?.toLowerCase());
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'name-asc') {
        list = [...list].sort((a, b) => a.fullName.localeCompare(b.fullName));
      } else if (filters.sortBy === 'name-desc') {
        list = [...list].sort((a, b) => b.fullName.localeCompare(a.fullName));
      } else if (filters.sortBy === 'trips-desc') {
        list = [...list].sort((a, b) => b.tripsCount - a.tripsCount);
      } else if (filters.sortBy === 'spend-desc') {
        list = [...list].sort((a, b) => b.totalSpend - a.totalSpend);
      } else if (filters.sortBy === 'newest') {
        list = [...list].sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
      }
    }

    return list;
  },

  /**
   * Update User Information
   */
  updateUser(
    userId: string,
    updates: Partial<Pick<AdminUser, 'fullName' | 'email' | 'country' | 'city' | 'status' | 'role'>>
  ): AdminUser | null {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    const parts = (updates.fullName || users[index].fullName).trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const updated: AdminUser = {
      ...users[index],
      ...updates,
      firstName,
      lastName,
      fullName: updates.fullName || users[index].fullName,
    };

    users[index] = updated;
    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(users));
    return updated;
  },

  /**
   * Toggle User Status (Active <-> Inactive)
   */
  toggleUserStatus(userId: string): AdminUser | null {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    const nextStatus = users[index].status === 'Active' ? 'Inactive' : 'Active';
    users[index] = {
      ...users[index],
      status: nextStatus,
    };

    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(users));
    return users[index];
  },

  /**
   * Delete User (Admin action)
   */
  deleteUser(userId: string): boolean {
    const users = getStoredUsers();
    const filtered = users.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(filtered));
    return true;
  },

  /**
   * Fetch Popular Cities with search and sorting
   */
  getPopularCities(filters: Partial<AdminFilterState> = {}): AdminCityAnalytics[] {
    let list = [...mockPopularCities];

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.city.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
      );
    }

    if (filters.filterValue && filters.filterValue !== 'all') {
      list = list.filter((c) => c.region.toLowerCase() === filters.filterValue?.toLowerCase());
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'trips-desc' || filters.sortBy === 'popular-desc') {
        list = [...list].sort((a, b) => b.tripsCount - a.tripsCount);
      } else if (filters.sortBy === 'users-desc') {
        list = [...list].sort((a, b) => b.usersCount - a.usersCount);
      } else if (filters.sortBy === 'budget-asc') {
        list = [...list].sort((a, b) => a.averageBudget - b.averageBudget);
      } else if (filters.sortBy === 'budget-desc') {
        list = [...list].sort((a, b) => b.averageBudget - a.averageBudget);
      } else if (filters.sortBy === 'name-asc') {
        list = [...list].sort((a, b) => a.city.localeCompare(b.city));
      }
    }

    return list;
  },

  /**
   * Fetch Popular Activities with search, category filtering, and sorting
   */
  getPopularActivities(filters: Partial<AdminFilterState> = {}): AdminActivityAnalytics[] {
    let list = [...mockPopularActivities];

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    if (filters.filterValue && filters.filterValue !== 'all') {
      list = list.filter((a) => a.category.toLowerCase() === filters.filterValue?.toLowerCase());
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'rating-desc') {
        list = [...list].sort((a, b) => b.averageRating - a.averageRating);
      } else if (filters.sortBy === 'users-desc' || filters.sortBy === 'popular-desc') {
        list = [...list].sort((a, b) => b.usersCount - a.usersCount);
      } else if (filters.sortBy === 'trips-desc') {
        list = [...list].sort((a, b) => b.tripsCount - a.tripsCount);
      } else if (filters.sortBy === 'name-asc') {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    return list;
  },

  /**
   * Fetch Monthly Trends for Analytics Visualizations
   */
  getMonthlyTrends(): MonthlyTrendData[] {
    return mockMonthlyTrends;
  },

  /**
   * Fetch Category Distribution
   */
  getCategoryDistributions(): CategoryDistribution[] {
    return mockCategoryDistributions;
  },

  /**
   * Get Contextual Admin Insights for Active Tab
   */
  getInsights(tab: AdminTabType): AdminInsightItem[] {
    return mockAdminInsights[tab] || mockAdminInsights.users;
  },
};
