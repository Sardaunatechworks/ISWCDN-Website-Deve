-- =====================================================================
-- ISWCDN - Institute of Social Welfare and Community Development of Nigeria
-- Real Seed Data Extracted from Database Backup (db_cluster-18-08-2026@18-39-05)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Real Administrator Accounts
-- Password for admin@iswcdn.admin is preserved from the original Supabase auth dump ($2a$10$bE64E8S7QSca7.YXYlveSeL/6FWtkN8cTYnCXIiTGT6bZNIzBD3XC)
-- Secondary admin@isowcod.org.ng and admin@iswcdn.org.ng provided with password: admin123456 ($2y$12$AMXzF/NE5FMg0xdJ0IxemelIyCoj7f6P6i8PYI8IOmMaC0QFD39l.)
INSERT INTO `admin_users` (`id`, `full_name`, `email`, `password_hash`, `role`, `status`)
VALUES 
(1, 'System Administrator', 'admin@iswcdn.admin', '$2a$10$bE64E8S7QSca7.YXYlveSeL/6FWtkN8cTYnCXIiTGT6bZNIzBD3XC', 'Super Administrator', 'active'),
(2, 'Institute Administrator', 'admin@isowcod.org.ng', '$2y$12$AMXzF/NE5FMg0xdJ0IxemelIyCoj7f6P6i8PYI8IOmMaC0QFD39l.', 'Super Administrator', 'active'),
(3, 'Secondary Administrator', 'admin@iswcdn.org.ng', '$2y$12$AMXzF/NE5FMg0xdJ0IxemelIyCoj7f6P6i8PYI8IOmMaC0QFD39l.', 'Super Administrator', 'active')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 2. Real Institutional Settings (Extracted from Backup)
INSERT INTO `settings` (`id`, `phone1`, `phone2`, `email`, `location`, `address`, `years_impact`)
VALUES (
  1,
  '+234 803 627 4417',
  '+234 803 624 9795',
  'info@isowcod.org.ng',
  'Bauchi, Nigeria',
  'Flat 2 block 4 ZAMZAM block, Awalah roundabout',
  '10+'
) ON DUPLICATE KEY UPDATE 
  `phone1` = VALUES(`phone1`),
  `phone2` = VALUES(`phone2`),
  `email` = VALUES(`email`),
  `location` = VALUES(`location`),
  `address` = VALUES(`address`),
  `years_impact` = VALUES(`years_impact`);

