-- Add meeting_password column to meetings table
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS meeting_password VARCHAR(20) DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN meetings.meeting_password IS 'Optional password for the meeting room (e.g., Jitsi Meet)';
