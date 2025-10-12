-- Add subject, branch, year, semester and created_at columns to notes table
ALTER TABLE note ADD COLUMN subject VARCHAR(255);
ALTER TABLE note ADD COLUMN branch_name VARCHAR(255);
ALTER TABLE note ADD COLUMN year INTEGER;
ALTER TABLE note ADD COLUMN semester INTEGER;
ALTER TABLE note ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have default values
UPDATE note SET subject = 'General' WHERE subject IS NULL;
UPDATE note SET branch_name = 'Computer Science' WHERE branch_name IS NULL;
UPDATE note SET year = 1 WHERE year IS NULL;
UPDATE note SET semester = 1 WHERE semester IS NULL;
UPDATE note SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;