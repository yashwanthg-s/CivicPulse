-- Priority Queue System for Department-Level Complaint Management
-- This adds priority scoring and queue management capabilities

USE complaint_system;

-- 1. Add priority scoring columns to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS severity_score INT DEFAULT 0 COMMENT 'Severity score (0-100)';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS cluster_score INT DEFAULT 0 COMMENT 'Cluster size score (0-100)';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_score INT DEFAULT 0 COMMENT 'Location sensitivity score (0-100)';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS sla_score INT DEFAULT 0 COMMENT 'SLA delay score (0-100)';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS priority_score INT DEFAULT 0 COMMENT 'Final priority score (sum of all factors)';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS department VARCHAR(100) COMMENT 'Department responsible (roads, sanitation, etc)';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS sla_deadline DATETIME COMMENT 'SLA deadline for resolution';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS queue_position INT COMMENT 'Position in department queue';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS last_priority_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create indexes for priority queue queries
CREATE INDEX IF NOT EXISTS idx_priority_score ON complaints(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_department_priority ON complaints(department, priority_score DESC, status);
CREATE INDEX IF NOT EXISTS idx_sla_deadline ON complaints(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_queue_position ON complaints(department, queue_position);

-- 2. Severity Configuration Table
CREATE TABLE IF NOT EXISTS severity_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(100) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  severity_score INT NOT NULL COMMENT '0-100',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_keyword (keyword),
  UNIQUE KEY unique_category_keyword (category, keyword)
);

-- Insert default severity keywords
INSERT INTO severity_config (category, keyword, severity_score) VALUES
-- Infrastructure
('infrastructure', 'gas leak', 100),
('infrastructure', 'open manhole', 100),
('infrastructure', 'pothole', 80),
('infrastructure', 'broken bridge', 95),
('infrastructure', 'collapsed road', 100),
('infrastructure', 'water leakage', 60),
('infrastructure', 'broken divider', 50),
('infrastructure', 'streetlight', 40),
-- Sanitation
('sanitation', 'garbage pile', 40),
('sanitation', 'waste', 35),
('sanitation', 'litter', 30),
('sanitation', 'sewage', 70),
('sanitation', 'drain', 50),
-- Traffic
('traffic', 'accident', 90),
('traffic', 'traffic jam', 50),
('traffic', 'signal broken', 60),
('traffic', 'road blocked', 70),
-- Safety
('safety', 'fire', 100),
('safety', 'accident', 90),
('safety', 'injury', 85),
('safety', 'emergency', 95),
-- Utilities
('utilities', 'power outage', 70),
('utilities', 'water shortage', 60),
('utilities', 'electricity', 65)
ON DUPLICATE KEY UPDATE severity_score=VALUES(severity_score);

-- 3. Location Sensitivity Configuration Table
CREATE TABLE IF NOT EXISTS location_sensitivity_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_type VARCHAR(100) NOT NULL,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(10, 8),
  radius_meters INT DEFAULT 500 COMMENT 'Radius around location',
  sensitivity_score INT NOT NULL COMMENT '0-100',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_location_type (location_type),
  INDEX idx_coordinates (latitude, longitude)
);

-- Insert default sensitive locations
INSERT INTO location_sensitivity_config (location_type, location_name, sensitivity_score) VALUES
('hospital', 'Hospital area', 50),
('school', 'School zone', 50),
('highway', 'Highway', 40),
('airport', 'Airport area', 45),
('railway', 'Railway station', 40),
('market', 'Market area', 35),
('residential', 'Residential street', 20),
('commercial', 'Commercial area', 25),
('park', 'Public park', 30)
ON DUPLICATE KEY UPDATE sensitivity_score=VALUES(sensitivity_score);

-- 4. SLA Configuration by Category (replaces old priority-based SLA)
CREATE TABLE IF NOT EXISTS category_sla_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(100) NOT NULL,
  sla_hours INT NOT NULL COMMENT 'Hours to resolve',
  escalation_1_hours INT COMMENT 'First escalation',
  escalation_2_hours INT COMMENT 'Second escalation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category (category)
);

-- Insert default SLA by category
INSERT INTO category_sla_config (category, sla_hours, escalation_1_hours, escalation_2_hours) VALUES
('infrastructure', 48, 24, 36),
('sanitation', 24, 12, 18),
('traffic', 12, 6, 9),
('safety', 4, 2, 3),
('utilities', 24, 12, 18)
ON DUPLICATE KEY UPDATE sla_hours=VALUES(sla_hours);

-- 5. Department Queue Table (tracks queue state)
CREATE TABLE IF NOT EXISTS department_queues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department VARCHAR(100) NOT NULL,
  total_complaints INT DEFAULT 0,
  critical_count INT DEFAULT 0,
  high_count INT DEFAULT 0,
  medium_count INT DEFAULT 0,
  low_count INT DEFAULT 0,
  avg_priority_score DECIMAL(5, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_department (department),
  INDEX idx_department (department)
);

