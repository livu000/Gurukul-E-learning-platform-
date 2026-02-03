import { Routes, Route, Navigate } from 'react-router-dom';

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

      <Route path="/courses/:courseId/assignments" element={<AssignmentsList />} />
      <Route path="/assignments/:assignmentId/submit" element={<AssignmentSubmit />} />

      <Route path="/courses/:courseId/quizzes" element={<QuizList />} />
      <Route path="/quiz/:quizId/attempt/:attemptId" element={<QuizAttempt />} />
      <Route path="/quiz/result/:attemptId" element={<QuizResult />} />
      // QUIZ (Teacher)
      <Route path="/teacher/quizzes" element={<TeacherQuizList />} />

// ASSIGNMENTS (Teacher)
      <Route path="/teacher/courses/:courseId/assignments" element={<TeacherAssignments />} />
      <Route path="/assignments/:assignmentId/submissions" element={<AssignmentSubmissions />} />
      <Route path="/assignments/submissions/:submissionId/grade" element={<GradeSubmission />} />
      <Route path="/teacher/assignments/:assignmentId/submissions" element={<AssignmentSubmissions />}/>

    </Routes>
  );
}

export default App;
