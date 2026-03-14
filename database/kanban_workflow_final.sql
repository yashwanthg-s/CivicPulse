-- Kanban Workflow Final Migration
-- Only adds what's missing, skips existing columns

USE complaint_system;

-- 1. Update status enum to include Kanban statuses
ALTER TABLE complaints 
MODIFY COLUMN status ENUM(
  'submitted',
  'under_review',
  'in_progress',
  'resolved',
  'verified',
  'rejected',
  'open',
  'assigned',
  'reopened'
) DEFAULT 'submitted';

-- 2. Create workflow history table (if not exists)
CREATE TABLE IF NOT EXISTS complaint_workflow_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by INT,
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_changed_at (changed_at),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Create Kanban board view
DROP VIEW IF EXISTS kanban_board_view;
CREATE VIEW kanban_board_view AS
SELECT 
  c.id,
  c.title,
  c.description,
  c.category,
  c.priority,
  c.latitude,
  c.longitude,
  CASE 
    WHEN c.status IN ('submitted') THEN 'open'
    WHEN c.status IN ('under_review') THEN 'assigned'
    WHEN c.status = 'in_progress' THEN 'in_progress'
    WHEN c.status = 'resolved' THEN 'resolved'
    WHEN c.status = 'verified' THEN 'verified'
    WHEN c.status IN ('rejected') THEN 'reopened'
    ELSE c.status
  END AS kanban_status,
  c.status AS db_status,
  c.assigned_worker_id,
  c.created_at,
  c.updated_at,
  c.image_path,
  c.before_image_path,
  c.after_image_path,
  u.name AS assigned_worker_name
FROM complaints c
LEFT JOIN users u ON c.assigned_worker_id = u.id
ORDER BY c.created_at DESC;

-- 4. Verification queries
SELECT 'Kanban workflow setup completed!' AS status;
SELECT COUNT(*) as total_complaints FROM complaints;
SELECT DISTINCT status FROM complaints ORDER BY status;
SELECT COUNT(*) as workflow_history_records FROM complaint_workflow_history;
