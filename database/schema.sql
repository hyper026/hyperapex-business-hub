CREATE DATABASE IF NOT EXISTS hyperapex_business_hub;
USE hyperapex_business_hub;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','STAFF','SPECIALIST','CLIENT') NOT NULL DEFAULT 'STAFF',
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  client_type ENUM('INDIVIDUAL','BUSINESS','ORGANISATION') NOT NULL DEFAULT 'INDIVIDUAL',
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190),
  phone VARCHAR(40),
  address VARCHAR(255),
  notes TEXT,
  status ENUM('LEAD','ACTIVE','INACTIVE') NOT NULL DEFAULT 'LEAD',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  assigned_to BIGINT UNSIGNED NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT,
  status ENUM('NEW','DOCUMENTS_REQUIRED','IN_PROGRESS','AWAITING_CLIENT','UNDER_REVIEW','COMPLETED','CANCELLED') NOT NULL DEFAULT 'NEW',
  priority ENUM('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL',
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_requests_service FOREIGN KEY (service_id) REFERENCES services(id),
  CONSTRAINT fk_requests_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NULL,
  assigned_to BIGINT UNSIGNED NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT,
  status ENUM('TODO','IN_PROGRESS','BLOCKED','DONE') NOT NULL DEFAULT 'TODO',
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id BIGINT UNSIGNED NOT NULL,
  request_id BIGINT UNSIGNED NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120),
  file_size BIGINT UNSIGNED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_documents_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80),
  entity_id BIGINT UNSIGNED,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO services (category, name, slug, description) VALUES
('Legal, Compliance & Immigration','Taxation & eTIMS Compliance','tax-etims','Tax and eTIMS compliance support.'),
('Legal, Compliance & Immigration','Legal Services','legal-services','Legal advisory and documentation support.'),
('Legal, Compliance & Immigration','Commercial & Conveyancing','conveyancing','Property and commercial transaction support.'),
('Legal, Compliance & Immigration','Company Registration','company-registration','Company registration and corporate compliance.'),
('Legal, Compliance & Immigration','Immigration & Work Permits','immigration','Immigration, work permit and Special Pass support.'),
('Finance & Assurance','Accounting Services','accounting-services','Bookkeeping, reporting and accounting support.'),
('Finance & Assurance','Audit & Assurance Support','audit-assurance','Audit preparation and assurance support.'),
('Technology & Digital','IT Support & Managed Services','it-support-managed-services','Business IT support and managed services.'),
('Technology & Digital','Cybersecurity Services','cybersecurity','Practical cybersecurity advisory and resilience support.'),
('Technology & Digital','Website & Digital Services','website-digital-services','Business websites and digital presence services.'),
('Technology & Digital','Software & Business Systems','software-business-systems','Software, workflow and business systems support.'),
('Technology & Digital','Digital Transformation & ICT Advisory','digital-transformation-ict-advisory','Digital transformation and ICT strategy advisory.');
