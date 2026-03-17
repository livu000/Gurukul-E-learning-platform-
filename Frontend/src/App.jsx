import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
import GradeSubmission from "./pages/GradeSubmission";

import MyCertificates from "./pages/MyCertificates";
import VerifyCertificate from "./pages/VerifyCertificate";
import MyPayments from "./pages/MyPayments";

import ProtectedRoute from "./pages/ProtectedRoute";
import Landing from "./pages/Landing";
import MainLayout from "./components/common/MainLayout";

import CourseBuilder from "./pages/CourseBuilder";

function App() {

  const navigate = useNavigate();

  useEffect(() => {

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken || refreshToken) {
      navigate("/dashboard");
    }

  }, [navigate]);

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

          <Route path="/courses/:courseId/assignments" element={<AssignmentsList />} />
          <Route path="/assignments/:assignmentId/submit" element={<AssignmentSubmit />} />

          <Route path="/courses/:courseId/quizzes" element={<QuizList />} />
          <Route path="/quiz/:quizId/attempt/:attemptId" element={<QuizAttempt />} />
          <Route path="/quiz/result/:attemptId" element={<QuizResult />} />

          {/* COURSE CREATION */}

          <Route path="/create-course" element={<CreateCourse />} />

          {/* COURSE BUILDER (NEW) */}

          <Route path="/teacher/course/:courseId/builder" element={<CourseBuilder />} />

          {/* TEACHER */}

          <Route path="/teacher/quizzes" element={<TeacherQuizList />} />

          <Route path="/teacher/courses/:courseId/assignments" element={<TeacherAssignments />} />

          {/* ASSIGNMENT GRADING */}

          <Route path="/assignments/:assignmentId/submissions" element={<AssignmentSubmissions />} />

          <Route path="/assignments/submissions/:submissionId/grade" element={<GradeSubmission />} />

          {/* STUDENT */}

          <Route path="/my-certificates" element={<MyCertificates />} />

          <Route path="/my-payments" element={<MyPayments />} />

        </Route>

      </Route>

      {/* PUBLIC CERTIFICATE */}

      <Route path="/verify/:id" element={<VerifyCertificate />} />

    </Routes>

  );
}

export default App;