-- Compare Degree APS - Seed Data
-- Run AFTER schema.sql in phpMyAdmin or MySQL client

-- Default Admin
-- Email: admin@comparedegree.com | Password: password123
INSERT INTO users (name, email, password_hash, role, organization_name) VALUES
('Super Admin', 'admin@comparedegree.com', '$2b$10$EGpF7cFq7.Mi3TXMV3fAM.nm3O.fgHqeBpwLdOnrcvu3ABVGRHzXG', 'admin', 'Compare Degree')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name);

-- Center
-- Email: center@comparedegree.com | Password: password123
INSERT INTO users (name, email, password_hash, role, phone, organization_name, address) VALUES
('EduPoint Delhi Center', 'center@comparedegree.com', '$2b$10$EGpF7cFq7.Mi3TXMV3fAM.nm3O.fgHqeBpwLdOnrcvu3ABVGRHzXG', 'center', '9812345670', 'EduPoint Delhi', 'New Delhi, Delhi')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name);

-- Subcenter (linked to Center)
-- Email: subcenter@comparedegree.com | Password: password123
INSERT INTO users (name, email, password_hash, role, phone, organization_name, parent_center_id) VALUES
('EduPoint Subcenter 1', 'subcenter@comparedegree.com', '$2b$10$EGpF7cFq7.Mi3TXMV3fAM.nm3O.fgHqeBpwLdOnrcvu3ABVGRHzXG', 'subcenter', '9821842228', 'EduPoint Branch', 2)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name);

-- Universities
INSERT IGNORE INTO universities (id, name, location) VALUES
(1, 'Uttaranchal University', 'Dehradun, Uttarakhand'),
(2, 'LPU - Lovely Professional University', 'Phagwara, Punjab'),
(3, 'Chandigarh University', 'Chandigarh, Punjab'),
(4, 'Amity University', 'Noida, Uttar Pradesh'),
(5, 'Manipal University', 'Manipal, Karnataka');

-- Courses
INSERT IGNORE INTO courses (id, university_id, name, duration, fees) VALUES
(1, 1, 'Master of Business Administration (MBA)', '2 Years', 180000),
(2, 1, 'Bachelor of Technology (B.Tech)', '4 Years', 120000),
(3, 2, 'Master of Business Administration (MBA)', '2 Years', 220000),
(4, 2, 'Bachelor of Commerce (B.Com)', '3 Years', 90000),
(5, 3, 'Bachelor of Technology (B.Tech)', '4 Years', 150000),
(6, 3, 'Master of Computer Applications (MCA)', '2 Years', 130000),
(7, 4, 'Bachelor of Business Administration (BBA)', '3 Years', 110000),
(8, 5, 'Master of Technology (M.Tech)', '2 Years', 200000);

-- Sample Leads
INSERT IGNORE INTO leads (student_name, email, phone, university_id, course_id, center_id, subcenter_id, lead_type, status, adm_status) VALUES
('Ravi Teja',    'ravi@example.com',   '9000000001', 1, 1, 2, 3, 'primary',   'new',                   'pending'),
('Pooja Singh',  'pooja@example.com',  '9000000002', 2, 3, 2, 3, 'primary',   'contacted',             'pending'),
('Aman Khan',    'aman@example.com',   '9000000003', 3, 5, 2, 3, 'secondary', 'application_submitted', 'approved'),
('Neha Gupta',   'neha@example.com',   '9000000004', 4, 7, 2, 3, 'primary',   'admitted',              'approved'),
('Vikas Nair',   'vikas@example.com',  '9000000005', 1, 2, 2, NULL, 'primary','rejected',              'rejected');
