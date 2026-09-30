import { notFound } from "next/navigation";

// Always a 404: nothing to prerender or validate for instant navigation.
export const instant = false;

/** Any unknown path still renders inside the site layout (header, footer, assistant). */
export default function Missing() {
  notFound();
}
