ALTER TABLE invoices ADD COLUMN issued_from_quotation_id BIGINT UNSIGNED NULL AFTER quotation_id;
CREATE INDEX idx_invoices_issued_from_quotation ON invoices(issued_from_quotation_id);
