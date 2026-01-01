import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { 
  getStudentShortName,
  GRADE_TYPE_LABELS,
  GradeType
} from '@/types';
import { Card, Select, Input, Button, Badge, Modal, Table } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Student, Grade } from '@/types';
import styles from './GradesPage.module.scss';

export const GradesPage = observer(() => {
  const { 
    filteredStudents,
    activeGroups,
    activeSubjects,
    loadStudents,
    loadGroups,
    loadSubjects,
    loadGrades,
    selectedGroupId,
    selectedSubjectId,
    setSelectedGroup,
    setSelectedSubject,
    getGradesForStudent,
    createGrade,
    getSubjectById,
    studentsLoading
  } = dataStore;

  const { canEditGrades } = authStore;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [gradeValue, setGradeValue] = useState(5);
  const [gradeType, setGradeType] = useState<GradeType>('current');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadStudents();
    loadGroups();
    loadSubjects();
    loadGrades();
  }, [loadStudents, loadGroups, loadSubjects, loadGrades]);

  const groupOptions = [
    { value: '', label: 'Все группы' },
    ...activeGroups.map(g => ({ value: g.id, label: g.name }))
  ];

  const subjectOptions = [
    { value: '', label: 'Все предметы' },
    ...activeSubjects.map(s => ({ value: s.id, label: s.name }))
  ];

  const typeOptions = Object.entries(GRADE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const getStudentGrades = (studentId: string) => {
    let studentGrades = getGradesForStudent(studentId);
    if (selectedSubjectId) {
      studentGrades = studentGrades.filter(g => g.subjectId === selectedSubjectId);
    }
    return studentGrades;
  };

  const calculateAverage = (studentGrades: Grade[]) => {
    if (studentGrades.length === 0) return '—';
    const avg = studentGrades.reduce((sum, g) => sum + g.value, 0) / studentGrades.length;
    return avg.toFixed(1);
  };

  const handleAddGrade = (student: Student) => {
    if (!canEditGrades()) {
      uiStore.showWarning('Войдите как преподаватель для добавления оценок');
      return;
    }
    if (!selectedSubjectId) {
      uiStore.showWarning('Выберите предмет');
      return;
    }
    
    setEditingStudent(student);
    setGradeValue(5);
    setGradeType('current');
    setDescription('');
    setModalOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!editingStudent || !selectedSubjectId) return;

    await createGrade({
      studentId: editingStudent.id,
      subjectId: selectedSubjectId,
      value: gradeValue,
      type: gradeType,
      date: new Date().toISOString().split('T')[0],
      description: description || undefined,
    });
    
    uiStore.showSuccess('Оценка добавлена');
    setModalOpen(false);
    setEditingStudent(null);
  };

  const getGradeBadgeVariant = (value: number) => {
    if (value >= 4.5) return 'success';
    if (value >= 3) return 'warning';
    return 'error';
  };

  const columns: TableColumn<Student>[] = [
    {
      key: 'index',
      title: '№',
      width: '50px',
      render: (_: unknown, __: Student, index: number) => index + 1,
    },
    {
      key: 'fullName',
      title: 'ФИО',
      render: (_: unknown, row: Student) => getStudentShortName(row),
    },
    {
      key: 'grades',
      title: 'Оценки',
      render: (_: unknown, row: Student) => {
        const studentGrades = getStudentGrades(row.id);
        if (studentGrades.length === 0) return <span className={styles.noGrades}>—</span>;
        
        return (
          <div className={styles.gradesList}>
            {studentGrades.slice(0, 5).map(g => (
              <Badge 
                key={g.id} 
                variant={getGradeBadgeVariant(g.value)}
                size="sm"
              >
                {g.value}
              </Badge>
            ))}
            {studentGrades.length > 5 && (
              <span className={styles.moreGrades}>+{studentGrades.length - 5}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'average',
      title: 'Средний',
      width: '100px',
      align: 'center',
      render: (_: unknown, row: Student) => {
        const avg = calculateAverage(getStudentGrades(row.id));
        if (avg === '—') return avg;
        return (
          <Badge variant={getGradeBadgeVariant(parseFloat(avg))}>
            {avg}
          </Badge>
        );
      },
    },
    ...(canEditGrades() && selectedSubjectId ? [{
      key: 'actions',
      title: '',
      width: '100px',
      render: (_: unknown, row: Student) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleAddGrade(row)}
        >
          Добавить
        </Button>
      ),
    }] : []),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Успеваемость</h1>
        <p className={styles.subtitle}>
          Оценки и статистика успеваемости студентов
        </p>
      </div>

      <Card className={styles.filters}>
        <div className={styles.filterRow}>
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

      <Card padding="none">
        <Table
          columns={columns}
          data={filteredStudents}
          keyField="id"
          loading={studentsLoading}
          emptyText="Студенты не найдены"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Добавить оценку: ${editingStudent ? getStudentShortName(editingStudent) : ''}`}
        size="sm"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSaveGrade}>
              Сохранить
            </Button>
          </div>
        }
      >
        <div className={styles.modalContent}>
          <p className={styles.modalSubject}>
            Предмет: {selectedSubjectId ? getSubjectById(selectedSubjectId)?.name : ''}
          </p>
          <div className={styles.gradeInput}>
            <Input
              type="number"
              label="Оценка"
              min={1}
              max={5}
              value={gradeValue}
              onChange={(e) => setGradeValue(parseInt(e.target.value) || 1)}
            />
          </div>
          <Select
            label="Тип оценки"
            options={typeOptions}
            value={gradeType}
            onChange={(e) => setGradeType(e.target.value as GradeType)}
          />
          <Input
            label="Описание"
            placeholder="Необязательно"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
});
