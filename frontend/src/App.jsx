import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/shared/AppLayout';
import ModulesPage from './components/modules/ModulesPage';
import ReviewQueuePage from './components/review/ReviewQueuePage';
import './styles/main.scss';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/modules" replace />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/review-queue" element={<ReviewQueuePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
