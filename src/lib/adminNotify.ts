export interface BookingAlertPayload {
  ritual_type: string;
  preferred_date: string;
  contact_name: string;
  phone?: string | null;
  address?: string | null;
}

const CHANNEL_NAME = "karmapath_admin_alerts";
const DESKTOP_PREF_KEY = "karmapath_admin_desktop_notify";
export const ADMIN_WHATSAPP_NUMBER = "9779869667953";

export const isDesktopNotifyEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DESKTOP_PREF_KEY) === "true" && "Notification" in window && Notification.permission === "granted";
};

export const requestDesktopNotifyPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  const granted = permission === "granted";
  localStorage.setItem(DESKTOP_PREF_KEY, granted ? "true" : "false");
  return granted;
};

export const emitAdminBookingAlert = (payload: BookingAlertPayload) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("karmapath:admin-refresh", { detail: payload }));

  if ("BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: "NEW_BOOKING", payload, at: Date.now() });
      bc.close();
    } catch {
      // Ignore BroadcastChannel errors
    }
  }

  if (isDesktopNotifyEnabled()) {
    try {
      new Notification("🔔 नयाँ पूजा बुकिङ प्राप्त भयो!", {
        body: `${payload.contact_name} · ${payload.ritual_type} (${payload.preferred_date})`,
      });
    } catch {
      // Ignore Notification constructor errors
    }
  }

  const webhookUrl = import.meta.env.VITE_ADMIN_WEBHOOK_URL;
  if (webhookUrl) {
    void fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "booking.created", ...payload }),
    }).catch(() => {});
  }
};

export const subscribeToAdminAlerts = (onAlert: (payload?: BookingAlertPayload) => void): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const handleCustom = (e: Event) => {
    const ce = e as CustomEvent<BookingAlertPayload | undefined>;
    onAlert(ce.detail);
  };

  window.addEventListener("karmapath:admin-refresh", handleCustom);

  let bc: BroadcastChannel | null = null;
  if ("BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === "NEW_BOOKING") {
          onAlert(event.data.payload as BookingAlertPayload);
        } else {
          onAlert();
        }
      };
    } catch {
      bc = null;
    }
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === "karmapath_local_db_v1") {
      onAlert();
    }
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("karmapath:admin-refresh", handleCustom);
    window.removeEventListener("storage", handleStorage);
    bc?.close();
  };
};

export const buildWhatsAppAdminUrl = (payload: BookingAlertPayload): string => {
  const lines = [
    "🙏 नमस्ते KarmaPath,",
    `पूजा बुकिङ जानकारी:`,
    `• सेवा: ${payload.ritual_type}`,
    `• मिति: ${payload.preferred_date}`,
    `• नाम: ${payload.contact_name}`,
    payload.phone ? `• फोन: ${payload.phone}` : "",
    payload.address ? `• ठेगाना: ${payload.address}` : "",
  ].filter(Boolean);
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
};
