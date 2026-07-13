import { prisma } from "@/lib/prisma";
import webpush from "web-push";

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:contact@matchwork.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

type Payload = { title: string; body: string; url?: string };

export async function envoyerNotification(userId: string, payload: Payload) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload)
      )
    )
  );

  const expired = subs.filter((_, i) => {
    const r = results[i];
    return r.status === "rejected" && (r.reason as { statusCode?: number })?.statusCode === 410;
  });

  if (expired.length) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expired.map((s) => s.endpoint) } },
    });
  }
}

export async function envoyerNotificationMasse(userIds: string[], payload: Payload) {
  await Promise.allSettled(userIds.map((id) => envoyerNotification(id, payload)));
}
