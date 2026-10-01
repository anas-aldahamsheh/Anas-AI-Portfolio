"use client";

import dynamic from "next/dynamic";
import { useAdminHint } from "./use-admin-hint";

// Loaded only for the owner: visitors never download a byte of admin code.
const AdminOverlay = dynamic(
  () => import("./overlay/admin-overlay").then((mod) => mod.AdminOverlay),
  {
    ssr: false,
  },
);

/**
 * `pf_admin=1` is a non-secret hint set at admin sign-in. It only decides whether to load the
 * editor; every action the editor takes is authorised again on the server.
 */
export function AdminGate() {
  return useAdminHint() ? <AdminOverlay /> : null;
}
