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
(5, 'Manipal University', 'Manipal, Karnataka'),
(6, 'Shoolini University', 'Solan, Himachal Pradesh'),
(15, 'GLA University', 'Mathura, Uttar Pradesh'),
(16, 'Manipal University Jaipur', 'Jaipur, Rajasthan'),
(17, 'Sikkim Manipal University', 'Gangtok, Sikkim');

-- Courses
INSERT IGNORE INTO courses (id, university_id, name, duration, fees) VALUES
(1, 1, 'Master of Business Administration (MBA)', '2 Years', 180000),
(2, 1, 'Bachelor of Technology (B.Tech)', '4 Years', 120000),
(3, 2, 'Master of Business Administration (MBA)', '2 Years', 220000),
(4, 2, 'Bachelor of Commerce (B.Com)', '3 Years', 90000),
(5, 3, 'Bachelor of Technology (B.Tech)', '4 Years', 150000),
(6, 3, 'Master of Computer Applications (MCA)', '2 Years', 130000),
(7, 4, 'Bachelor of Business Administration (BBA)', '3 Years', 110000),
(8, 5, 'Master of Technology (M.Tech)', '2 Years', 200000),
(9, 6, 'MBA Online', '2 Years', 150000),
(82, 15, 'BBA - Human Resource Management', '3 Years', NULL),
(83, 15, 'BBA - Marketing Management', '3 Years', NULL),
(84, 15, 'BBA - Financial Management', '3 Years', NULL),
(85, 15, 'BBA - Banking and Insurance', '3 Years', NULL),
(86, 15, 'BCA - Bachelor of Computer Application', '3 Years', NULL),
(87, 15, 'B.Com - Bachelor of Commerce', '3 Years', NULL),
(88, 15, 'MBA - Marketing Management', '2 Years', NULL),
(89, 15, 'MBA - Human Resource Management', '2 Years', NULL),
(90, 15, 'MBA - Finance Management', '2 Years', NULL),
(91, 15, 'MBA - Information Technology Management', '2 Years', NULL),
(92, 15, 'MBA - Operations Management', '2 Years', NULL),
(93, 15, 'MBA - Banking and Financial Services', '2 Years', NULL),
(94, 15, 'MBA - Business Analytics', '2 Years', NULL),
(95, 15, 'MBA - Supply Chain Management', '2 Years', NULL),
(96, 15, 'MCA - Masters of Computer Application', '2 Years', NULL),
(104, 16, 'MBA', '2 Years', NULL),
(105, 16, 'MCA', '2 Years', NULL),
(110, 16, 'BBA', '3 Years', NULL),
(111, 16, 'BCA', '3 Years', NULL),
(113, 16, 'B.Com', '3 Years', NULL),
(114, 16, 'M.Com', '2 Years', NULL),
(115, 16, 'MA.JMC', '2 Years', NULL),
(116, 16, 'MA in Economics', '2 Years', NULL),
(117, 16, 'MSc in Mathematics', '2 Years', NULL),
(97, 17, 'BA', '3 Years', NULL),
(99, 17, 'BBA', '3 Years', NULL),
(102, 17, 'MBA', '2 Years', NULL),
(103, 17, 'MCA', '2 Years', NULL),
(118, 17, 'MA in English', '2 Years', NULL),
(119, 17, 'MA in Sociology', '2 Years', NULL),
(120, 17, 'MA in Political Science', '2 Years', NULL),
(121, 17, 'B.Com', '3 Years', NULL),
(122, 17, 'M.Com', '2 Years', NULL);

-- Sample Leads (ON DUPLICATE KEY UPDATE keeps sample data clean on repeated runs)
INSERT INTO leads (id, student_name, email, phone, university_id, course_id, center_id, subcenter_id, lead_type, status, adm_status) VALUES
(1, 'Ravi Teja',    'ravi@example.com',   '9000000001', 1, 1, 2, 3, 'Primary',      'New Lead',                     'Pending'),
(2, 'Pooja Singh',  'pooja@example.com',  '9000000002', 2, 3, 2, 3, 'Under Review', 'Fees Collected',               'Pending'),
(3, 'Aman Khan',    'aman@example.com',   '9000000003', 3, 5, 2, 3, 'Duplicate',    'Docs Under Review/Incomplete', 'Approved'),
(4, 'Neha Gupta',   'neha@example.com',   '9000000004', 4, 7, 2, 3, 'Primary',      'Admission Approved',           'Approved'),
(5, 'Vikas Nair',   'vikas@example.com',  '9000000005', 1, 2, 2, NULL, 'Under Review', 'Refund Initiated',          'Refunded')
ON DUPLICATE KEY UPDATE
  lead_type = VALUES(lead_type),
  status = VALUES(status),
  adm_status = VALUES(adm_status);
