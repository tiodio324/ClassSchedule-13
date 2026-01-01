// ============================================
// Student Types
// ============================================

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  groupId: string;
  email?: string;
  phone?: string;
  enrollmentDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  groupId: string;
  email?: string;
  phone?: string;
  enrollmentDate?: string;
}

// Helper to get full name
export const getStudentFullName = (student: Student): string => {
  const parts = [student.lastName, student.firstName];
  if (student.middleName) {
    parts.push(student.middleName);
  }
  return parts.join(' ');
};

// Helper to get short name (Фамилия И.О.)
export const getStudentShortName = (student: Student): string => {
  let name = `${student.lastName} ${student.firstName.charAt(0)}.`;
  if (student.middleName) {
    name += `${student.middleName.charAt(0)}.`;
  }
  return name;
};
