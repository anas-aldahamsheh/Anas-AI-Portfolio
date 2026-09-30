/**
 * Tables from the first version of the site. Nothing in the app reads or writes them any more;
 * they stay declared only so Drizzle's migration history matches the live database and no
 * migration drops them by accident. A later, explicitly approved migration can remove them.
 */
export * from "./localization";
export * from "./content";
export * from "./projects";
export * from "./cv";
export * from "./social";
export * from "./ai";
export * from "./evaluation";
export * from "./admin";
