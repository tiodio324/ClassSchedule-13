import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, navigationStore } from '@/store';
import { Card, Button, Badge } from '@/components/UI';
import styles from './HomePage.module.scss';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
}) => (
  <Card className={`${styles.statCard} ${styles[color]}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statTitle}>{title}</span>
    </div>
  </Card>
);

export const HomePage = observer(() => {
  const { students, groups, subjects, attendanceRecords, grades, loadAllData, studentsLoading } = dataStore;
  const { isTeacher, isAdmin } = authStore;
  const { navigate } = navigationStore;

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const activeStudents = students.filter(s => s.isActive);
  const activeGroups = groups.filter(g => g.isActive);
  const activeSubjects = subjects.filter(s => s.isActive);
  
  // Calculate today's attendance rate
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = todayAttendance.length > 0 
    ? Math.round((presentCount / todayAttendance.length) * 100) 
    : 0;

  // Calculate average grade
  const avgGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.value, 0) / grades.length).toFixed(1)
    : '—';

  return (
    <div className={styles.page}>
      <section className={styles.welcome}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Добро пожаловать в журнал колледжа
          </h1>
          <p className={styles.welcomeText}>
            Система учета посещаемости и успеваемости студентов. 
            {!isTeacher && ' Войдите в систему для редактирования данных.'}
          </p>
          {!authStore.isAuthenticated && (
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => authStore.openLoginModal()}
            >
              Войти в систему
            </Button>
          )}
        </div>
        <div className={styles.welcomeDecor}>
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" opacity="0.4" />
            <path d="M100 30 L100 170 M30 100 L170 100" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          </svg>
        </div>
      </section>

      <section className={styles.stats}>
        <StatCard 
          title="Студентов"
          value={studentsLoading ? '...' : activeStudents.length}
          color="primary"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
        <StatCard 
          title="Групп"
          value={activeGroups.length}
          color="info"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          }
        />
        <StatCard 
          title="Предметов"
          value={activeSubjects.length}
          color="warning"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          }
        />
        <StatCard 
          title="Средний балл"
          value={avgGrade}
          color="success"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          }
        />
      </section>

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Быстрые действия</h2>
        <div className={styles.actionCards}>
          <Card 
            className={styles.actionCard} 
            hoverable 
            onClick={() => navigate('students')}
          >
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h3>Список студентов</h3>
            <p>Просмотр и поиск студентов по группам</p>
          </Card>

          <Card 
            className={styles.actionCard} 
            hoverable 
            onClick={() => navigate('attendance')}
          >
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M9 16l2 2 4-4" />
              </svg>
            </div>
            <h3>Посещаемость</h3>
            <p>Отметка и просмотр посещаемости</p>
            {attendanceRate > 0 && (
              <Badge variant={attendanceRate >= 80 ? 'success' : attendanceRate >= 60 ? 'warning' : 'error'}>
                {attendanceRate}% сегодня
              </Badge>
            )}
          </Card>

          <Card 
            className={styles.actionCard} 
            hoverable 
            onClick={() => navigate('grades')}
          >
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
            </div>
            <h3>Успеваемость</h3>
            <p>Оценки и академическая статистика</p>
          </Card>

          {isAdmin && (
            <Card 
              className={styles.actionCard} 
              hoverable 
              onClick={() => navigate('admin')}
            >
              <div className={styles.actionIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <h3>Администрирование</h3>
              <p>Управление данными системы</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
});
