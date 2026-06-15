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
 * RFC-5322 compliant email regex — more thorough than a simple pattern,
 * handles edge cases like subdomains, special characters, etc.
 * Complex edge-case validation is intentionally deferred to the application layer.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

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

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Compound index for querying event bookings sorted by date
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Index on email for fast user booking lookups
BookingSchema.index({ email: 1 });

// Unique compound index — prevents duplicate bookings (same email + same event)
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: "uniq_event_email" }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

/**
 * Before persisting a booking, verify the referenced Event actually exists.
 * This prevents orphaned bookings caused by stale or incorrect eventIds.
 * Runs when eventId is new or changed to avoid redundant DB lookups.
 */
BookingSchema.pre("save", async function () {
  // Check on new documents too (isNew) — not just modifications
  if (this.isModified("eventId") || this.isNew) {
    try {
      const exists = await mongoose
        .model("Event")
        .exists({ _id: this.eventId });

      if (!exists) {
        throw new Error(
          `Cannot create booking: Event "${this.eventId}" does not exist.`
        );
      }
    } catch (err) {
      // Re-throw so Mongoose surfaces it as a validation error
      throw err;
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