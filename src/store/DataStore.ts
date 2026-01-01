import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { 
  Student, 
  StudentFormData,
  Group, 
  GroupFormData,
  Subject, 
  SubjectFormData,
  AttendanceRecord, 
  AttendanceFormData,
  Grade, 
  GradeFormData,
  FilterParams 
} from '@/types';
import FirebaseService from '@/firebase';
import { authStore } from './AuthStore';

export class DataStore {
  // Data collections
  students: Student[] = [];
  groups: Group[] = [];
  subjects: Subject[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  grades: Grade[] = [];

  // Loading states
  studentsLoading = false;
  groupsLoading = false;
  subjectsLoading = false;
  attendanceLoading = false;
  gradesLoading = false;

  // Error states
  error: string | null = null;

  // Filters
  filters: FilterParams = {};

  // Selected items
  selectedGroupId: string | null = null;
  selectedSubjectId: string | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ============================================
  // Computed values
  // ============================================

  get filteredStudents(): Student[] {
    let result = this.students.filter(s => s.isActive);

    if (this.filters.groupId) {
      result = result.filter(s => s.groupId === this.filters.groupId);
    }

    if (this.filters.search) {
      const searchWords = this.filters.search
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        result = result.filter(s => {
          const fullName = [
            s.firstName.toLowerCase(),
            s.lastName.toLowerCase(),
            s.middleName?.toLowerCase()
          ]
            .filter(Boolean)
            .join(' ');
          
          return searchWords.every(word => fullName.includes(word));
        });
      }
    }

    return result.sort((a, b) => a.lastName.localeCompare(b.lastName, 'ru'));
  }

