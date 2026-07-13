import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await prisma.opportunite.findUnique({
    where: { id },
    select: { intitule: true, organisme: true, dateLimite: true, description: true, lien: true },
  });

  if (!opp || !opp.dateLimite) {
    return new Response("Not found", { status: 404 });
  }

  const d = opp.dateLimite;
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const now = fmt(new Date());
  const deadline = fmt(d);

  const desc = (opp.description || "").slice(0, 300).replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const url = opp.lien || "";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Matchwork//FR",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${deadline.slice(0, 8)}`,
    `DTEND;VALUE=DATE:${deadline.slice(0, 8)}`,
    `DTSTAMP:${now}`,
    `UID:${id}@matchwork`,
    `SUMMARY:Date limite — ${opp.intitule}`,
    `DESCRIPTION:${desc}${url ? `\\n\\nLien: ${url}` : ""}`,
    `ORGANIZER:${opp.organisme}`,
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    `DESCRIPTION:J-7 — ${opp.intitule}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:J-1 — ${opp.intitule}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${opp.intitule.slice(0, 40).replace(/[^a-zA-Z0-9àéèêëîïôùûüç ]/gi, "")}.ics"`,
    },
  });
}
