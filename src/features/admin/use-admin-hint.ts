"use client";

import { useSyncExternalStore } from "react";

const CHANGE_EVENT = "pf-admin-hint";

/**
 * Whether the non-secret `pf_admin=1` hint cookie is present (set at admin sign-in, cleared at
 * sign-out). It only changes what the UI offers; every admin action is re-authorised on the server.
 */
function subscribe(callback: () => void) {
  // Cookies have no change event: re-check on our own signal and when the tab regains focus.
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("focus", callback);
  document.addEventListener("visibilitychange", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("focus", callback);
    document.removeEventListener("visibilitychange", callback);
  };
}

const read = () => /(?:^|; )pf_admin=1/.test(document.cookie);

export function useAdminHint(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Tells mounted components to re-read the hint after it was set or cleared. */
export function announceAdminHintChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
