ALTER TABLE rescue_assignments
  ADD COLUMN IF NOT EXISTS completion_note text,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS victim_confirmed_at timestamp without time zone,
  ADD COLUMN IF NOT EXISTS response_seconds integer,
  ADD COLUMN IF NOT EXISTS resolution_seconds integer;

ALTER TABLE rescue_requests
  ADD COLUMN IF NOT EXISTS incident_type varchar(50),
  ADD COLUMN IF NOT EXISTS victim_rating integer,
  ADD COLUMN IF NOT EXISTS victim_feedback text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rescue_requests_victim_rating_check'
  ) THEN
    ALTER TABLE rescue_requests
      ADD CONSTRAINT rescue_requests_victim_rating_check
      CHECK (victim_rating IS NULL OR (victim_rating >= 1 AND victim_rating <= 5));
  END IF;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS rescuer_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vehicle_info text,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamp without time zone;

CREATE INDEX IF NOT EXISTS idx_rescue_assignments_status ON rescue_assignments(status);
CREATE INDEX IF NOT EXISTS idx_rescue_requests_urgency_created ON rescue_requests(urgency_level, created_at);
