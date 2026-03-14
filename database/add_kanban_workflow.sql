-- Add Kanban Workflow Support to Complaints Table
-- This migration updates the status enum to support the new Kanban workflow

-- First, let's check the current status values and add new ones if needed
-- The new workflow statuses are: open, assigned, in_progress, resolved, verified, reopened

-- Update the status enum to include all Kanban statuses
ALTER TABLE complaints 
MODIFY COLUMN status ENUM(
  'submitted',      -- Legacy: maps to 'open'
  'under_review',   -- Legacy: maps to 'assigned'
  'in_progress',    -- Kanban: in_progress
  'resolved',       -- Kanban: resolved
  'verified',       -- Kanban: verified
  'rejected',       -- Legacy: maps to 'reopened'
  'open',           -- Kanban: open
  'assigned',       -- Kanban: assigned
  'reopened'        -- Kanban: reopened
) DEFAULT 'submitted';

-- Add assigned_worker_id column if it doesn't exist
ALTER TABLE complaints 
ADD COLUMN assigned_worker_id INT NULL AFTER user_id;

-- Add foreign key for assigned_worker_id if it doesn't exist
ALTER TABLE complaints 
ADD CONSTRAINT fk_assigned_worker FOREIGN KEY (assigned_worker_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create an index on assigned_worker_id for faster queries
CREATE INDEX idx_assigned_worker_id ON complaints(assigned_worker_id);

-- Add workflow_updated_at to track when status changes
ALTER TABLE complaints 
ADD COLUMN workflow_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER updated_at;

-- Add before_image_path and after_image_path if they don't exist (for resolution tracking)
ALTER TABLE complaints 
ADD COLUMN before_image_path VARCHAR(500) NULL AFTER image_path,
ADD COLUMN after_image_path VARCHAR(500) NULL AFTER before_image_path;

-- Create a workflow history table to track all status changes
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

-- Create a view for Kanban board data
CREATE OR REPLACE VIEW kanban_board_view AS
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
  COALESCE(c.before_image_path, NULL) AS before_image_path,
  COALESCE(c.after_image_path, NULL) AS after_image_path,
  u.name AS assigned_worker_name
FROM complaints c
LEFT JOIN users u ON c.assigned_worker_id = u.id
ORDER BY c.created_at DESC;

-- Insert sample data for testing (optional)
-- Uncomment to add test complaints in different Kanban statuses
/*
INSERT INTO complaints (user_id, title, description, image_path, latitude, longitude, date, time, category, priority, status, assigned_worker_id)
VALUES 
  (1, 'Pothole on MG Road', 'Large pothole causing traffic issues', '/uploads/test1.jpg', 12.9716, 77.5946, CURDATE(), CURTIME(), 'Road Damage', 'high', 'submitted', NULL),
  (1, 'Garbage pile at Bus Stand', 'Uncollected garbage for 3 days', '/uploads/test2.jpg', 12.9352, 77.6245, CURDATE(), CURTIME(), 'Garbage', 'medium', 'under_review', 2),
  (1, 'Water leakage on 5th Main', 'Water leaking from main pipe', '/uploads/test3.jpg', 12.9500, 77.6100, CURDATE(), CURTIME(), 'Water Leakage', 'high', 'in_progress', 3),
  (1, 'Broken streetlight on Indiranagar', 'Streetlight not working for a week', '/uploads/test4.jpg', 12.9716, 77.6412, CURDATE(), CURTIME(), 'Streetlight', 'medium', 'resolved', 4),
  (1, 'Damaged road near Koramangala', 'Road surface cracked and uneven', '/uploads/test5.jpg', 12.9352, 77.6245, CURDATE(), CURTIME(), 'Road Damage', 'critical', 'verified', 5);
*/