-- 6. Priority Score History (for analytics)
CREATE TABLE IF NOT EXISTS priority_score_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  severity_score INT,
  cluster_score INT,
  location_score INT,
  sla_score INT,
  total_priority_score INT,
  queue_position INT,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_calculated_at (calculated_at),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 7. Create view for priority queue (sorted by priority)
CREATE OR REPLACE VIEW complaint_priority_queue AS
SELECT 
  c.id,
  c.title,
  c.description,
  c.category,
  c.department,
  c.status,
  c.severity_score,
  c.cluster_score,
  c.location_score,
  c.sla_score,
  c.priority_score,
  c.queue_position,
  c.sla_deadline,
  c.created_at,
  c.latitude,
  c.longitude,
  CASE 
    WHEN c.priority_score >= 200 THEN 'critical'
    WHEN c.priority_score >= 150 THEN 'high'
    WHEN c.priority_score >= 100 THEN 'medium'
    ELSE 'low'
  END AS priority_level,
  CASE 
    WHEN c.sla_deadline < NOW() THEN 'overdue'
    WHEN c.sla_deadline < DATE_ADD(NOW(), INTERVAL 6 HOUR) THEN 'urgent'
    ELSE 'on_track'
  END AS sla_status
FROM complaints c
WHERE c.status IN ('submitted', 'under_review', 'in_progress')
ORDER BY c.department, c.priority_score DESC, c.created_at ASC;

-- 8. Create stored procedure to calculate priority score
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS calculate_complaint_priority(
  IN p_complaint_id INT
)
BEGIN
  DECLARE v_severity_score INT DEFAULT 0;
  DECLARE v_cluster_score INT DEFAULT 0;
  DECLARE v_location_score INT DEFAULT 0;
  DECLARE v_sla_score INT DEFAULT 0;
  DECLARE v_total_score INT DEFAULT 0;
  DECLARE v_cluster_count INT DEFAULT 0;
  DECLARE v_hours_elapsed INT DEFAULT 0;
  DECLARE v_sla_hours INT DEFAULT 48;
  DECLARE v_category VARCHAR(100);
  DECLARE v_title TEXT;
  DECLARE v_description TEXT;

  -- Get complaint details
  SELECT category, title, description INTO v_category, v_title, v_description
  FROM complaints WHERE id = p_complaint_id;

  -- 1. Calculate Severity Score (0-100)
  SELECT MAX(severity_score) INTO v_severity_score
  FROM severity_config
  WHERE category = v_category 
    AND (LOWER(v_title) LIKE CONCAT('%', LOWER(keyword), '%') 
      OR LOWER(v_description) LIKE CONCAT('%', LOWER(keyword), '%'));
  
  IF v_severity_score IS NULL THEN
    SET v_severity_score = 20; -- Default for unmatched complaints
  END IF;

  -- 2. Calculate Cluster Score (0-100)
  SELECT COUNT(*) INTO v_cluster_count
  FROM complaint_cluster_members ccm
  JOIN complaint_clusters cc ON ccm.cluster_id = cc.id
  WHERE cc.primary_complaint_id = p_complaint_id OR ccm.complaint_id = p_complaint_id;

  SET v_cluster_score = LEAST(100, ROUND(LOG10(GREATEST(v_cluster_count, 1)) * 30));

  -- 3. Calculate Location Score (0-100)
  -- For now, default to 20 (can be enhanced with actual location matching)
  SET v_location_score = 20;

  -- 4. Calculate SLA Score (0-100)
  SELECT sla_hours INTO v_sla_hours FROM category_sla_config WHERE category = v_category;
  IF v_sla_hours IS NULL THEN SET v_sla_hours = 48; END IF;

  SET v_hours_elapsed = ROUND(TIMESTAMPDIFF(HOUR, 
    (SELECT created_at FROM complaints WHERE id = p_complaint_id), 
    NOW()));

  IF v_hours_elapsed > v_sla_hours THEN
    SET v_sla_score = 60; -- Overdue
  ELSEIF v_hours_elapsed > (v_sla_hours * 0.8) THEN
    SET v_sla_score = 30; -- 80% of SLA elapsed
  ELSE
    SET v_sla_score = 0;
  END IF;

  -- Calculate total priority score
  SET v_total_score = v_severity_score + v_cluster_score + v_location_score + v_sla_score;

  -- Update complaint with scores
  UPDATE complaints
  SET 
    severity_score = v_severity_score,
    cluster_score = v_cluster_score,
    location_score = v_location_score,
    sla_score = v_sla_score,
    priority_score = v_total_score,
    sla_deadline = DATE_ADD(created_at, INTERVAL v_sla_hours HOUR),
    last_priority_update = NOW()
  WHERE id = p_complaint_id;

  -- Log to history
  INSERT INTO priority_score_history 
  (complaint_id, severity_score, cluster_score, location_score, sla_score, total_priority_score)
  VALUES (p_complaint_id, v_severity_score, v_cluster_score, v_location_score, v_sla_score, v_total_score);

