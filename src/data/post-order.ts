/** Newest first. Posts with the same date: the higher `sameDayOrder` first (none counts as 0) */
export const newestFirst = (a: { date: Date; sameDayOrder?: number }, b: { date: Date; sameDayOrder?: number }) =>
  b.date.getTime() - a.date.getTime() || (b.sameDayOrder ?? 0) - (a.sameDayOrder ?? 0);
