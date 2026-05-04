CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  otp_code VARCHAR(6) DEFAULT NULL,
  otp_expires_at DATETIME DEFAULT NULL,
  otp_send_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  password_reset_code VARCHAR(6) DEFAULT NULL,
  password_reset_expires_at DATETIME DEFAULT NULL,
  password_reset_send_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
);

CREATE TABLE IF NOT EXISTS vr_sessions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_code VARCHAR(32) NOT NULL,
  vr_app VARCHAR(100) NOT NULL,
  scenario_key VARCHAR(100) NOT NULL,
  status ENUM('active', 'completed', 'canceled') NOT NULL DEFAULT 'active',
  metadata_json JSON DEFAULT NULL,
  result_json JSON DEFAULT NULL,
  video_url VARCHAR(2048) DEFAULT NULL,
  video_uploaded_at DATETIME DEFAULT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY vr_sessions_session_code_unique (session_code),
  KEY vr_sessions_user_id_idx (user_id),
  CONSTRAINT vr_sessions_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
