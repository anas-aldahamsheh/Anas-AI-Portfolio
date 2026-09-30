"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// Loaded only for the owner: visitors never download a byte of admin code.
const AdminOverlay = dynamic(
  () => import("./overlay/admin-overlay").then((mod) => mod.AdminOverlay),
  {
    ssr: false,
  },
);

const subscribe = () => () => {};
const hasAdminHint = () => /(?:^|; )pf_admin=1/.test(document.cookie);

/**
 * `pf_admin=1` is a non-secret hint set at admin sign-in. It only decides whether to load the
 * editor; every action the editor takes is authorised again on the server.
 */
export function AdminGate() {
  const hinted = useSyncExternalStore(subscribe, hasAdminHint, () => false);
  return hinted ? <AdminOverlay /> : null;
}
