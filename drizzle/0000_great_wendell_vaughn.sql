CREATE TYPE "public"."user_role_enum" AS ENUM('GUEST', 'USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."publish_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role_enum" DEFAULT 'USER' NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locales" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"dir" text DEFAULT 'ltr' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ui_text_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ui_text_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ui_text_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_id" uuid NOT NULL,
	"locale_code" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ui_text_trans_key_locale_uniq" UNIQUE("key_id","locale_code")
);
--> statement-breakpoint
CREATE TABLE "page_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"locale_code" text NOT NULL,
	"title" text NOT NULL,
	"meta_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_trans_page_locale_uniq" UNIQUE("page_id","locale_code")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" "publish_status_enum" DEFAULT 'DRAFT' NOT NULL,
	"is_home" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "publish_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"published_by" uuid,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_block_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"locale_code" text NOT NULL,
	"content" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "block_trans_block_locale_uniq" UNIQUE("block_id","locale_code")
);
--> statement-breakpoint
CREATE TABLE "section_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"block_type" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"locale_code" text NOT NULL,
	"title" text,
	"subtitle" text,
	"content" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "section_trans_section_locale_uniq" UNIQUE("section_id","locale_code")
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"section_type" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"status" "publish_status_enum" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_block_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"locale_code" text NOT NULL,
	"content" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proj_block_trans_uniq" UNIQUE("block_id","locale_code")
);
--> statement-breakpoint
CREATE TABLE "project_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"block_type" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "project_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_category_links" (
	"project_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "project_category_links_project_id_category_id_pk" PRIMARY KEY("project_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "project_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"label_key" text NOT NULL,
	"url" text NOT NULL,
	"link_type" text DEFAULT 'external' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" text NOT NULL,
	"media_type" text DEFAULT 'image' NOT NULL,
	"alt_text_key" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tag_links" (
	"project_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "project_tag_links_project_id_tag_id_pk" PRIMARY KEY("project_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "project_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "project_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"locale_code" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"problem" text,
	"constraints" text,
	"solution" text,
	"architecture" text,
	"implementation" text,
	"challenges" text,
	"decisions_tradeoffs" text,
	"results" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proj_trans_proj_locale_uniq" UNIQUE("project_id","locale_code")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" "publish_status_enum" DEFAULT 'PUBLISHED' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"cover_image_url" text,
	"repo_url" text,
	"demo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cv_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cv_version_id" uuid NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"published_by" uuid,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cv_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_number" integer NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text DEFAULT 'application/pdf' NOT NULL,
	"changelog" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_profile_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"social_profile_id" uuid NOT NULL,
	"locale_code" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	CONSTRAINT "social_trans_profile_locale_uniq" UNIQUE("social_profile_id","locale_code")
);
--> statement-breakpoint
CREATE TABLE "social_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"handle" text,
	"icon_name" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_model_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capability" text NOT NULL,
	"model_id" uuid NOT NULL,
	"environment" text DEFAULT 'production' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_assignment_cap_env_uniq" UNIQUE("capability","environment")
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"model_id" text NOT NULL,
	"capability" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"context_window" integer,
	"max_output_tokens" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"provider_type" text NOT NULL,
	"base_url" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_runtime_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timeout_ms" integer DEFAULT 30000 NOT NULL,
	"max_retries" integer DEFAULT 2 NOT NULL,
	"rate_limit_rpm" integer DEFAULT 30 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text NOT NULL,
	"index_version_id" uuid NOT NULL,
	"total_documents" integer DEFAULT 0 NOT NULL,
	"processed_documents" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prompt_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"system_prompt" text NOT NULL,
	"user_template" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"changelog" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_ver_prompt_num_uniq" UNIQUE("prompt_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rag_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"chunk_size" integer DEFAULT 512 NOT NULL,
	"chunk_overlap" integer DEFAULT 64 NOT NULL,
	"top_k" integer DEFAULT 10 NOT NULL,
	"rerank_top_n" integer DEFAULT 5 NOT NULL,
	"rerank_threshold" text DEFAULT '0.3' NOT NULL,
	"hybrid_alpha" text DEFAULT '0.5' NOT NULL,
	"context_token_budget" integer DEFAULT 3000 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rag_index_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_tag" text NOT NULL,
	"embedding_model" text NOT NULL,
	"dense_dimension" integer DEFAULT 1024 NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"indexed_chunk_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rag_index_versions_version_tag_unique" UNIQUE("version_tag")
);
--> statement-breakpoint
CREATE TABLE "source_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer NOT NULL,
	"qdrant_point_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_chunks_qdrant_point_id_unique" UNIQUE("qdrant_point_id")
);
--> statement-breakpoint
CREATE TABLE "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"title" text NOT NULL,
	"content_hash" text NOT NULL,
	"locale_code" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"query" text NOT NULL,
	"expected_answer" text,
	"context_ground_truth" text,
	"locale_code" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"metric_name" text NOT NULL,
	"score" text NOT NULL,
	"passed" boolean DEFAULT true NOT NULL,
	"reason" text,
	"evaluated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"case_id" uuid NOT NULL,
	"generated_response" text NOT NULL,
	"retrieved_context" jsonb,
	"latency_ms" integer,
	"token_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"prompt_version_id" uuid,
	"model_id" text NOT NULL,
	"git_commit" text,
	"triggered_by" text DEFAULT 'automated' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"previous_state" jsonb,
	"new_state" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"key" text PRIMARY KEY NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secret_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"encrypted_value" text NOT NULL,
	"iv" text NOT NULL,
	"tag" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "secret_references_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"accent_color" text DEFAULT '240 5.9% 10%' NOT NULL,
	"neutral_family" text DEFAULT 'zinc' NOT NULL,
	"radius_scale" text DEFAULT '0.5rem' NOT NULL,
	"density" text DEFAULT 'comfortable' NOT NULL,
	"motion_intensity" text DEFAULT 'normal' NOT NULL,
	"max_width" text DEFAULT '1200px' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_text_translations" ADD CONSTRAINT "ui_text_translations_key_id_ui_text_keys_id_fk" FOREIGN KEY ("key_id") REFERENCES "public"."ui_text_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_text_translations" ADD CONSTRAINT "ui_text_translations_locale_code_locales_code_fk" FOREIGN KEY ("locale_code") REFERENCES "public"."locales"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_locale_code_locales_code_fk" FOREIGN KEY ("locale_code") REFERENCES "public"."locales"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publish_revisions" ADD CONSTRAINT "publish_revisions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_block_translations" ADD CONSTRAINT "section_block_translations_block_id_section_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."section_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_block_translations" ADD CONSTRAINT "section_block_translations_locale_code_locales_code_fk" FOREIGN KEY ("locale_code") REFERENCES "public"."locales"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_blocks" ADD CONSTRAINT "section_blocks_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_translations" ADD CONSTRAINT "section_translations_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_translations" ADD CONSTRAINT "section_translations_locale_code_locales_code_fk" FOREIGN KEY ("locale_code") REFERENCES "public"."locales"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_block_translations" ADD CONSTRAINT "project_block_translations_block_id_project_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."project_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_block_translations" ADD CONSTRAINT "project_block_translations_locale_code_locales_code_fk" FOREIGN KEY ("locale_code") REFERENCES "public"."locales"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_blocks" ADD CONSTRAINT "project_blocks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_category_links" ADD CONSTRAINT "project_category_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_category_links" ADD CONSTRAINT "project_category_links_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_links" ADD CONSTRAINT "project_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tag_links" ADD CONSTRAINT "project_tag_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tag_links" ADD CONSTRAINT "project_tag_links_tag_id_project_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."project_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_locale_code_locales_code_fk" FOREIGN KEY ("locale_code") REFERENCES "public"."locales"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_publications" ADD CONSTRAINT "cv_publications_cv_version_id_cv_versions_id_fk" FOREIGN KEY ("cv_version_id") REFERENCES "public"."cv_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_publications" ADD CONSTRAINT "cv_publications_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_versions" ADD CONSTRAINT "cv_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_profile_translations" ADD CONSTRAINT "social_profile_translations_social_profile_id_social_profiles_id_fk" FOREIGN KEY ("social_profile_id") REFERENCES "public"."social_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_profile_translations" ADD CONSTRAINT "social_profile_translations_locale_code_locales_code_fk" FOREIGN KEY ("locale_code") REFERENCES "public"."locales"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_assignments" ADD CONSTRAINT "ai_model_assignments_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_index_version_id_rag_index_versions_id_fk" FOREIGN KEY ("index_version_id") REFERENCES "public"."rag_index_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_chunks" ADD CONSTRAINT "source_chunks_document_id_source_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_cases" ADD CONSTRAINT "evaluation_cases_dataset_id_evaluation_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."evaluation_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_metrics" ADD CONSTRAINT "evaluation_metrics_result_id_evaluation_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."evaluation_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD CONSTRAINT "evaluation_results_run_id_evaluation_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."evaluation_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD CONSTRAINT "evaluation_results_case_id_evaluation_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."evaluation_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_runs" ADD CONSTRAINT "evaluation_runs_dataset_id_evaluation_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."evaluation_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "ui_text_keys_key_idx" ON "ui_text_keys" USING btree ("key");--> statement-breakpoint
