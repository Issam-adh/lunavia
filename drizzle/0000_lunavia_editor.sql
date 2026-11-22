CREATE TABLE lunavia_admin (
 id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL, salt TEXT NOT NULL,
 digest TEXT NOT NULL, generation INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE lunavia_sessions (
 token TEXT PRIMARY KEY, identity TEXT NOT NULL, generation INTEGER NOT NULL, expires INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE lunavia_attempts (
 bucket TEXT PRIMARY KEY, started INTEGER NOT NULL, count INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE lunavia_content (
 id INTEGER PRIMARY KEY CHECK(id=1), draft TEXT NOT NULL DEFAULT '{}', published TEXT NOT NULL DEFAULT '{}',
 revision INTEGER NOT NULL DEFAULT 0, published_revision INTEGER NOT NULL DEFAULT 0, published_at TEXT
);
