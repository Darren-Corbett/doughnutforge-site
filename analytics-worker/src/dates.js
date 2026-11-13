// Days are UTC calendar days written YYYY-MM-DD, so they sort and compare as text.
export const dayOf = (date) => date.toISOString().slice(0, 10);

export const daysBefore = (date, days) =>
  dayOf(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - days)));

export const monthsBefore = (date, months) =>
  dayOf(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, date.getUTCDate())));
