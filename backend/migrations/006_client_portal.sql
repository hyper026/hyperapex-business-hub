-- Client portal account linkage
-- Run once against the Business Hub database before enabling CLIENT accounts.
ALTER TABLE users ADD COLUMN client_id BIGINT NULL;
ALTER TABLE users ADD INDEX idx_users_client_id (client_id);
ALTER TABLE users ADD CONSTRAINT fk_users_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