END //

DELIMITER ;

-- 9. Create stored procedure to update queue positions
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS update_queue_positions(
  IN p_department VARCHAR(100)
)
BEGIN
  DECLARE v_position INT DEFAULT 1;
  DECLARE v_complaint_id INT;
  DECLARE done INT DEFAULT FALSE;
  DECLARE complaint_cursor CURSOR FOR 
    SELECT id FROM complaints 
    WHERE department = p_department 
      AND status IN ('submitted', 'under_review', 'in_progress')
    ORDER BY priority_score DESC, created_at ASC;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN complaint_cursor;
  read_loop: LOOP
    FETCH complaint_cursor INTO v_complaint_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    UPDATE complaints SET queue_position = v_position WHERE id = v_complaint_id;
    SET v_position = v_position + 1;
  END LOOP;
  CLOSE complaint_cursor;

  -- Update department queue stats
  UPDATE department_queues
  SET 
    total_complaints = (SELECT COUNT(*) FROM complaints WHERE department = p_department AND status IN ('submitted', 'under_review', 'in_progress')),
    critical_count = (SELECT COUNT(*) FROM complaints WHERE department = p_department AND priority_score >= 200 AND status IN ('submitted', 'under_review', 'in_progress')),
    high_count = (SELECT COUNT(*) FROM complaints WHERE department = p_department AND priority_score >= 150 AND priority_score < 200 AND status IN ('submitted', 'under_review', 'in_progress')),
    medium_count = (SELECT COUNT(*) FROM complaints WHERE department = p_department AND priority_score >= 100 AND priority_score < 150 AND status IN ('submitted', 'under_review', 'in_progress')),
    low_count = (SELECT COUNT(*) FROM complaints WHERE department = p_department AND priority_score < 100 AND status IN ('submitted', 'under_review', 'in_progress')),
    avg_priority_score = (SELECT AVG(priority_score) FROM complaints WHERE department = p_department AND status IN ('submitted', 'under_review', 'in_progress'))
  WHERE department = p_department;

END //

DELIMITER ;

-- 10. Create trigger to auto-calculate priority when complaint is created
DELIMITER //

CREATE TRIGGER IF NOT EXISTS complaint_priority_on_create
AFTER INSERT ON complaints
FOR EACH ROW
BEGIN
  -- Set department based on category
  UPDATE complaints 
  SET department = NEW.category 
  WHERE id = NEW.id;
  
  -- Calculate priority score
  CALL calculate_complaint_priority(NEW.id);
  
  -- Update queue positions
  CALL update_queue_positions(NEW.category);
END //

DELIMITER ;

-- 11. Create trigger to recalculate priority when complaint is updated
DELIMITER //

CREATE TRIGGER IF NOT EXISTS complaint_priority_on_update
AFTER UPDATE ON complaints
FOR EACH ROW
BEGIN
  IF NEW.status != OLD.status OR NEW.category != OLD.category THEN
    CALL calculate_complaint_priority(NEW.id);
    CALL update_queue_positions(NEW.category);
  END IF;
END //

DELIMITER ;

-- Initialize department queues
INSERT INTO department_queues (department) VALUES
('infrastructure'),
('sanitation'),
('traffic'),
('safety'),
('utilities')
ON DUPLICATE KEY UPDATE department=department;

-- Recalculate all existing complaints
UPDATE complaints SET department = category WHERE department IS NULL;

-- Calculate priority for all existing complaints
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS recalculate_all_priorities()
BEGIN
  DECLARE v_complaint_id INT;
  DECLARE done INT DEFAULT FALSE;
  DECLARE complaint_cursor CURSOR FOR SELECT id FROM complaints;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN complaint_cursor;
  read_loop: LOOP
    FETCH complaint_cursor INTO v_complaint_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    CALL calculate_complaint_priority(v_complaint_id);
  END LOOP;
  CLOSE complaint_cursor;
END //
DELIMITER ;

-- Run recalculation
CALL recalculate_all_priorities();

-- Update all queue positions
UPDATE department_queues SET total_complaints = 0;
CALL update_queue_positions('infrastructure');
CALL update_queue_positions('sanitation');
CALL update_queue_positions('traffic');
CALL update_queue_positions('safety');
CALL update_queue_positions('utilities');
