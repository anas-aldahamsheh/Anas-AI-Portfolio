-- Additive only: new tables, extensions and missing auth columns. Nothing existing is altered or dropped.
-- Every statement is idempotent so it is safe on databases that were created with `drizzle-kit push`.
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"i18n" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_entries_status_chk" CHECK ("content_entries"."status" in ('published', 'draft', 'hidden'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"collection" text NOT NULL,
	"slug" text NOT NULL,
	"version" integer NOT NULL,
	"action" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sha256" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_texts" (
	"key" text NOT NULL,
	"locale" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ui_texts_key_locale_pk" PRIMARY KEY("key","locale")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"ordinal" integer NOT NULL,
	"kind" text NOT NULL,
	"locale" text NOT NULL,
	"heading" text NOT NULL,
	"text" text NOT NULL,
	"search_text" text NOT NULL,
	"tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, search_text)) STORED NOT NULL,
	"embedding" vector(768),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_key" text NOT NULL,
	"entry_id" uuid,
	"kind" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"content_hash" text NOT NULL,
	"status" text DEFAULT 'ready' NOT NULL,
	"error" text,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"embedding_model" text NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assistant_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" text NOT NULL,
	"visitor" text NOT NULL,
	"locale" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"tool_calls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" text,
	"latency_ms" integer,
	"input_tokens" integer,
	"output_tokens" integer,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limit_buckets_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "id_token" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "scope" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'knowledge_chunks_source_id_knowledge_sources_id_fk') THEN
    ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "content_entries_collection_slug_uniq" ON "content_entries" USING btree ("collection","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_entries_listing_idx" ON "content_entries" USING btree ("collection","status","order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_revisions_entry_idx" ON "content_revisions" USING btree ("entry_id","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_revisions_created_idx" ON "content_revisions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "media_assets_sha256_uniq" ON "media_assets" USING btree ("sha256");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_chunks_source_idx" ON "knowledge_chunks" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_chunks_kind_idx" ON "knowledge_chunks" USING btree ("kind");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_chunks_tsv_idx" ON "knowledge_chunks" USING gin ("tsv");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_chunks_embedding_idx" ON "knowledge_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "knowledge_sources_key_uniq" ON "knowledge_sources" USING btree ("source_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_sources_entry_idx" ON "knowledge_sources" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_sources_kind_idx" ON "knowledge_sources" USING btree ("kind");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assistant_turns_created_idx" ON "assistant_turns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assistant_turns_conversation_idx" ON "assistant_turns" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rate_limit_window_idx" ON "rate_limit_buckets" USING btree ("window_start");