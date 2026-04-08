-- =====================================================
--  Presidency University Smart Scheduler
--  MySQL Schema — All Features + RBAC
-- =====================================================
CREATE DATABASE IF NOT EXISTS pu_scheduler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pu_scheduler;

CREATE TABLE users (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  role       ENUM('ADMIN','TEACHER','VIEWER') NOT NULL DEFAULT 'VIEWER',
  avatar     VARCHAR(50)  DEFAULT '👤',
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  capacity   INT          NOT NULL,
  type       ENUM('CLASSROOM','LAB','LECTURE_HALL','SEMINAR_ROOM') NOT NULL DEFAULT 'CLASSROOM',
  status     ENUM('ACTIVE','MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
  notes      TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE room_equipment (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_id   BIGINT      NOT NULL,
  equipment VARCHAR(50) NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE teachers (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  subject    VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(20),
  max_hours  INT          NOT NULL DEFAULT 20,
  user_id    BIGINT       UNIQUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE teacher_availability (
  id         BIGINT  AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT  NOT NULL,
  day        ENUM('Mon','Tue','Wed','Thu','Fri','Sat') NOT NULL,
  available  BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_teacher_day (teacher_id, day),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE slots (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  subject    VARCHAR(100) NOT NULL,
  cls        VARCHAR(50)  NOT NULL,
  teacher_id BIGINT       NOT NULL,
  room_id    BIGINT       NOT NULL,
  day        ENUM('Mon','Tue','Wed','Thu','Fri','Sat') NOT NULL,
  time_slot  VARCHAR(20)  NOT NULL,
  color      VARCHAR(10)  NOT NULL DEFAULT '#3b82f6',
  recurring  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id)    REFERENCES rooms(id)    ON DELETE RESTRICT
);

CREATE TABLE holidays (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  date       DATE         NOT NULL UNIQUE,
  label      VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocked_slots (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  day       ENUM('Mon','Tue','Wed','Thu','Fri','Sat') NOT NULL,
  time_slot VARCHAR(20)  NOT NULL,
  reason    VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_blocked (day, time_slot)
);

CREATE TABLE app_settings (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  val         TEXT         NOT NULL,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT       NOT NULL,
  action     VARCHAR(50)  NOT NULL,
  entity     VARCHAR(50)  NOT NULL,
  entity_id  BIGINT,
  detail     TEXT,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Seed Data ─────────────────────────────────────
-- All passwords = "password123"
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (username,password,full_name,email,role,avatar) VALUES
('admin',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Administrator',     'admin@presidency.edu', 'ADMIN',  '👔'),
('smith',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Mr. Smith',         'smith@presidency.edu', 'TEACHER','📚'),
('patel',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Ms. Patel',         'patel@presidency.edu', 'TEACHER','📖'),
('viewer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Department Viewer', 'viewer@presidency.edu','VIEWER', '👁');

INSERT INTO rooms (name,capacity,type,status,notes) VALUES
('Room 101',40, 'CLASSROOM',   'ACTIVE',      ''),
('Room 102',35, 'CLASSROOM',   'ACTIVE',      ''),
('Lab A',   30, 'LAB',         'ACTIVE',      ''),
('Hall 1',  120,'LECTURE_HALL','MAINTENANCE', 'Renovation until Jan 2026');

INSERT INTO room_equipment (room_id,equipment) VALUES
(1,'Projector'),(1,'AC'),(1,'Whiteboard'),
(2,'Whiteboard'),(2,'AC'),
(3,'Lab Equipment'),(3,'AC'),
(4,'Projector'),(4,'PA System'),(4,'AC');

INSERT INTO teachers (name,subject,email,phone,max_hours,user_id) VALUES
('Mr. Smith', 'Mathematics','smith@presidency.edu', '9876543210',20,2),
('Ms. Patel', 'Physics',    'patel@presidency.edu', '9876543211',18,3),
('Mrs. Khan', 'English',    'khan@presidency.edu',  '9876543212',22,NULL),
('Dr. Rao',   'Chemistry',  'rao@presidency.edu',   '9876543213',20,NULL),
('Mr. Thomas','History',    'thomas@presidency.edu','9876543214',18,NULL),
('Ms. Gupta', 'Biology',    'gupta@presidency.edu', '9876543215',20,NULL),
('Mr. Kumar', 'Computer Sc','kumar@presidency.edu', '9876543216',16,NULL);

INSERT INTO teacher_availability (teacher_id,day,available) VALUES
(1,'Mon',1),(1,'Tue',1),(1,'Wed',0),(1,'Thu',0),(1,'Fri',1),(1,'Sat',0),
(2,'Mon',1),(2,'Tue',0),(2,'Wed',1),(2,'Thu',1),(2,'Fri',1),(2,'Sat',0),
(3,'Mon',1),(3,'Tue',1),(3,'Wed',1),(3,'Thu',1),(3,'Fri',1),(3,'Sat',0),
(4,'Mon',0),(4,'Tue',1),(4,'Wed',1),(4,'Thu',1),(4,'Fri',0),(4,'Sat',0),
(5,'Mon',1),(5,'Tue',1),(5,'Wed',0),(5,'Thu',1),(5,'Fri',1),(5,'Sat',0),
(6,'Mon',1),(6,'Tue',0),(6,'Wed',1),(6,'Thu',1),(6,'Fri',1),(6,'Sat',0),
(7,'Mon',1),(7,'Tue',1),(7,'Wed',1),(7,'Thu',1),(7,'Fri',0),(7,'Sat',0);

INSERT INTO slots (subject,cls,teacher_id,room_id,day,time_slot,color) VALUES
('Mathematics','10-A',1,1,'Mon','8:00 AM', '#3b82f6'),
('Physics',    '10-B',2,3,'Mon','9:00 AM', '#06d6a0'),
('English',    '10-A',3,2,'Mon','10:00 AM','#a78bfa'),
('Chemistry',  '11-A',4,3,'Tue','8:00 AM', '#f59e0b'),
('History',    '10-B',5,1,'Tue','10:00 AM','#38bdf8'),
('Biology',    '11-B',6,4,'Wed','11:00 AM','#06d6a0'),
('Computer Sc','10-A',7,3,'Thu','9:00 AM', '#f87171'),
('Mathematics','11-A',1,4,'Fri','8:00 AM', '#3b82f6');

INSERT INTO holidays (date,label) VALUES
('2025-01-26','Republic Day'),
('2025-08-15','Independence Day'),
('2025-10-02','Gandhi Jayanti');

INSERT INTO app_settings (setting_key,val) VALUES
('saturday_enabled','false'),
('custom_times','["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM"]');
