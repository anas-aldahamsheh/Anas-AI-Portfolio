import type { CollectionName } from "./collections";

/** Cache tags shared by readers (`cacheTag`) and writers (`updateTag` / `revalidateTag`). */
export const contentTag = (collection: CollectionName) => `content:${collection}`;
export const UI_TEXT_TAG = "ui-text";
export const SETTINGS_TAG = "settings";
export const MEDIA_TAG = (id: string) => `media:${id}`;
