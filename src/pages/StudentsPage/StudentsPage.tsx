import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore } from '@/store';
import { getStudentShortName } from '@/types';
import { Card, Table, Select, Input, Badge } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Student } from '@/types';
import styles from './StudentsPage.module.scss';

export const StudentsPage = observer(() => {
  const { 
    filteredStudents, 
    activeGroups, 
    loadStudents, 
    loadGroups,
    studentsLoading,
    selectedGroupId,
    setSelectedGroup,
    filters,
    setFilter,
    getGroupById
  } = dataStore;

  const [searchValue, setSearchValue] = useState(filters.search || '');

  useEffect(() => {
    loadStudents();
    loadGroups();
  }, [loadStudents, loadGroups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter('search', searchValue || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setFilter]);

  const groupOptions = [
    { value: '', label: 'Все группы' },
    ...activeGroups.map(g => ({ value: g.id, label: g.name }))
  ];

  const columns: TableColumn<Student>[] = [
    {
      key: 'index',
      title: '№',
      width: '60px',
      render: (_: unknown, __: Student, index: number) => index + 1,
    },
    {
      key: 'fullName',
      title: 'ФИО',
      render: (_: unknown, row: Student) => getStudentShortName(row),
    },
    {
      key: 'groupId',
      title: 'Группа',
      width: '150px',
      render: (value: unknown) => {
        const group = getGroupById(value as string);
        return group ? group.name : '—';
      },
    },
    {
      key: 'email',
      title: 'Email',
      render: (value: unknown) => (value as string) || '—',
    },
    {
      key: 'phone',
      title: 'Телефон',
      width: '150px',
      render: (value: unknown) => (value as string) || '—',
    },
    {
      key: 'isActive',
      title: 'Статус',
      width: '120px',
      align: 'center',
      render: (value: unknown) => (
        <Badge variant={value ? 'success' : 'error'}>
          {value ? 'Активен' : 'Неактивен'}
        </Badge>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Список студентов</h1>
        <p className={styles.subtitle}>
          Всего студентов: {filteredStudents.length}
        </p>
      </div>

      <Card className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterItem}>
            <Input
              placeholder="Поиск по ФИО..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              leftIcon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              }
            />
          </div>
          <div className={styles.filterItem}>
            <Select
              options={groupOptions}
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
              placeholder="Выберите группу"
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
    </div>
  );
});
