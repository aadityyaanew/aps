-- Compare Degree APS - MySQL Schema
-- Run: mysql -u root -p < database/schema.sql

-- CREATE DATABASE IF NOT EXISTS u725346955_aps;
-- USE u725346955_aps;

-- ============================================================
-- USERS (admin / center / subcenter)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('admin', 'center', 'subcenter') NOT NULL,
  phone           VARCHAR(20),
  organization_name VARCHAR(255),
  address         TEXT,
  parent_center_id INT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_center_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- UNIVERSITIES / COLLEGES
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  location    VARCHAR(255),
  website     VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  university_id   INT NOT NULL,
  name            VARCHAR(255) NOT NULL,
  duration        VARCHAR(50),
  fees            DECIMAL(10,2),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
);

-- ============================================================
-- LEADS (student applications)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  student_name    VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(20) NOT NULL,
  university_id   INT,
  course_id       INT,
  center_id       INT NOT NULL,
  subcenter_id    INT NULL,
  lead_type       VARCHAR(50) NOT NULL DEFAULT 'Under Review',
  status          VARCHAR(50) NOT NULL DEFAULT 'New Lead',
  adm_status      VARCHAR(50) NOT NULL DEFAULT 'Pending',
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id)  REFERENCES universities(id) ON DELETE SET NULL,
  FOREIGN KEY (course_id)      REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (center_id)      REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subcenter_id)   REFERENCES users(id) ON DELETE SET NULL
);
