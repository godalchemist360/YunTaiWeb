CREATE TABLE "sales_support" (
	"id" text PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"category" text NOT NULL,
	"item" text NOT NULL,
	"classification" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" text NOT NULL,
	"description" text,
	"file_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sales_support_category_idx" ON "sales_support" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sales_support_item_idx" ON "sales_support" USING btree ("item");--> statement-breakpoint
CREATE INDEX "sales_support_classification_idx" ON "sales_support" USING btree ("classification");--> statement-breakpoint
CREATE INDEX "sales_support_created_at_idx" ON "sales_support" USING btree ("created_at");