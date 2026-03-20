const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('../src/models');

const requiredTables = [
  'users',
  'courses',
  'modules',
  'lessons',
  'quizzes',
  'quiz_questions',
  'quiz_options',
  'assignments',
  'assignment_submissions',
  'assignment_grades',
  'payments',
  'transactions',
  'invoices',
  'enrollments',
  'lesson_progress',
  'quiz_attempts',
  'quiz_answers',
  'certificates',
  'refresh_tokens',
  'audit_logs'
];

(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SHOW TABLES');
    const values = rows.map((row) => Object.values(row)[0]);
    const missing = requiredTables.filter((table) => !values.includes(table));

    console.log(`Connected to database: ${process.env.DB_NAME}`);
    console.log(`Tables found: ${values.length}`);

    if (missing.length) {
      console.error('Missing required tables:');
      missing.forEach((table) => console.error(`- ${table}`));
      process.exit(1);
    }

    console.log('All required LMS tables are present.');
    process.exit(0);
  } catch (error) {
    console.error('DB health check failed:', error.message);
    process.exit(1);
  }
})();