CREATE INDEX "ui_text_trans_key_idx" ON "ui_text_translations" USING btree ("key_id");--> statement-breakpoint
CREATE INDEX "ui_text_trans_locale_idx" ON "ui_text_translations" USING btree ("locale_code");--> statement-breakpoint
CREATE INDEX "page_trans_page_idx" ON "page_translations" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "pages_status_idx" ON "pages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "publish_rev_entity_idx" ON "publish_revisions" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "publish_rev_published_at_idx" ON "publish_revisions" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "block_trans_block_idx" ON "section_block_translations" USING btree ("block_id");--> statement-breakpoint
CREATE INDEX "section_blocks_section_id_idx" ON "section_blocks" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "section_blocks_order_idx" ON "section_blocks" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "section_trans_section_idx" ON "section_translations" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "sections_page_id_idx" ON "sections" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "sections_order_idx" ON "sections" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "proj_block_trans_block_idx" ON "project_block_translations" USING btree ("block_id");--> statement-breakpoint
CREATE INDEX "proj_blocks_proj_idx" ON "project_blocks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "proj_blocks_order_idx" ON "project_blocks" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "proj_links_proj_idx" ON "project_links" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "proj_media_proj_idx" ON "project_media" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "proj_trans_proj_idx" ON "project_translations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_order_idx" ON "projects" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "cv_pub_current_idx" ON "cv_publications" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "cv_pub_version_idx" ON "cv_publications" USING btree ("cv_version_id");--> statement-breakpoint
CREATE INDEX "cv_versions_num_idx" ON "cv_versions" USING btree ("version_number");--> statement-breakpoint
CREATE INDEX "social_trans_profile_idx" ON "social_profile_translations" USING btree ("social_profile_id");--> statement-breakpoint
CREATE INDEX "social_profiles_platform_idx" ON "social_profiles" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "social_profiles_order_idx" ON "social_profiles" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "ai_assignment_model_idx" ON "ai_model_assignments" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "ai_models_provider_idx" ON "ai_models" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "ai_models_capability_idx" ON "ai_models" USING btree ("capability");--> statement-breakpoint
CREATE INDEX "ai_providers_name_idx" ON "ai_providers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "ingestion_jobs_status_idx" ON "ingestion_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prompt_ver_prompt_idx" ON "prompt_versions" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_ver_active_idx" ON "prompt_versions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "prompts_slug_idx" ON "prompts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "rag_config_current_idx" ON "rag_configurations" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "rag_index_current_idx" ON "rag_index_versions" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "source_chunks_doc_idx" ON "source_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "source_chunks_qdrant_idx" ON "source_chunks" USING btree ("qdrant_point_id");--> statement-breakpoint
CREATE INDEX "source_docs_type_id_idx" ON "source_documents" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "source_docs_hash_idx" ON "source_documents" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "eval_cases_dataset_idx" ON "evaluation_cases" USING btree ("dataset_id");--> statement-breakpoint
CREATE INDEX "eval_metrics_result_idx" ON "evaluation_metrics" USING btree ("result_id");--> statement-breakpoint
CREATE INDEX "eval_metrics_metric_idx" ON "evaluation_metrics" USING btree ("metric_name");--> statement-breakpoint
CREATE INDEX "eval_results_run_idx" ON "evaluation_results" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "eval_results_case_idx" ON "evaluation_results" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "eval_runs_dataset_idx" ON "evaluation_runs" USING btree ("dataset_id");--> statement-breakpoint
CREATE INDEX "eval_runs_status_idx" ON "evaluation_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_events_user_idx" ON "audit_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_events_action_idx" ON "audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_events_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "secret_refs_key_idx" ON "secret_references" USING btree ("key");--> statement-breakpoint
CREATE INDEX "theme_config_active_idx" ON "theme_configurations" USING btree ("is_active");