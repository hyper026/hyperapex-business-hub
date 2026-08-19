CREATE TABLE IF NOT EXISTS notifications (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 request_id BIGINT UNSIGNED NULL,
 type VARCHAR(40) NOT NULL,
 title VARCHAR(255) NOT NULL,
 message TEXT NOT NULL,
 is_read BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 read_at TIMESTAMP NULL DEFAULT NULL,
 INDEX idx_notifications_user_read(user_id,is_read,created_at),
 INDEX idx_notifications_request(request_id),
 CONSTRAINT fk_notification_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 CONSTRAINT fk_notification_request FOREIGN KEY(request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);
