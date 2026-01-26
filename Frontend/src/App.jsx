import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import CourseList from './pages/CourseList';
import CourseView from './pages/CourseView';
import LessonView from './pages/LessonView';

function App() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Teacher / Admin */}
      <Route path="/create-course" element={<CreateCourse />} />

      {/* Course Listing */}
      <Route path="/courses" element={<CourseList />} />

      <Route path="/courses/:id" element={<CourseView />} />

      <Route path="/lessons/:lessonId" element={<LessonView />} />
    </Routes>
  );
}

export default App;
