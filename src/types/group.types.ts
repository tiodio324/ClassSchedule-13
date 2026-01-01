// ============================================
// Group Types
// ============================================

export interface Group {
  id: string;
  name: string;
  course: number;
  specialty: string;
  year: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupFormData {
  name: string;
  course: number;
  specialty: string;
  year: number;
}

// Helper to format group display name
export const formatGroupName = (group: Group): string => {
  return `${group.name} (${group.course} курс)`;
};
