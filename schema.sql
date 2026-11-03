CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  city TEXT,
  path TEXT,
  referrer TEXT,
  user_agent TEXT,
  network TEXT
);

CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  budget TEXT,
  deadline TEXT,
  details TEXT NOT NULL,
  ip TEXT
);
