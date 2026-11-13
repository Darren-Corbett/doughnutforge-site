-- Daily totals, one row per day, kind and value. Each kind is counted on its
-- own (never page by country by referrer), so no small combination can point
-- to one visitor. Nothing else is stored: no IP address, browser, time or
-- anything that links one view to another.
CREATE TABLE IF NOT EXISTS daily (
  day TEXT NOT NULL, -- UTC day, 'YYYY-MM-DD'
  kind TEXT NOT NULL CHECK (kind IN ('page', 'language', 'country', 'referrer', 'store')),
  value TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0),
  PRIMARY KEY (day, kind, value)
) WITHOUT ROWID;
