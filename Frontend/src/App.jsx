import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateCourse from "./pages/CreateCourse";
import CourseList from "./pages/CourseList";
import CourseView from "./pages/CourseView";
import LessonView from "./pages/LessonView";

import AssignmentsList from "./pages/AssignmentsList";
import AssignmentSubmit from "./pages/AssignmentSubmit";

import QuizList from "./pages/QuizList";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";

import TeacherQuizList from "./pages/TeacherQuizList";
import TeacherAssignments from "./pages/TeacherAssignments";
import AssignmentSubmissions from "./pages/AssignmentSubmissions";
import AdminUsers from "./pages/AdminUsers";

import MyCertificates from "./pages/MyCertificates";
import VerifyCertificate from "./pages/VerifyCertificate";
import MyPayments from "./pages/MyPayments";

import ProtectedRoute from "./pages/ProtectedRoute";
import Landing from "./pages/Landing";
import MainLayout from "./components/common/MainLayout";

import CourseBuilder from "./pages/CourseBuilder";

function App() {
  return (

    <Routes>

      {/* PUBLIC */}

      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* PROTECTED */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseView />} />
          <Route path="/lessons/:lessonId" element={<LessonView />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/courses/:courseId/assignments" element={<AssignmentsList />} />
          <Route path="/assignments/:assignmentId/submit" element={<AssignmentSubmit />} />
          <Route path="/courses/:courseId/quizzes" element={<QuizList />} />
          <Route path="/quiz/:quizId/attempt/:attemptId" element={<QuizAttempt />} />
          <Route path="/quiz/result/:attemptId" element={<QuizResult />} />
          <Route path="/my-certificates" element={<MyCertificates />} />
          <Route path="/my-payments" element={<MyPayments />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["teacher", "admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/teacher/course/:courseId/builder" element={<CourseBuilder />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizList />} />
          <Route path="/teacher/courses/:courseId/assignments" element={<TeacherAssignments />} />
          <Route path="/assignments/:assignmentId/submissions" element={<AssignmentSubmissions />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* PUBLIC CERTIFICATE */}

      <Route path="/verify/:id" element={<VerifyCertificate />} />

    </Routes>

  );
}

export default App;
