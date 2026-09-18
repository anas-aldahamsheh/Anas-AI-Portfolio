import { z } from "zod";

export const editableEntityTypeSchema = z.enum([
  "block",
  "section",
  "page",
  "ui_text",
  "navigation",
  "system_setting",
]);

export type EditableEntityType = z.infer<typeof editableEntityTypeSchema>;

export interface EditableRef {
  entityType: EditableEntityType;
  entityId: string;
  fieldOrBlockId: string;
  locale?: "ar" | "en" | undefined;
  version?: number | undefined;
  title?: string | undefined;
  initialData?: Record<string, unknown> | string | undefined;
}

export const inlineEditUpdateSchema = z.object({
  entityType: editableEntityTypeSchema,
  entityId: z.string().min(1, "entityId is required"),
  fieldOrBlockId: z.string().min(1, "fieldOrBlockId is required"),
  locale: z.enum(["ar", "en"]).optional(),
  expectedVersion: z.number().int().nonnegative().optional(),
  data: z.union([z.record(z.string(), z.unknown()), z.string()]),
  action: z.enum(["update", "delete", "toggle_visibility"]).default("update"),
});

export type InlineEditUpdateInput = z.infer<typeof inlineEditUpdateSchema>;

export interface InlineEditResult {
  success: boolean;
  entityType: EditableEntityType;
  entityId: string;
  fieldOrBlockId: string;
  version: number;
  updatedAt: string;
  data: Record<string, unknown> | string;
}

export interface InlineEditErrorResult {
  success: false;
  error: string;
  conflict?: boolean | undefined;
  currentVersion?: number | undefined;
}
