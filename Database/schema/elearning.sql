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

CREATE TABLE courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacherId INT UNSIGNED,
  published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacherId) REFERENCES users(id)
);

CREATE TABLE enrollments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED,
  courseId INT UNSIGNED,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active','cancelled','completed') DEFAULT 'active',
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);

-- additional tables: modules, lessons, assessments, questions, results, payments, invoices, certificates...
