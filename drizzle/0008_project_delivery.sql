CREATE TABLE project_submissions (
 id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, assignment_id TEXT NOT NULL,
 source_hash TEXT NOT NULL, suite_version TEXT NOT NULL, manifest TEXT NOT NULL,
 status TEXT NOT NULL, runner_job TEXT NOT NULL, result TEXT, error TEXT,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_project_submissions_user_time ON project_submissions(user_id,created_at);
--> statement-breakpoint
CREATE UNIQUE INDEX idx_project_submission_active ON project_submissions(user_id) WHERE status='running';
