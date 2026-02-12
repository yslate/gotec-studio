ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "site_settings" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "bookings_session_id_idx" ON "bookings" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "bookings_card_id_idx" ON "bookings" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_guest_email_idx" ON "bookings" USING btree ("guest_email");--> statement-breakpoint
CREATE INDEX "bookings_session_status_idx" ON "bookings" USING btree ("session_id","status");--> statement-breakpoint
CREATE INDEX "check_ins_session_id_idx" ON "check_ins" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "email_verification_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "gl_tickets_session_id_idx" ON "guest_list_tickets" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "gl_tickets_status_idx" ON "guest_list_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gl_tickets_session_status_idx" ON "guest_list_tickets" USING btree ("session_id","status");--> statement-breakpoint
CREATE INDEX "sessions_date_idx" ON "recording_sessions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "sessions_published_idx" ON "recording_sessions" USING btree ("is_published");