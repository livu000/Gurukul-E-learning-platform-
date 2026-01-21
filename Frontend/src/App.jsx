import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CourseList from './pages/CourseList';
import CourseView from './pages/CourseView';

function App() {
  return (
    <BrowserRouter>

      {/* Simple Navigation */}
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Dashboard</Link> |{' '}
        <Link to="/courses">Courses</Link> |{' '}
        <Link to="/login">Login</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseView />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
