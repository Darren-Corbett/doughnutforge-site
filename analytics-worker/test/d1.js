// A stand-in for Cloudflare D1 in tests. D1 is SQLite, so Node's built-in
// SQLite runs the same schema and SQL, with the parts of D1's API the
// counter uses: prepare, bind, all, run and batch.
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export function fakeD1() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  const statement = (sql, params = []) => ({
    bind: (...values) => statement(sql, values),
    all: async () => ({ results: sqlite.prepare(sql).all(...params).map((row) => ({ ...row })) }),
    run: async () => {
      sqlite.prepare(sql).run(...params);
      return { success: true };
    },
  });
  return {
    sqlite,
    prepare: (sql) => statement(sql),
    // D1 runs a batch as one transaction
    batch: async (statements) => {
      sqlite.exec("BEGIN");
      try {
        for (const s of statements) await s.run();
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

/** Every stored row, in a fixed order */
export const allRows = (db) =>
  db.sqlite
    .prepare("SELECT day, kind, value, count FROM daily ORDER BY day, kind, value")
    .all()
    .map((row) => ({ ...row }));

export const addRow = (db, day, kind, value, count) =>
  db.sqlite.prepare("INSERT INTO daily (day, kind, value, count) VALUES (?, ?, ?, ?)").run(day, kind, value, count);
