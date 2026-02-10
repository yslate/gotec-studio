CREATE TYPE "public"."slot_status" AS ENUM('available', 'booked');--> statement-breakpoint
CREATE TABLE "recording_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"status" "slot_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recording_applications" ADD COLUMN "slot_id" uuid;--> statement-breakpoint
ALTER TABLE "recording_applications" ADD CONSTRAINT "recording_applications_slot_id_recording_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."recording_slots"("id") ON DELETE set null ON UPDATE no action;