/** Builds a minimal RFC 5545 calendar file for a booking and triggers a download. */
export function downloadIcs(opts: { uid: string; title: string; description: string; location: string; start: string; end: string }) {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Auto Synex//Booking OS Genesis//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@genesis.autosynex.demo`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(opts.end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    `LOCATION:${esc(opts.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.uid}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
