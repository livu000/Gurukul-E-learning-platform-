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
