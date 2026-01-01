// ============================================
// User & Authentication Types
// ============================================

export type UserRole = 'user' | 'teacher' | 'admin';

export interface User {
  id?: string;
  role: UserRole;
  name?: string;
  email?: string;
}

export interface AuthCredentials {
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User;
  loginModalOpen: boolean;
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  user: {
    canViewStudents: true,
    canViewAttendance: true,
    canViewGrades: true,
    canEditAttendance: false,
    canEditGrades: false,
    canManageStudents: false,
    canManageGroups: false,
    canManageSubjects: false,
    canAccessAdmin: false,
  },
  teacher: {
    canViewStudents: true,
    canViewAttendance: true,
    canViewGrades: true,
    canEditAttendance: true,
    canEditGrades: true,
    canManageStudents: false,
    canManageGroups: false,
    canManageSubjects: false,
    canAccessAdmin: false,
  },
  admin: {
    canViewStudents: true,
    canViewAttendance: true,
    canViewGrades: true,
    canEditAttendance: true,
    canEditGrades: true,
    canManageStudents: true,
    canManageGroups: true,
    canManageSubjects: true,
    canAccessAdmin: true,
  },
} as const;

export type RolePermissions = typeof ROLE_PERMISSIONS[UserRole];
