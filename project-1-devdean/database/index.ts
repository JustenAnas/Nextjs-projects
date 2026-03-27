// Single entry point for all database models and their TypeScript interfaces.
// Import from "@/database" anywhere in the application instead of individual files.

export { default as Event } from "./event.model";
export type { IEvent } from "./event.model";

export { default as Booking } from "./booking.model";
export type { IBooking } from "./booking.model";
