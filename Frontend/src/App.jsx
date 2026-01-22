import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';

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
    </Routes>
  );
}

export default App;
