import React, { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/shared/AppLayout';
import ModulesPage from './components/modules/ModulesPage';
import ReviewQueuePage from './components/review/ReviewQueuePage';
import './styles/main.scss';

function App() {
  const [currentRole, setCurrentRole] = useState('user');
  const defaultRoute = useMemo(
    () => (currentRole === 'admin' ? '/admin/review-queue' : '/modules'),
    [currentRole]
  );

  return (
    <BrowserRouter>
      <AppLayout currentRole={currentRole} onRoleChange={setCurrentRole}>
        <Routes>
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />
          <Route
            path="/modules"
            element={currentRole === 'admin' ? <Navigate to="/admin/review-queue" replace /> : <ModulesPage />}
          />
          <Route
            path="/review-queue"
            element={currentRole === 'admin' ? <Navigate to="/admin/review-queue" replace /> : <ReviewQueuePage role="user" />}
          />
          <Route
            path="/admin/review-queue"
            element={currentRole === 'admin' ? <ReviewQueuePage role="admin" /> : <Navigate to="/review-queue" replace />}
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
