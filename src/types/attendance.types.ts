// ============================================
// Attendance Types
// ============================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  groupId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AttendanceFormData {
  studentId: string;
  subjectId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

// Attendance status labels
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Присутствует',
  absent: 'Отсутствует',
  late: 'Опоздание',
  excused: 'Уважительная причина',
};

// Attendance status colors (CSS variable names)
export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
};
