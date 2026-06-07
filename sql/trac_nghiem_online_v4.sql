DROP DATABASE IF EXISTS online_test;
CREATE DATABASE online_test;
USE online_test;

CREATE TABLE `users` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(255) UNIQUE NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `failed_attempts` int DEFAULT 0,
  `role` ENUM ('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
  `is_active` bool NOT NULL DEFAULT true
);

CREATE TABLE `notifications` (
  `noti_id` int PRIMARY KEY AUTO_INCREMENT,
  `m_content` text NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `noti_users` (
  `noti_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_read` bool DEFAULT false
);

CREATE TABLE `subjects` (
  `sub_id` int PRIMARY KEY AUTO_INCREMENT,
  `sub_name` varchar(50) NOT NULL,
  `created_by` int NOT NULL
);

CREATE TABLE `question_banks` (
  `question_id` int PRIMARY KEY AUTO_INCREMENT,
  `sub_id` int NOT NULL,
  `q_type` ENUM ('single', 'multiple', 'true_false') NOT NULL,
  `m_content` text NOT NULL,
  `difficulty` int DEFAULT 0,
  `created_by` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `is_active` bool DEFAULT true
);

CREATE TABLE `answer_banks` (
  `answer_id` int PRIMARY KEY AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `is_correct` bool NOT NULL,
  `m_content` text NOT NULL,
  `order_index` char(1) NOT NULL
);

CREATE TABLE `exam_templates` (
  `template_id` int PRIMARY KEY AUTO_INCREMENT,
  `template_name` varchar(150) NOT NULL,
  `sub_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `is_active` bool DEFAULT true
);

CREATE TABLE `exam_template_questions` (
  `template_id` int NOT NULL,
  `question_id` int NOT NULL,
  `score` decimal(5,2) DEFAULT 0.25,
  `order_index` int NOT NULL
);

CREATE TABLE `exam_sessions` (
  `session_id` int PRIMARY KEY AUTO_INCREMENT,
  `template_id` int NOT NULL,
  `session_name` varchar(150) NOT NULL,
  `duration` int,
  `shuffle_questions` bool DEFAULT true,
  `shuffle_answers` bool DEFAULT true,
  `auto_submit` bool DEFAULT true,
  `allow_review` bool DEFAULT false,
  `show_result` bool DEFAULT false,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `attempt_limit` int DEFAULT 1,
  `session_password` varchar(10) NOT NULL,
  `session_status` ENUM ('draft', 'published', 'ongoing', 'finished') DEFAULT 'draft',
  `created_by` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `classes` (
  `class_id` int PRIMARY KEY AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `class_name` varchar(100) NOT NULL
);

CREATE TABLE `class_invitations` (
  `invit_id` int PRIMARY KEY AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `invited_by` int NOT NULL,
  `invit_status` ENUM ('pending', 'accepted', 'expired') DEFAULT 'pending',
  `expire_at` timestamp
);

CREATE TABLE `student_class` (
  `student_id` int NOT NULL,
  `class_id` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `student_attempts` (
  `attempt_id` int PRIMARY KEY AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `session_id` int NOT NULL,
  `ip_address` varchar(45),
  `device_info` json,
  `attempt_status` ENUM ('in_progress', 'submitted', 'timeout', 'graded') DEFAULT 'in_progress',
  `attempt_no` int NOT NULL,
  `is_retake` bool DEFAULT false,
  `shuffle_seed` varchar(40),
  `start_time` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `submit_time` timestamp,
  `total_score` decimal(5,2) DEFAULT 0
);

CREATE TABLE `student_attempt_answers` (
  `attempt_id` int NOT NULL,
  `answer_id` int NOT NULL
);

CREATE TABLE `exam_session_class` (
  `session_id` int NOT NULL,
  `class_id` int NOT NULL
);

CREATE TABLE `proctoring_events` (
  `event_id` int PRIMARY KEY AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `event_type` ENUM ('tab_switch', 'copy', 'multiple_login', 'network_disconnect') NOT NULL,
  `event_time` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `metadata` json
);

CREATE TABLE `retake_permissions` (
  `permission_id` int PRIMARY KEY AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `available_from` timestamp NOT NULL,
  `available_to` timestamp NOT NULL,
  `max_attempt` int DEFAULT 2,
  `created_by` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `retake_requests` (
  `request_id` int PRIMARY KEY AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `student_id` int NOT NULL,
  `reason` text,
  `request_status` ENUM ('pending', 'granted', 'rejected') DEFAULT 'pending',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX `users_index_0` ON `users` (`role`);

CREATE UNIQUE INDEX `noti_users_index_1` ON `noti_users` (`noti_id`, `user_id`);

CREATE INDEX `noti_users_index_2` ON `noti_users` (`user_id`);

CREATE INDEX `noti_users_index_3` ON `noti_users` (`user_id`, `is_read`);

CREATE UNIQUE INDEX `subjects_index_4` ON `subjects` (`sub_name`, `created_by`);

CREATE UNIQUE INDEX `exam_template_questions_index_5` ON `exam_template_questions` (`template_id`, `question_id`);

CREATE UNIQUE INDEX `student_class_index_6` ON `student_class` (`student_id`, `class_id`);

CREATE INDEX `student_class_index_7` ON `student_class` (`class_id`);

CREATE UNIQUE INDEX `student_attempts_index_8` ON `student_attempts` (`student_id`, `attempt_no`);

CREATE UNIQUE INDEX `student_attempt_answers_index_9` ON `student_attempt_answers` (`attempt_id`, `answer_id`);

CREATE UNIQUE INDEX `exam_session_class_index_10` ON `exam_session_class` (`session_id`, `class_id`);

CREATE UNIQUE INDEX `retake_requests_index_11` ON `retake_requests` (`session_id`, `student_id`);

-- THÔNG BÁO
ALTER TABLE `notifications` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

ALTER TABLE `noti_users` ADD FOREIGN KEY (`noti_id`) REFERENCES `notifications` (`noti_id`);

ALTER TABLE `noti_users` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

-- QUẢN LÝ NGÂN HÀNG CÂU HỎI, ĐỀ THI, KỲ THI
ALTER TABLE `subjects` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

ALTER TABLE `question_banks` ADD FOREIGN KEY (`sub_id`) REFERENCES `subjects` (`sub_id`);

ALTER TABLE `question_banks` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

ALTER TABLE `answer_banks` ADD FOREIGN KEY (`question_id`) REFERENCES `question_banks` (`question_id`);

ALTER TABLE `exam_templates` ADD FOREIGN KEY (`sub_id`) REFERENCES `subjects` (`sub_id`);

ALTER TABLE `exam_templates` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

ALTER TABLE `exam_template_questions` ADD FOREIGN KEY (`template_id`) REFERENCES `exam_templates` (`template_id`);

ALTER TABLE `exam_template_questions` ADD FOREIGN KEY (`question_id`) REFERENCES `question_banks` (`question_id`);

ALTER TABLE `exam_sessions` ADD FOREIGN KEY (`template_id`) REFERENCES `exam_templates` (`template_id`);

ALTER TABLE `exam_sessions` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

-- LỚP HỌC
ALTER TABLE `classes` ADD FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `class_invitations` ADD FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`);

ALTER TABLE `class_invitations` ADD FOREIGN KEY (`invited_by`) REFERENCES `users` (`user_id`);

ALTER TABLE `student_class` ADD FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `student_class` ADD FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`);

-- THAM GIA THI
ALTER TABLE `student_attempts` ADD FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `student_attempts` ADD FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`session_id`);

ALTER TABLE `student_attempt_answers` ADD FOREIGN KEY (`attempt_id`) REFERENCES `student_attempts` (`attempt_id`);

ALTER TABLE `student_attempt_answers` ADD FOREIGN KEY (`answer_id`) REFERENCES `answer_banks` (`answer_id`);

ALTER TABLE `exam_session_class` ADD FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`session_id`);

ALTER TABLE `exam_session_class` ADD FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`);

ALTER TABLE `proctoring_events` ADD FOREIGN KEY (`attempt_id`) REFERENCES `student_attempts` (`attempt_id`);

-- THI LẠI
ALTER TABLE `retake_permissions` ADD FOREIGN KEY (`request_id`) REFERENCES `retake_requests` (`request_id`);

ALTER TABLE `retake_permissions` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

ALTER TABLE `retake_requests` ADD FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`session_id`);

ALTER TABLE `retake_requests` ADD FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`);
