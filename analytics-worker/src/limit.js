// A cap on hits per second for this copy of the Worker. It counts hits, not
// visitors: a cap per visitor would need their IP address. It stops floods,
// not a determined faker.
export function perSecond(max, nowMs = Date.now) {
  let second = -1;
  let used = 0;
  return {
    allow() {
      const now = Math.floor(nowMs() / 1000);
      if (now !== second) {
        second = now;
        used = 0;
      }
      used++;
      return used <= max;
    },
  };
}