  get activeGroups(): Group[] {
    return this.groups.filter(g => g.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  get activeSubjects(): Subject[] {
    return this.subjects.filter(s => s.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  get studentsByGroup(): Record<string, Student[]> {
    const grouped: Record<string, Student[]> = {};
    
    for (const student of this.filteredStudents) {
      if (!grouped[student.groupId]) {
        grouped[student.groupId] = [];
      }
      grouped[student.groupId].push(student);
    }
    
    return grouped;
  }

  getGroupById = (id: string): Group | undefined => {
    return this.groups.find(g => g.id === id);
  };

  getSubjectById = (id: string): Subject | undefined => {
    return this.subjects.find(s => s.id === id);
  };

  getStudentById = (id: string): Student | undefined => {
    return this.students.find(s => s.id === id);
  };

  getAttendanceForStudent = (studentId: string, date?: string): AttendanceRecord[] => {
    return this.attendanceRecords.filter(a => 
      a.studentId === studentId && 
      (!date || a.date === date)
    );
  };

  getGradesForStudent = (studentId: string): Grade[] => {
    return this.grades.filter(g => g.studentId === studentId);
  };

  // ============================================
  // Data loading methods
  // ============================================

  loadAllData = async (): Promise<void> => {
    await Promise.all([
      this.loadGroups(),
      this.loadSubjects(),
      this.loadStudents(),
      this.loadAttendance(),
      this.loadGrades(),
    ]);
  };

  loadStudents = async (): Promise<void> => {
    this.studentsLoading = true;
    this.error = null;
    
    try {
      const data = await FirebaseService.getData<Record<string, Student>>('students');
      runInAction(() => {
        this.students = data ? Object.values(data) : [];
        this.studentsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки студентов';
        this.studentsLoading = false;
        console.error('Load students error:', error);
      });
    }
  };

  loadGroups = async (): Promise<void> => {
    this.groupsLoading = true;
    
    try {
      const data = await FirebaseService.getData<Record<string, Group>>('groups');
      runInAction(() => {
        this.groups = data ? Object.values(data) : [];
        this.groupsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки групп';
        this.groupsLoading = false;
        console.error('Load groups error:', error);
      });
    }
  };

  loadSubjects = async (): Promise<void> => {
    this.subjectsLoading = true;
    
    try {
      const data = await FirebaseService.getData<Record<string, Subject>>('subjects');
      runInAction(() => {
        this.subjects = data ? Object.values(data) : [];
        this.subjectsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки предметов';
        this.subjectsLoading = false;
        console.error('Load subjects error:', error);
      });
    }
  };

  loadAttendance = async (): Promise<void> => {
    this.attendanceLoading = true;
    
    try {
      const data = await FirebaseService.getData<Record<string, AttendanceRecord>>('attendance');
      runInAction(() => {
        this.attendanceRecords = data ? Object.values(data) : [];
        this.attendanceLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки посещаемости';
        this.attendanceLoading = false;
        console.error('Load attendance error:', error);
      });
    }
  };

  loadGrades = async (): Promise<void> => {
    this.gradesLoading = true;
    
    try {
      const data = await FirebaseService.getData<Record<string, Grade>>('grades');
      runInAction(() => {
        this.grades = data ? Object.values(data) : [];
        this.gradesLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки оценок';
        this.gradesLoading = false;
        console.error('Load grades error:', error);
      });
    }
  };

  // ============================================
  // CRUD operations for Students
  // ============================================

  createStudent = async (data: StudentFormData): Promise<Student | null> => {
    if (!authStore.canManageStudents()) return null;

    const now = new Date().toISOString();
    const student: Student = {
      id: uuidv4(),
      ...data,
      middleName: data.middleName || undefined,
      enrollmentDate: data.enrollmentDate || now.split('T')[0],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await FirebaseService.setData(`students/${student.id}`, student);
      runInAction(() => {
        this.students.push(student);
      });
      return student;
    } catch (error) {
      console.error('Create student error:', error);
      return null;
    }
  };

  updateStudent = async (id: string, data: Partial<StudentFormData>): Promise<boolean> => {
    if (!authStore.canManageStudents()) return false;

    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;

    const updated = {
      ...this.students[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`students/${id}`, updated);
      runInAction(() => {
        this.students[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update student error:', error);
      return false;
    }
  };

  deleteStudent = async (id: string): Promise<boolean> => {
    if (!authStore.canManageStudents()) return false;

    // Soft delete
    return this.updateStudent(id, { } as Partial<StudentFormData>).then(() => {
      const index = this.students.findIndex(s => s.id === id);
      if (index !== -1) {
        this.students[index].isActive = false;
      }
      return true;
    });
  };

  // ============================================
  // CRUD operations for Groups
  // ============================================

  createGroup = async (data: GroupFormData): Promise<Group | null> => {
    if (!authStore.canManageGroups()) return null;

    const now = new Date().toISOString();
    const group: Group = {
      id: uuidv4(),
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await FirebaseService.setData(`groups/${group.id}`, group);
      runInAction(() => {
        this.groups.push(group);
      });
      return group;
    } catch (error) {
      console.error('Create group error:', error);
      return null;
    }
  };

  updateGroup = async (id: string, data: Partial<GroupFormData>): Promise<boolean> => {
    if (!authStore.canManageGroups()) return false;

    const index = this.groups.findIndex(g => g.id === id);
    if (index === -1) return false;

    const updated = {
      ...this.groups[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`groups/${id}`, updated);
      runInAction(() => {
        this.groups[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update group error:', error);
      return false;
    }
  };

  deleteGroup = async (id: string): Promise<boolean> => {
    if (!authStore.canManageGroups()) return false;

    const index = this.groups.findIndex(g => g.id === id);
    if (index === -1) return false;

    try {
      await FirebaseService.updateData(`groups/${id}`, { isActive: false });
      runInAction(() => {
        this.groups[index].isActive = false;
      });
      return true;
    } catch (error) {
      console.error('Delete group error:', error);
      return false;
    }
  };

  // ============================================
  // CRUD operations for Subjects
  // ============================================

  createSubject = async (data: SubjectFormData): Promise<Subject | null> => {
    if (!authStore.canManageSubjects()) return null;

    const now = new Date().toISOString();
    const subject: Subject = {
      id: uuidv4(),
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await FirebaseService.setData(`subjects/${subject.id}`, subject);
      runInAction(() => {
        this.subjects.push(subject);
      });
      return subject;
    } catch (error) {
      console.error('Create subject error:', error);
      return null;
    }
  };

  updateSubject = async (id: string, data: Partial<SubjectFormData>): Promise<boolean> => {
    if (!authStore.canManageSubjects()) return false;

    const index = this.subjects.findIndex(s => s.id === id);
    if (index === -1) return false;

    const updated = {
      ...this.subjects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`subjects/${id}`, updated);
      runInAction(() => {
        this.subjects[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update subject error:', error);
      return false;
    }
  };

  deleteSubject = async (id: string): Promise<boolean> => {
    if (!authStore.canManageSubjects()) return false;

    const index = this.subjects.findIndex(s => s.id === id);
    if (index === -1) return false;

    try {
      await FirebaseService.updateData(`subjects/${id}`, { isActive: false });
      runInAction(() => {
        this.subjects[index].isActive = false;
      });
      return true;
    } catch (error) {
      console.error('Delete subject error:', error);
      return false;
    }
  };

  // ============================================
  // CRUD operations for Attendance
  // ============================================

  createAttendanceRecord = async (data: AttendanceFormData): Promise<AttendanceRecord | null> => {
    if (!authStore.canEditAttendance()) return null;

    const student = this.getStudentById(data.studentId);
    if (!student) return null;

    const now = new Date().toISOString();
    const record: AttendanceRecord = {
      id: uuidv4(),
      studentId: data.studentId,
      subjectId: data.subjectId,
      date: data.date,
      status: data.status,
      groupId: student.groupId,
      note: data.note || '',
      createdAt: now,
      updatedAt: now,
      createdBy: authStore.currentRole,
    };

    try {
      await FirebaseService.setData(`attendance/${record.id}`, record);
      runInAction(() => {
        this.attendanceRecords.push(record);
      });
      return record;
    } catch (error) {
      console.error('Create attendance error:', error);
      return null;
    }
  };

  updateAttendanceRecord = async (id: string, data: Partial<AttendanceFormData>): Promise<boolean> => {
    if (!authStore.canEditAttendance()) return false;

    const index = this.attendanceRecords.findIndex(a => a.id === id);
    if (index === -1) return false;

    const updated = {
      ...this.attendanceRecords[index],
      ...data,
      note: data.note !== undefined ? (data.note || '') : this.attendanceRecords[index].note || '',
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`attendance/${id}`, updated);
      runInAction(() => {
        this.attendanceRecords[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update attendance error:', error);
      return false;
    }
  };

  // ============================================
  // CRUD operations for Grades
  // ============================================

  createGrade = async (data: GradeFormData): Promise<Grade | null> => {
    if (!authStore.canEditGrades()) return null;

    const student = this.getStudentById(data.studentId);
    if (!student) return null;

    const now = new Date().toISOString();
    const grade: Grade = {
      id: uuidv4(),
      studentId: data.studentId,
      subjectId: data.subjectId,
      value: data.value,
      maxValue: data.maxValue || 5,
      type: data.type,
      date: data.date,
      groupId: student.groupId,
      description: data.description || '',
      createdAt: now,
      updatedAt: now,
      createdBy: authStore.currentRole,
    };

    try {
      await FirebaseService.setData(`grades/${grade.id}`, grade);
      runInAction(() => {
        this.grades.push(grade);
      });
      return grade;
    } catch (error) {
      console.error('Create grade error:', error);
      return null;
    }
  };

  updateGrade = async (id: string, data: Partial<GradeFormData>): Promise<boolean> => {
    if (!authStore.canEditGrades()) return false;

    const index = this.grades.findIndex(g => g.id === id);
    if (index === -1) return false;

    const updated = {
      ...this.grades[index],
      ...data,
      description: data.description !== undefined ? (data.description || '') : this.grades[index].description || '',
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`grades/${id}`, updated);
      runInAction(() => {
        this.grades[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update grade error:', error);
      return false;
    }
  };

  // ============================================
  // Filter and selection methods
  // ============================================

  setFilter = (key: keyof FilterParams, value: string | undefined): void => {
    this.filters = { ...this.filters, [key]: value };
  };

  clearFilters = (): void => {
    this.filters = {};
  };

  setSelectedGroup = (groupId: string | null): void => {
    this.selectedGroupId = groupId;
    this.filters.groupId = groupId || undefined;
  };

  setSelectedSubject = (subjectId: string | null): void => {
    this.selectedSubjectId = subjectId;
    this.filters.subjectId = subjectId || undefined;
  };

  setSelectedDate = (date: string): void => {
    this.selectedDate = date;
  };

  clearError = (): void => {
    this.error = null;
  };
}

// Singleton instance
export const dataStore = new DataStore();
