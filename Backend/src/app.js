const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', require('./routes/module.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));

module.exports = app;
