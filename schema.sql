CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  city TEXT,
  path TEXT,
  referrer TEXT,
  user_agent TEXT
);
