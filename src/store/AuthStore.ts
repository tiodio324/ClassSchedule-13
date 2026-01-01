import { makeAutoObservable } from 'mobx';
import { User, UserRole, ROLE_PERMISSIONS, RolePermissions } from '@/types';

// Storage keys for authentication persistence
const AUTH_STORAGE_KEY = 'college_schedule_auth';
const SESSION_EXPIRY_KEY = 'college_schedule_session_expiry';

// Session duration in milliseconds (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

const AUTH_CREDENTIALS: Record<Exclude<UserRole, 'user'>, string> = {
  teacher: 'teacher2026',
  admin: 'admin2026',
};

interface StoredAuthState {
  role: UserRole;
  expiry: number;
}

export class AuthStore {
  private _user: User = {
    role: 'user'
  };

  loginModalOpen = false;
  loginError: string | null = null;
  isLoading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.loadAuthState();
  }

  // Getters
  get user(): User {
    return this._user;
  }

  get isAuthenticated(): boolean {
    return this._user.role !== 'user';
  }

  get isTeacher(): boolean {
    return this._user.role === 'teacher' || this._user.role === 'admin';
  }

  get isAdmin(): boolean {
    return this._user.role === 'admin';
  }

  get permissions(): RolePermissions {
    return ROLE_PERMISSIONS[this._user.role];
  }

  get currentRole(): UserRole {
    return this._user.role;
  }

  // Permission checkers
  canViewStudents = (): boolean => this.permissions.canViewStudents;
  canViewAttendance = (): boolean => this.permissions.canViewAttendance;
  canViewGrades = (): boolean => this.permissions.canViewGrades;
  canEditAttendance = (): boolean => this.permissions.canEditAttendance;
  canEditGrades = (): boolean => this.permissions.canEditGrades;
  canManageStudents = (): boolean => this.permissions.canManageStudents;
  canManageGroups = (): boolean => this.permissions.canManageGroups;
  canManageSubjects = (): boolean => this.permissions.canManageSubjects;
  canAccessAdmin = (): boolean => this.permissions.canAccessAdmin;

  // Check if user has required role
  hasRole = (requiredRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      user: 0,
      teacher: 1,
      admin: 2,
    };
    return roleHierarchy[this._user.role] >= roleHierarchy[requiredRole];
  };

  // Load auth state from storage
  private loadAuthState = (): void => {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      const expiryData = localStorage.getItem(SESSION_EXPIRY_KEY);

      if (storedData && expiryData) {
        const authState: StoredAuthState = JSON.parse(storedData);
        const expiry = parseInt(expiryData, 10);

        // Check if session is still valid
        if (Date.now() < expiry && authState.role !== 'user') {
          this._user = { role: authState.role };
        } else {
          // Session expired, clear storage
          this.clearAuthStorage();
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      this.clearAuthStorage();
    }
  };

  // Save auth state to storage
  private saveAuthState = (): void => {
    try {
      if (this._user.role !== 'user') {
        const authState: StoredAuthState = {
          role: this._user.role,
          expiry: Date.now() + SESSION_DURATION,
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
        localStorage.setItem(SESSION_EXPIRY_KEY, String(authState.expiry));
      } else {
        this.clearAuthStorage();
      }
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  // Clear auth storage
  private clearAuthStorage = (): void => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear auth storage:', error);
    }
  };

  // Modal controls
  openLoginModal = (): void => {
    this.loginModalOpen = true;
    this.loginError = null;
  };

  closeLoginModal = (): void => {
    this.loginModalOpen = false;
    this.loginError = null;
    this.isLoading = false;
  };

  // Login with password
  login = async (role: Exclude<UserRole, 'user'>, password: string): Promise<boolean> => {
    this.isLoading = true;
    this.loginError = null;

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate credentials
      if (AUTH_CREDENTIALS[role] === password) {
        this._user = { role };
        this.saveAuthState();
        this.closeLoginModal();
        return true;
      } else {
        this.loginError = 'Неверный пароль';
        return false;
      }
    } catch (error) {
      this.loginError = 'Ошибка авторизации';
      console.error('Login error:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  };

  // Logout
  logout = (): void => {
    this._user = { role: 'user' };
    this.clearAuthStorage();
    this.loginError = null;
  };

  // Clear login error
  clearError = (): void => {
    this.loginError = null;
  };
}

// Singleton instance
export const authStore = new AuthStore();
