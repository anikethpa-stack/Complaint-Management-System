-- MySQL Database Schema: Student Grievance and Complaint Management System
-- For Higher Educational Institutions

CREATE DATABASE IF NOT EXISTS student_grievance;
USE student_grievance;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS Departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed departments based on college complaint categories
INSERT INTO Departments (id, name) VALUES 
(1, 'Academic'),
(2, 'Infrastructure'),
(3, 'Hostel'),
(4, 'Library'),
(5, 'Placement')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Department Representative', 'Admin') NOT NULL,
    department_id INT NULL,
    phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Departments(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- Seed default Admin and Department Representative accounts
-- Password for admin is 'admin123' (Bcrypt hash: $2b$10$EpJGC0VlnMi7rjJHOb46d.XpDqN.K369xpywS5U/x9b1T9t8nveKG)
-- Passwords for reps are 'rep123' (Bcrypt hash: $2b$10$vN014x29F2m7GSw/J7Zp.O7n8E5t6y2sX/uBq15tE5z0O18e.8iO2)
INSERT INTO Users (id, name, email, password_hash, role, department_id, phone) VALUES
(1, 'System Administrator', 'admin@college.edu', '$2b$10$EpJGC0VlnMi7rjJHOb46d.XpDqN.K369xpywS5U/x9b1T9t8nveKG', 'Admin', NULL, '9999999999'),
(2, 'Academic Representative', 'academic.rep@college.edu', '$2b$10$vN014x29F2m7GSw/J7Zp.O7n8E5t6y2sX/uBq15tE5z0O18e.8iO2', 'Department Representative', 1, '8888888888'),
(3, 'Infrastructure Representative', 'infra.rep@college.edu', '$2b$10$vN014x29F2m7GSw/J7Zp.O7n8E5t6y2sX/uBq15tE5z0O18e.8iO2', 'Department Representative', 2, '7777777777'),
(4, 'Hostel Representative', 'hostel.rep@college.edu', '$2b$10$vN014x29F2m7GSw/J7Zp.O7n8E5t6y2sX/uBq15tE5z0O18e.8iO2', 'Department Representative', 3, '6666666666'),
(5, 'Library Representative', 'library.rep@college.edu', '$2b$10$vN014x29F2m7GSw/J7Zp.O7n8E5t6y2sX/uBq15tE5z0O18e.8iO2', 'Department Representative', 4, '5555555555'),
(6, 'Placement Representative', 'placement.rep@college.edu', '$2b$10$vN014x29F2m7GSw/J7Zp.O7n8E5t6y2sX/uBq15tE5z0O18e.8iO2', 'Department Representative', 5, '4444444444')
ON DUPLICATE KEY UPDATE 
    name=VALUES(name), 
    email=VALUES(email), 
    password_hash=VALUES(password_hash), 
    role=VALUES(role), 
    department_id=VALUES(department_id), 
    phone=VALUES(phone);

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS Complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    status ENUM('Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Pending',
    student_id INT NOT NULL,
    department_id INT NULL,
    evidence_url VARCHAR(2048) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES Departments(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_student (student_id),
    INDEX idx_department (department_id)
) ENGINE=InnoDB;

-- 4. ComplaintUpdates Table
CREATE TABLE IF NOT EXISTS ComplaintUpdates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    user_id INT NOT NULL,
    status_from ENUM('Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL,
    status_to ENUM('Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL,
    remarks TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_complaint (complaint_id)
) ENGINE=InnoDB;

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;
