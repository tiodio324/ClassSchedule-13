import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input, Select } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Student, Group, Subject, StudentFormData, GroupFormData, SubjectFormData } from '@/types';
import styles from './AdminPage.module.scss';

type AdminTab = 'students' | 'groups' | 'subjects';

export const AdminPage = observer(() => {
  const { 
    students, 
    groups, 
    subjects,
    activeGroups,
    loadAllData,
    createStudent,
    updateStudent,
    deleteStudent,
    createGroup,
    updateGroup,
    deleteGroup,
    createSubject,
    updateSubject,
    deleteSubject,
    getGroupById,
    studentsLoading,
    groupsLoading,
    subjectsLoading
  } = dataStore;

  const [activeTab, setActiveTab] = useState<AdminTab>('students');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    groupId: '',
    email: '',
    phone: '',
  });
  const [groupForm, setGroupForm] = useState<GroupFormData>({
    name: '',
    course: 1,
    specialty: '',
    year: new Date().getFullYear(),
  });
  const [subjectForm, setSubjectForm] = useState<SubjectFormData>({
    name: '',
    shortName: '',
    teacherName: '',
    hoursTotal: 0,
  });

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const resetForms = () => {
    setStudentForm({ firstName: '', lastName: '', middleName: '', groupId: '', email: '', phone: '' });
    setGroupForm({ name: '', course: 1, specialty: '', year: new Date().getFullYear() });
    setSubjectForm({ name: '', shortName: '', teacherName: '', hoursTotal: 0 });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForms();
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (item: Student | Group | Subject) => {
    setModalMode('edit');
    setEditingId(item.id);
    
    if (activeTab === 'students') {
      const s = item as Student;
      setStudentForm({
        firstName: s.firstName,
        lastName: s.lastName,
        middleName: s.middleName || '',
        groupId: s.groupId,
        email: s.email || '',
        phone: s.phone || '',
      });
    } else if (activeTab === 'groups') {
      const g = item as Group;
      setGroupForm({
        name: g.name,
        course: g.course,
        specialty: g.specialty,
        year: g.year,
      });
    } else {
      const subj = item as Subject;
      setSubjectForm({
        name: subj.name,
        shortName: subj.shortName,
        teacherName: subj.teacherName || '',
        hoursTotal: subj.hoursTotal,
      });
    }
    
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'students') {
        if (!studentForm.firstName || !studentForm.lastName || !studentForm.groupId) {
          uiStore.showError('Заполните обязательные поля');
          return;
        }
        if (modalMode === 'create') {
          await createStudent(studentForm);
        } else if (editingId) {
          await updateStudent(editingId, studentForm);
        }
      } else if (activeTab === 'groups') {
        if (!groupForm.name || !groupForm.specialty) {
          uiStore.showError('Заполните обязательные поля');
          return;
        }
        if (modalMode === 'create') {
          await createGroup(groupForm);
        } else if (editingId) {
          await updateGroup(editingId, groupForm);
        }
      } else {
        if (!subjectForm.name || !subjectForm.shortName) {
          uiStore.showError('Заполните обязательные поля');
          return;
        }
        if (modalMode === 'create') {
          await createSubject(subjectForm);
        } else if (editingId) {
          await updateSubject(editingId, subjectForm);
        }
      }
      
      uiStore.showSuccess(modalMode === 'create' ? 'Запись добавлена' : 'Запись обновлена');
      setModalOpen(false);
      resetForms();
    } catch {
      uiStore.showError('Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    uiStore.showConfirm(
      'Удаление записи',
      'Вы уверены, что хотите удалить эту запись?',
      async () => {
        if (activeTab === 'students') {
          await deleteStudent(id);
        } else if (activeTab === 'groups') {
          await deleteGroup(id);
        } else {
          await deleteSubject(id);
        }
        uiStore.showSuccess('Запись удалена');
      }
    );
  };

  const groupOptions = activeGroups.map(g => ({ value: g.id, label: g.name }));

  const studentColumns: TableColumn<Student>[] = [
    { key: 'lastName', title: 'Фамилия' },
    { key: 'firstName', title: 'Имя' },
    { key: 'middleName', title: 'Отчество', render: (v: unknown) => (v as string) || '—' },
    { 
      key: 'groupId', 
      title: 'Группа', 
      render: (v: unknown) => getGroupById(v as string)?.name || '—' 
    },
    {
      key: 'actions',
      title: '',
      width: '100px',
      render: (_: unknown, row: Student) => (
        <div className={styles.actions}>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => openEditModal(row)}
            aria-label="Редактировать"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleDelete(row.id)}
            aria-label="Удалить"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  const groupColumns: TableColumn<Group>[] = [
    { key: 'name', title: 'Название' },
    { key: 'course', title: 'Курс', width: '80px' },
    { key: 'specialty', title: 'Специальность' },
    { key: 'year', title: 'Год', width: '80px' },
    {
      key: 'actions',
      title: '',
      width: '100px',
      render: (_: unknown, row: Group) => (
        <div className={styles.actions}>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => openEditModal(row)}
            aria-label="Редактировать"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleDelete(row.id)}
            aria-label="Удалить"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  const subjectColumns: TableColumn<Subject>[] = [
    { key: 'name', title: 'Название' },
    { key: 'shortName', title: 'Сокращение', width: '120px' },
    { key: 'teacherName', title: 'Преподаватель', render: (v: unknown) => (v as string) || '—' },
    { key: 'hoursTotal', title: 'Часы', width: '80px' },
    {
      key: 'actions',
      title: '',
      width: '100px',
      render: (_: unknown, row: Subject) => (
        <div className={styles.actions}>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => openEditModal(row)}
            aria-label="Редактировать"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleDelete(row.id)}
            aria-label="Удалить"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  const getModalTitle = () => {
    const action = modalMode === 'create' ? 'Добавить' : 'Редактировать';
    const entity = activeTab === 'students' ? 'студента' : activeTab === 'groups' ? 'группу' : 'предмет';
    return `${action} ${entity}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Администрирование</h1>
        <p className={styles.subtitle}>Управление данными системы</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'students' ? styles.active : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Студенты
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'groups' ? styles.active : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Группы
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'subjects' ? styles.active : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          Предметы
        </button>
      </div>

      <Card className={styles.toolbar}>
        <Button variant="primary" onClick={openCreateModal}>
          Добавить {activeTab === 'students' ? 'студента' : activeTab === 'groups' ? 'группу' : 'предмет'}
        </Button>
      </Card>

      <Card padding="none">
        {activeTab === 'students' && (
          <Table
            columns={studentColumns}
            data={students.filter(s => s.isActive)}
            keyField="id"
            loading={studentsLoading}
            emptyText="Нет студентов"
          />
        )}
        {activeTab === 'groups' && (
          <Table
            columns={groupColumns}
            data={groups.filter(g => g.isActive)}
            keyField="id"
            loading={groupsLoading}
            emptyText="Нет групп"
          />
        )}
        {activeTab === 'subjects' && (
          <Table
            columns={subjectColumns}
            data={subjects.filter(s => s.isActive)}
            keyField="id"
            loading={subjectsLoading}
            emptyText="Нет предметов"
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={getModalTitle()}
        footer={
          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button variant="primary" onClick={handleSave}>Сохранить</Button>
          </div>
        }
      >
        <div className={styles.form}>
          {activeTab === 'students' && (
            <>
              <Input
                label="Фамилия *"
                value={studentForm.lastName}
                onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
              />
              <Input
                label="Имя *"
                value={studentForm.firstName}
                onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
              />
              <Input
                label="Отчество"
                value={studentForm.middleName}
                onChange={(e) => setStudentForm({ ...studentForm, middleName: e.target.value })}
              />
              <Select
                label="Группа *"
                options={groupOptions}
                value={studentForm.groupId}
                onChange={(e) => setStudentForm({ ...studentForm, groupId: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              />
              <Input
                label="Телефон"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
              />
            </>
          )}
          {activeTab === 'groups' && (
            <>
              <Input
                label="Название *"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              />
              <Input
                label="Курс *"
                type="number"
                min={1}
                max={6}
                value={groupForm.course}
                onChange={(e) => setGroupForm({ ...groupForm, course: parseInt(e.target.value) || 1 })}
              />
              <Input
                label="Специальность *"
                value={groupForm.specialty}
                onChange={(e) => setGroupForm({ ...groupForm, specialty: e.target.value })}
              />
              <Input
                label="Год поступления *"
                type="number"
                value={groupForm.year}
                onChange={(e) => setGroupForm({ ...groupForm, year: parseInt(e.target.value) || 2024 })}
              />
            </>
          )}
          {activeTab === 'subjects' && (
            <>
              <Input
                label="Название *"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              />
              <Input
                label="Сокращение *"
                value={subjectForm.shortName}
                onChange={(e) => setSubjectForm({ ...subjectForm, shortName: e.target.value })}
              />
              <Input
                label="Преподаватель"
                value={subjectForm.teacherName}
                onChange={(e) => setSubjectForm({ ...subjectForm, teacherName: e.target.value })}
              />
              <Input
                label="Часов всего"
                type="number"
                value={subjectForm.hoursTotal}
                onChange={(e) => setSubjectForm({ ...subjectForm, hoursTotal: parseInt(e.target.value) || 0 })}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
});
