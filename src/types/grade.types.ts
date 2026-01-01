// ============================================
// Grade Types
// ============================================

export type GradeType = 'current' | 'control' | 'exam' | 'coursework';

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  groupId: string;
  value: number;
  maxValue: number;
  type: GradeType;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface GradeFormData {
  studentId: string;
  subjectId: string;
  value: number;
  maxValue?: number;
  type: GradeType;
  date: string;
  description?: string;
}

// Grade type labels
export const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  current: 'Текущая',
  control: 'Контрольная',
  exam: 'Экзамен',
  coursework: 'Курсовая',
};

// Grade value display
export const formatGradeValue = (grade: Grade): string => {
  if (grade.maxValue && grade.maxValue !== 5) {
    return `${grade.value}/${grade.maxValue}`;
  }
  return String(grade.value);
};

// Calculate grade percentage
export const calculateGradePercentage = (grade: Grade): number => {
  return Math.round((grade.value / grade.maxValue) * 100);
};
