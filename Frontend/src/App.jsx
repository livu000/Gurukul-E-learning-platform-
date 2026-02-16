import { Routes, Route, useNavigate } from 'react-router-dom';
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
import Landing from "./pages/Landing";
import MainLayout from "./components/common/MainLayout";

function App() {

  const navigate = useNavigate();

  // 🔐 STARTUP AUTH CHECK
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken || refreshToken) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* ================= AUTHENTICATED ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CourseList />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CourseView />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lessons/:lessonId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <LessonView />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= STUDENT ROUTES ================= */}

      <Route
        path="/courses/:courseId/assignments"
        element={
          <ProtectedRoute roles={['student']}>
            <MainLayout>
              <AssignmentsList />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/:assignmentId/submit"
        element={
          <ProtectedRoute roles={['student']}>
            <MainLayout>
              <AssignmentSubmit />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:courseId/quizzes"
        element={
          <ProtectedRoute roles={['student']}>
            <MainLayout>
              <QuizList />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quiz/:quizId/attempt/:attemptId"
        element={
          <ProtectedRoute roles={['student']}>
            <MainLayout>
              <QuizAttempt />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quiz/result/:attemptId"
        element={
          <ProtectedRoute roles={['student']}>
            <MainLayout>
              <QuizResult />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= TEACHER / ADMIN ROUTES ================= */}

      <Route
        path="/create-course"
        element={
          <ProtectedRoute roles={['teacher', 'admin']}>
            <MainLayout>
              <CreateCourse />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/quizzes"
        element={
          <ProtectedRoute roles={['teacher']}>
            <MainLayout>
              <TeacherQuizList />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/courses/:courseId/assignments"
        element={
          <ProtectedRoute roles={['teacher']}>
            <MainLayout>
              <TeacherAssignments />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/:assignmentId/submissions"
        element={
          <ProtectedRoute roles={['teacher']}>
            <MainLayout>
              <AssignmentSubmissions />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/submissions/:submissionId/grade"
        element={
          <ProtectedRoute roles={['teacher']}>
            <MainLayout>
              <GradeSubmission />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/assignments/:assignmentId/submissions"
        element={
          <ProtectedRoute roles={['teacher']}>
            <MainLayout>
              <AssignmentSubmissions />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= CERTIFICATES ================= */}

      <Route
        path="/my-certificates"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyCertificates />
            </MainLayout>
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
            <MainLayout>
              <MyPayments />
            </MainLayout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
