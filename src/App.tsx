import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Workbench } from './pages/Workbench';
import { Documents } from './pages/Documents';
import { Whiteboard } from './pages/Whiteboard';
import { Tasks } from './pages/Tasks';
import { SchedulePage } from './pages/Schedule';
import { Messages } from './pages/Messages';
import { Management } from './pages/Management';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Workbench />} />
          <Route path="documents" element={<Documents />} />
          <Route path="documents/:spaceId/:documentId" element={<Documents />} />
          <Route path="whiteboard" element={<Whiteboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="messages" element={<Messages />} />
          <Route path="management" element={<Management />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
