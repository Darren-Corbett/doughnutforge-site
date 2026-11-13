// The SQL for the daily totals (schema.sql). `db` is a D1 database.

const ADD_ONE = `INSERT INTO daily (day, kind, value, count) VALUES (?, ?, ?, 1)
  ON CONFLICT (day, kind, value) DO UPDATE SET count = count + 1`;

/** Adds one to each total, all or none */
export const addOne = (db, day, counts) => db.batch(counts.map(({ kind, value }) => db.prepare(ADD_ONE).bind(day, kind, value)));

/** Each kind and value's total from one day to another, both included */
export const totalsBetween = async (db, from, to) =>
  (
    await db
      .prepare("SELECT kind, value, SUM(count) AS count FROM daily WHERE day BETWEEN ? AND ? GROUP BY kind, value")
      .bind(from, to)
      .all()
  ).results;

export const deleteBefore = (db, day) => db.prepare("DELETE FROM daily WHERE day < ?").bind(day).run();
