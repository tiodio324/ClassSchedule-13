import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { 
  getStudentShortName, 
  ATTENDANCE_STATUS_LABELS, 
  ATTENDANCE_STATUS_COLORS,
  AttendanceStatus
} from '@/types';
import { Card, Select, Input, Button, Badge, Modal } from '@/components/UI';
import type { Student } from '@/types';
import styles from './AttendancePage.module.scss';

export const AttendancePage = observer(() => {
  const { 
    filteredStudents,
    activeGroups,
    activeSubjects,
    loadStudents,
    loadGroups,
    loadSubjects,
    loadAttendance,
    selectedGroupId,
    selectedSubjectId,
    selectedDate,
    setSelectedGroup,
    setSelectedSubject,
    setSelectedDate,
    getAttendanceForStudent,
    createAttendanceRecord,
    updateAttendanceRecord,
    studentsLoading
  } = dataStore;

  const { canEditAttendance } = authStore;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadStudents();
    loadGroups();
    loadSubjects();
    loadAttendance();
  }, [loadStudents, loadGroups, loadSubjects, loadAttendance]);

  const groupOptions = [
    { value: '', label: 'Все группы' },
    ...activeGroups.map(g => ({ value: g.id, label: g.name }))
  ];

  const subjectOptions = [
    { value: '', label: 'Выберите предмет' },
    ...activeSubjects.map(s => ({ value: s.id, label: s.name }))
  ];

  const statusOptions = Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const getStudentAttendance = (studentId: string) => {
    if (!selectedSubjectId) return null;
    const records = getAttendanceForStudent(studentId, selectedDate);
    return records.find(r => r.subjectId === selectedSubjectId);
  };

  const handleMarkAttendance = (student: Student) => {
    if (!canEditAttendance()) {
      uiStore.showWarning('Войдите как преподаватель для отметки посещаемости');
      return;
    }
    if (!selectedSubjectId) {
      uiStore.showWarning('Выберите предмет');
      return;
    }
    
    setEditingStudent(student);
    const existing = getStudentAttendance(student.id);
    setNewStatus(existing?.status || 'present');
    setNote(existing?.note || '');
    setModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!editingStudent || !selectedSubjectId) return;

    const existing = getStudentAttendance(editingStudent.id);
    
    if (existing) {
      await updateAttendanceRecord(existing.id, { status: newStatus, note: note || undefined });
    } else {
      await createAttendanceRecord({
        studentId: editingStudent.id,
        subjectId: selectedSubjectId,
        date: selectedDate,
        status: newStatus,
        note: note || undefined,
      });
    }
    
    uiStore.showSuccess('Посещаемость сохранена');
    setModalOpen(false);
    setEditingStudent(null);
  };

  const getStatusBadgeVariant = (status: AttendanceStatus) => {
    const colorMap: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return colorMap[ATTENDANCE_STATUS_COLORS[status]] || 'default';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Посещаемость</h1>
        <p className={styles.subtitle}>
          Отметка и просмотр посещаемости студентов
        </p>
      </div>

      <Card className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterItem}>
            <Input
              type="date"
              label="Дата"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className={styles.filterItem}>
            <Select
              label="Группа"
              options={groupOptions}
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
            />
          </div>
          <div className={styles.filterItem}>
            <Select
              label="Предмет"
              options={subjectOptions}
              value={selectedSubjectId || ''}
              onChange={(e) => setSelectedSubject(e.target.value || null)}
            />
          </div>
        </div>
      </Card>

      {!selectedSubjectId && (
        <Card className={styles.notice}>
          <p>Выберите предмет для отметки посещаемости</p>
        </Card>
      )}

      {selectedSubjectId && (
        <Card padding="none">
          <div className={styles.attendanceList}>
            {studentsLoading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : filteredStudents.length === 0 ? (
              <div className={styles.empty}>Студенты не найдены</div>
            ) : (
              filteredStudents.map((student, index) => {
                const attendance = getStudentAttendance(student.id);
                return (
                  <div key={student.id} className={styles.attendanceRow}>
                    <span className={styles.index}>{index + 1}</span>
                    <span className={styles.name}>{getStudentShortName(student)}</span>
                    <div className={styles.status}>
                      {attendance ? (
                        <Badge variant={getStatusBadgeVariant(attendance.status)}>
                          {ATTENDANCE_STATUS_LABELS[attendance.status]}
                        </Badge>
                      ) : (
                        <Badge variant="default">Не отмечен</Badge>
                      )}
                    </div>
                    {canEditAttendance() && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAttendance(student)}
                      >
                        {attendance ? 'Изменить' : 'Отметить'}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Отметка посещаемости: ${editingStudent ? getStudentShortName(editingStudent) : ''}`}
        size="sm"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSaveAttendance}>
              Сохранить
            </Button>
          </div>
        }
      >
        <div className={styles.modalContent}>
          <Select
            label="Статус"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
          />
          <Input
            label="Примечание"
            placeholder="Необязательно"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
});
