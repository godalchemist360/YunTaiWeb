CREATE TABLE "announcement_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"announcement_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text NOT NULL,
	"data" text,
	"file_url" text,
	"cloud_key" text,
	"storage_type" text,
	"cloud_provider" text,
	"checksum_sha256" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_read_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"announcement_id" text NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"publish_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement_attachments" ADD CONSTRAINT "announcement_attachments_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_read_receipts" ADD CONSTRAINT "announcement_read_receipts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_read_receipts" ADD CONSTRAINT "announcement_read_receipts_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_attachments_announcement_id_idx" ON "announcement_attachments" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "announcement_read_receipts_user_id_idx" ON "announcement_read_receipts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "announcement_read_receipts_announcement_id_idx" ON "announcement_read_receipts" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "announcement_read_receipts_unique_idx" ON "announcement_read_receipts" USING btree ("user_id","announcement_id");--> statement-breakpoint
CREATE INDEX "announcements_type_idx" ON "announcements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "announcements_publish_at_idx" ON "announcements" USING btree ("publish_at");