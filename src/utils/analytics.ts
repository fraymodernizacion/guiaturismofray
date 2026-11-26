export type AnalyticsEventType = 'visit' | 'section' | 'place_view';

let initialVisitRecorded = false;
let initialVisitInFlight = false;

const detectDeviceType = (): 'mobile' | 'desktop' => {
  if (typeof window === 'undefined') return 'mobile';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  return isMobileUa || window.innerWidth < 768 ? 'mobile' : 'desktop';
};

async function postUsageEvent(
  payload: {
    type: AnalyticsEventType;
    target?: string;
    label?: string;
    device: 'mobile' | 'desktop';
  },
  attempt = 0
): Promise<boolean> {
  try {
    const res = await fetch('/api/uso/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (res.ok) return true;
  } catch {
    // Retry below for initial visits
  }

  if (payload.type === 'visit' && attempt < 2) {
    const delayMs = attempt === 0 ? 2000 : 5000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return postUsageEvent(payload, attempt + 1);
  }
  return false;
}

/**
 * Sends a lightweight, anonymous usage event to the server.
 * Requires zero login or personal identifiers from the visitor.
 */
export function trackAnalyticsEvent(
  type: AnalyticsEventType,
  target?: string,
  label?: string
): void {
  if (typeof window === 'undefined') return;

  if (type === 'visit') {
    if (initialVisitRecorded || initialVisitInFlight) return;
    initialVisitInFlight = true;
  }

  const payload = {
    type,
    ...(target ? { target } : {}),
    ...(label ? { label } : {}),
    device: detectDeviceType(),
  };

  void postUsageEvent(payload).then((ok) => {
    if (type === 'visit') {
      initialVisitInFlight = false;
      if (ok) {
        initialVisitRecorded = true;
      }
    }
  });
}
