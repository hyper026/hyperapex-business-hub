ALTER TABLE quotations ADD COLUMN client_response_at TIMESTAMP NULL DEFAULT NULL AFTER status;
ALTER TABLE quotations ADD COLUMN client_response_note TEXT NULL AFTER client_response_at;
CREATE INDEX idx_quotations_client_status ON quotations(client_id,status,created_at);
