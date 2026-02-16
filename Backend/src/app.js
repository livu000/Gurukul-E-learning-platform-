const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adminDashboardRoutes = require('./routes/adminDashboard.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const paymentRoutes = require('./routes/payment.routes');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});
app .use('/api', apiLimiter); // Apply global rate limiter to all routes after this line
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', require('./routes/module.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/quiz-questions', require('./routes/quizQuestion.routes'));
app.use('/api/quiz-attempts', require('./routes/quizAttempt.routes'));
app.use('/api/quiz-submissions', require('./routes/quizSubmission.routes'));
app.use('/api/assignments', assignmentRoutes);
app.use("/api/certificates", require("./routes/certificate.routes"));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard', adminDashboardRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/audit-logs', require('./routes/audit.routes'));

module.exports = app;
