import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import CourseList from './pages/CourseList';
import CourseView from './pages/CourseView';

import { setToken } from './services/api';

function App() {

  // 🔐 Re-apply token on page refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }, []);

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
    </Routes>
  );
}

export default App;