-- 3. Real Academic Courses Catalog (16 Records from Backup)
INSERT INTO `courses` (`id`, `title`, `category`, `duration`, `type`, `description`, `order_index`, `is_active`) VALUES
(1, 'Diploma in Social Work', 'diploma', '2 Years', 'Long-Term', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 1, 1),
(2, 'Project Planning & Management', 'diploma', '18 Months', 'Long-Term', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 2, 1),
(3, 'Community Development Studies', 'diploma', '2 Years', 'Long-Term', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 3, 1),
(4, 'Public Administration', 'diploma', '2 Years', 'Long-Term', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 4, 1),
(5, 'MHPSS (Mental Health & Psychosocial Support)', 'certificate', '6 Months', 'Short Course', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 5, 1),
(6, 'Social Accountability & Governance', 'certificate', '3 Months', 'Short Course', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 6, 1),
(7, 'Child Protection Services', 'certificate', '4 Months', 'Short Course', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 7, 1),
(8, 'Health Social Work', 'certificate', '1 Year', 'Specialization', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 8, 1),
(9, 'Justice & Rehabilitation', 'certificate', '1 Year', 'Specialization', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 9, 1),
(10, 'Tech4Dev (Technology for Development)', 'certificate', '6 Months', 'Technical', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 10, 1),
(11, 'Advanced Leadership in Social Sector', 'executive', '5 Days', 'Workshop', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 11, 1),
(12, 'Strategic NGO Management', 'executive', '1 Week', 'Intensive', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 12, 1),
(13, 'Welding & Fabrication', 'vocational', '6 Months', 'Vocational', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 13, 1),
(14, 'Fashion Designing & Tailoring', 'vocational', '1 Year', 'Vocational', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 14, 1),
(15, 'Automobile Repair & Maintenance', 'vocational', '6 Months', 'Vocational', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 15, 1),
(16, 'Computer & Information Technology', 'vocational', '3 Months', 'Vocational', 'Comprehensive curriculum covering theoretical foundations and practical field applications.', 16, 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `category` = VALUES(`category`), `duration` = VALUES(`duration`), `type` = VALUES(`type`), `description` = VALUES(`description`);

-- 4. Real Governing Board & Leadership Team (7 Records from Backup & Storage Archive)
INSERT INTO `team` (`id`, `name`, `role`, `image_url`, `bio`, `order_index`, `is_active`) VALUES
(1, 'Baheejah Mahmood Abdullah', 'CEO/ED', '/profiles/kib1znf1xm9.jpeg', 'Executive Director providing strategic leadership and oversight for community development initiatives across Nigeria.', 1, 1),
(2, 'Cmr Aminu Umar Malu', 'Secretary', '/profiles/raud9oln95e.jpeg', 'Secretariat administration, council documentation, and institutional correspondence.', 2, 1),
(3, 'Prof. Abubakar Yahaya', 'Director Academic Planning', '/profiles/wtylxoxtmh.jpeg', 'Director of Academic Planning leading curriculum standards and accreditation.', 3, 1),
(4, 'Amb. Sulaiman Ashiru', 'HR/program Manager', '/profiles/jc2td6zvu9p.jpeg', 'Human Resources and Program Manager steering organizational development and field outreach.', 4, 1),
(5, 'Abba Dauda', 'DLP Coordinator', '/profiles/yqqbphwssj9.jpeg', 'Distance Learning Program (DLP) Coordinator expanding educational access nationwide.', 5, 1),
(6, 'Muhammad Dini Ibrahim', 'Monitoring and Evaluation', '/profiles/38jbt3lboal.jpeg', 'Monitoring and Evaluation Officer ensuring data integrity, impact assessment, and project fidelity.', 6, 1),
(7, 'Barr Najib Rabiu', 'Legal Adviser', '/profiles/jsfxd0x7w2l.jpeg', 'Legal Adviser overseeing regulatory compliance, governance, and statutory affairs.', 7, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `role` = VALUES(`role`), `image_url` = VALUES(`image_url`), `bio` = VALUES(`bio`);

-- 5. Real Photo Gallery Catalog (16 Records from Backup)
INSERT INTO `gallery` (`id`, `title`, `image_url`, `category`, `order_index`) VALUES
(1, 'Inauguration Ceremony', '/inaguration.png', 'Events', 1),
(2, 'Partnership Handshake', '/handshake.png', 'Corporate', 2),
(3, 'Youth Development Project', '/kids.png', 'Community', 3),
(4, 'Community Outreach Program', '/kids2.png', 'Community', 4),
(5, 'Exhibition Hall', '/image1.png', 'Institute', 5),
(6, 'Learning Session', '/image2.png', 'Training', 6),
(7, 'Professional Seminar', '/image3.png', 'Events', 7),
(8, 'Regional Conference', '/image4.png', 'Events', 8),
(9, 'Award Presentation', '/image5.png', 'Awards', 9),
(10, 'Social Work Workshop', '/image6.png', 'Training', 10),
(11, 'Facility Inspection', '/image7.png', 'General', 11),
(12, 'Delegate Meeting', '/image8.png', 'Meetings', 12),
(13, 'Certification Ceremony', '/image9.png', 'Awards', 13),
(14, 'Leadership Summit', '/image10.png', 'Events', 14),
(15, 'Keynote Speaker', '/speaker.png', 'Training', 15),
(16, 'Dignitary Visit', '/ashiru.png', 'Corporate', 16)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `image_url` = VALUES(`image_url`), `category` = VALUES(`category`);

-- 6. Real Newsletter Subscribers (2 Records from Backup)
INSERT INTO `subscribers` (`id`, `email`, `is_active`, `created_at`) VALUES
(1, 'sardaunamaa2008@gmail.com', 1, '2026-04-09 09:27:51'),
(2, 'testmail@gmail.com', 1, '2026-04-09 09:29:44')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 7. Real Broadcasts (1 Record from Backup)
INSERT INTO `broadcasts` (`id`, `subject`, `content`, `recipient_count`, `sent_at`) VALUES
(1, 'Test', 'Test Newsletter', 2, '2026-04-11 06:43:11')
ON DUPLICATE KEY UPDATE `subject` = VALUES(`subject`);

SET FOREIGN_KEY_CHECKS = 1;
