CREATE TYPE "public"."application_status" AS ENUM('new', 'reviewed', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'waitlist', 'cancelled', 'checked_in', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."card_status" AS ENUM('active', 'locked', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('valid', 'used', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'staff');--> statement-breakpoint
CREATE TABLE "black_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_number" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"status" "card_status" DEFAULT 'active' NOT NULL,
	"holder_name" varchar(255),
	"holder_phone" varchar(50),
	"holder_email" varchar(255),
	"no_show_count" integer DEFAULT 0 NOT NULL,
	"suspended_until" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "black_cards_card_number_unique" UNIQUE("card_number"),
	CONSTRAINT "black_cards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"card_id" integer NOT NULL,
	"guest_name" varchar(255) NOT NULL,
	"guest_email" varchar(255) NOT NULL,
	"guest_phone" varchar(50),
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"position" integer,
	"checked_in_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"booking_id" uuid,
	"ticket_id" uuid,
	"checked_in_by" uuid,
	"type" varchar(20) NOT NULL,
	"checked_in_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"session_id" uuid NOT NULL,
	"card_id" integer NOT NULL,
	"guest_name" varchar(255) NOT NULL,
	"guest_phone" varchar(50),
	"verified" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_list_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"guest_name" varchar(255) NOT NULL,
	"guest_email" varchar(255) NOT NULL,
	"guest_phone" varchar(50),
	"allocated_by" varchar(255),
	"status" "ticket_status" DEFAULT 'valid' NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guest_list_tickets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "recording_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"artist_name" varchar(255) NOT NULL,
	"genre" varchar(255) NOT NULL,
	"artist_origin" varchar(255) NOT NULL,
	"instagram_url" varchar(500),
	"soundcloud_url" varchar(500),
	"message" text NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recording_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist_name" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"max_cardholders" integer DEFAULT 15 NOT NULL,
	"max_waitlist" integer DEFAULT 5 NOT NULL,
	"max_guest_list" integer DEFAULT 10 NOT NULL,
	"description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'staff' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_session_id_recording_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."recording_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_card_id_black_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."black_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_session_id_recording_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."recording_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_ticket_id_guest_list_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."guest_list_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_codes" ADD CONSTRAINT "email_verification_codes_session_id_recording_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."recording_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_codes" ADD CONSTRAINT "email_verification_codes_card_id_black_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."black_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_list_tickets" ADD CONSTRAINT "guest_list_tickets_session_id_recording_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."recording_sessions"("id") ON DELETE cascade ON UPDATE no action;