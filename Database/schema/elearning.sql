CREATE DATABASE IF NOT EXISTS elearningdb;
USE elearningdb;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','teacher','student') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id INT NOT NULL,
  status ENUM('draft','published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE modules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_modules_course
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE CASCADE
);

CREATE TABLE lessons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url VARCHAR(500),
  sort_order INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lessons_module
    FOREIGN KEY (module_id)
    REFERENCES modules(id)
    ON DELETE CASCADE
);

CREATE TABLE lesson_progress (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  user_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,

  status ENUM('started','completed') DEFAULT 'started',
  completed_at DATETIME NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_lp_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_lp_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_lp_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE CASCADE,

  UNIQUE KEY uniq_user_lesson (user_id, lesson_id),
  INDEX idx_lp_course (course_id),
  INDEX idx_lp_user (user_id)
) ENGINE=InnoDB;


CREATE TABLE quizzes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit INT DEFAULT NULL, -- minutes
  total_marks INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_by INT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_quiz_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_quiz_teacher
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE quiz_questions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT UNSIGNED NOT NULL,
  question_text TEXT NOT NULL,
  marks INT DEFAULT 1,
  sort_order INT DEFAULT 1,

  CONSTRAINT fk_question_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quiz_options (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id INT UNSIGNED NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,

  CONSTRAINT fk_option_question
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quiz_attempts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  score INT DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME DEFAULT NULL,

  CONSTRAINT fk_attempt_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_attempt_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE,

  UNIQUE KEY uniq_student_quiz (quiz_id, student_id)
) ENGINE=InnoDB;

CREATE TABLE quiz_answers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  selected_option_id INT UNSIGNED NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,

  CONSTRAINT fk_answer_attempt
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_answer_question
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_answer_option
    FOREIGN KEY (selected_option_id) REFERENCES quiz_options(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  max_marks INT NOT NULL,
  due_date DATETIME NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE assignment_submissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  answer_text TEXT,
  file_url VARCHAR(500),
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_assignment_student (assignment_id, student_id),

  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE assignment_grades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NOT NULL,
  marks_awarded INT NOT NULL,
  feedback TEXT,
  graded_by INT UNSIGNED NOT NULL,
  graded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE certificates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  certificate_id VARCHAR(40) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_course (user_id, course_id),

  CONSTRAINT fk_cert_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_cert_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);