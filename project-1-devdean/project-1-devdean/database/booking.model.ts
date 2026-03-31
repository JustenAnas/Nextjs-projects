import mongoose, { Document, Model, Schema, Types } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

/**
 * A simple RFC-5322-compatible pattern sufficient for most valid email addresses.
 * Complex edge-case validation is intentionally deferred to the application layer.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    // References the Event collection; indexed for fast per-event queries.
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true, // normalise to lowercase before persisting
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: ({ value }: { value: string }) =>
          `"${value}" is not a valid email address.`,
      },
    },
  },
  { timestamps: true } // auto-manages createdAt / updatedAt
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

/**
 * Before persisting a booking, verify the referenced Event actually exists.
 * This prevents orphaned bookings caused by stale or incorrect eventIds.
 * Only runs when eventId is new or changed to avoid redundant DB lookups.
 */
BookingSchema.pre("save", async function () {
  if (this.isModified("eventId")) {
    const exists = await mongoose
      .model("Event")
      .exists({ _id: this.eventId });

    if (!exists) {
      throw new Error(
        `Cannot create booking: Event "${this.eventId}" does not exist.`
      );
    }
  }
});

// ─── Model ────────────────────────────────────────────────────────────────────

/**
 * Guard against Next.js hot-reload re-registering the model.
 * If the model already exists in the registry, reuse it.
 */
const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
