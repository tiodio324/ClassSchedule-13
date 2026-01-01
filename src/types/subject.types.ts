// ============================================
// Subject Types
// ============================================

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  teacherName?: string;
  hoursTotal: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectFormData {
  name: string;
  shortName: string;
  teacherName?: string;
  hoursTotal: number;
}
