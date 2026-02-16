import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import CourseList from './pages/CourseList';
import CourseView from './pages/CourseView';
import LessonView from './pages/LessonView';
import AssignmentsList from './pages/AssignmentsList';
import AssignmentSubmit from './pages/AssignmentSubmit';
import QuizList from './pages/QuizList';
import QuizAttempt from './pages/QuizAttempt';
import QuizResult from './pages/QuizResult';
import TeacherQuizList from './pages/TeacherQuizList';
import TeacherAssignments from './pages/TeacherAssignments';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import GradeSubmission from './pages/GradeSubmission';
import MyCertificates from './pages/MyCertificates';
import VerifyCertificate from './pages/VerifyCertificate';
import MyPayments from './pages/MyPayments';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {

  const navigate = useNavigate();

  // 🔐 STARTUP AUTH CHECK
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken && !refreshToken) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* ================= AUTHENTICATED ================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lessons/:lessonId"
        element={
          <ProtectedRoute>
            <LessonView />
          </ProtectedRoute>
        }
      />

      {/* ================= STUDENT ROUTES ================= */}
      <Route
        path="/courses/:courseId/assignments"
        element={
          <ProtectedRoute roles={['student']}>
            <AssignmentsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/:assignmentId/submit"
        element={
          <ProtectedRoute roles={['student']}>
            <AssignmentSubmit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:courseId/quizzes"
        element={
          <ProtectedRoute roles={['student']}>
            <QuizList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quiz/:quizId/attempt/:attemptId"
        element={
          <ProtectedRoute roles={['student']}>
            <QuizAttempt />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quiz/result/:attemptId"
        element={
          <ProtectedRoute roles={['student']}>
            <QuizResult />
          </ProtectedRoute>
        }
      />

      {/* ================= TEACHER / ADMIN ROUTES ================= */}
      <Route
        path="/create-course"
        element={
          <ProtectedRoute roles={['teacher', 'admin']}>
            <CreateCourse />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/quizzes"
        element={
          <ProtectedRoute roles={['teacher']}>
            <TeacherQuizList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/courses/:courseId/assignments"
        element={
          <ProtectedRoute roles={['teacher']}>
            <TeacherAssignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/:assignmentId/submissions"
        element={
          <ProtectedRoute roles={['teacher']}>
            <AssignmentSubmissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/submissions/:submissionId/grade"
        element={
          <ProtectedRoute roles={['teacher']}>
            <GradeSubmission />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/assignments/:assignmentId/submissions"
        element={
          <ProtectedRoute roles={['teacher']}>
            <AssignmentSubmissions />
          </ProtectedRoute>
        }
      />

      {/* ================= CERTIFICATES ================= */}
      <Route
        path="/my-certificates"
        element={
          <ProtectedRoute>
            <MyCertificates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/verify/:id"
        element={<VerifyCertificate />}
      />

      {/* ================= PAYMENTS ================= */}
      <Route
        path="/my-payments"
        element={
          <ProtectedRoute>
            <MyPayments />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
