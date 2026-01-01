import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { navigationStore, dataStore } from '@/store';
import { MainLayout, LoginModal, ConfirmModal, Toast } from '@/components';
import { HomePage, StudentsPage, AttendancePage, GradesPage, AdminPage } from '@/pages';

const PageRouter = observer(() => {
  const { currentPage } = navigationStore;

  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'students':
      return <StudentsPage />;
    case 'attendance':
      return <AttendancePage />;
    case 'grades':
      return <GradesPage />;
    case 'admin':
    case 'admin-students':
    case 'admin-groups':
    case 'admin-subjects':
      return <AdminPage />;
    default:
      return <HomePage />;
  }
});

const App = observer(() => {
  useEffect(() => {
    dataStore.loadAllData();
  }, []);

  return (
    <>
      <MainLayout>
        <PageRouter />
      </MainLayout>

      <LoginModal />
      <ConfirmModal />
      <Toast />
    </>
  );
});

export default App;
