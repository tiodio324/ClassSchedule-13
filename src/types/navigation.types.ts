// ============================================
// Navigation Types
// ============================================

export type PageId = 
  | 'home'
  | 'students'
  | 'attendance'
  | 'grades'
  | 'admin'
  | 'admin-students'
  | 'admin-groups'
  | 'admin-subjects';

export interface PageConfig {
  id: PageId;
  title: string;
  icon: string;
  requiresAuth: boolean;
  requiredRole?: 'teacher' | 'admin';
  showInNav: boolean;
  parentId?: PageId;
}

export const PAGES_CONFIG: Record<PageId, PageConfig> = {
  home: {
    id: 'home',
    title: 'Главная',
    icon: 'home',
    requiresAuth: false,
    showInNav: true,
  },
  students: {
    id: 'students',
    title: 'Студенты',
    icon: 'users',
    requiresAuth: false,
    showInNav: true,
  },
  attendance: {
    id: 'attendance',
    title: 'Посещаемость',
    icon: 'calendar-check',
    requiresAuth: false,
    showInNav: true,
  },
  grades: {
    id: 'grades',
    title: 'Успеваемость',
    icon: 'chart-bar',
    requiresAuth: false,
    showInNav: true,
  },
  admin: {
    id: 'admin',
    title: 'Администрирование',
    icon: 'settings',
    requiresAuth: true,
    requiredRole: 'admin',
    showInNav: true,
  },
  'admin-students': {
    id: 'admin-students',
    title: 'Управление студентами',
    icon: 'user-plus',
    requiresAuth: true,
    requiredRole: 'admin',
    showInNav: false,
    parentId: 'admin',
  },
  'admin-groups': {
    id: 'admin-groups',
    title: 'Управление группами',
    icon: 'folder-plus',
    requiresAuth: true,
    requiredRole: 'admin',
    showInNav: false,
    parentId: 'admin',
  },
  'admin-subjects': {
    id: 'admin-subjects',
    title: 'Управление предметами',
    icon: 'book-open',
    requiresAuth: true,
    requiredRole: 'admin',
    showInNav: false,
    parentId: 'admin',
  },
};
