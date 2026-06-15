import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a title into a lowercase, hyphen-separated URL slug. */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // strip non-word chars except spaces/hyphens
    .replace(/[\s_]+/g, "-")    // collapse whitespace/underscores to hyphens
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
}

/** Parses any recognisable date string and returns it as YYYY-MM-DD. */
function normalizeDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: "${dateStr}"`);
  }
  return parsed.toISOString().split("T")[0];
}

/**
 * Accepts "HH:MM", "H:MM AM/PM" and similar variants,
 * returning a zero-padded 24-hour "HH:MM" string.
 */
function normalizeTime(timeStr: string): string {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    throw new Error(
      `Invalid time: "${timeStr}". Expected HH:MM or HH:MM AM/PM.`
    );
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  // 12-hour → 24-hour conversion
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours !== 12) hours += 12;

  if (hours > 23 || minutes > 59) {
    throw new Error(`Time value out of range: "${timeStr}"`);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"], // from tutorial
    },

    // Populated by the pre-save hook; must not be set manually.
    slug: {
      type: String,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"], // from tutorial
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
      maxlength: [500, "Overview cannot exceed 500 characters"], // from tutorial
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // Stored as YYYY-MM-DD after normalisation.
    date: {
      type: String,
      required: [true, "Date is required"],
    },

    // Stored as HH:MM (24-hour) after normalisation.
    time: {
      type: String,
      required: [true, "Time is required"],
    },

    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: 'Mode must be "online", "offline", or "hybrid".',
      },
    },

    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },

    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item.",
      },
    },

    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },

    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must contain at least one item.",
      },
    },
  },
  { timestamps: true } // auto-manages createdAt / updatedAt
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Compound index for common queries filtering by date and mode
EventSchema.index({ date: 1, mode: 1 });

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

/**
 * Runs before every save:
 *  - Slug   : regenerated from title only when the title field is dirty.
 *  - Date   : normalised to YYYY-MM-DD (ISO calendar date).
 *  - Time   : normalised to HH:MM 24-hour format.
 */
EventSchema.pre("save", function () {
  try {
    if (this.isModified("title")) {
      this.slug = generateSlug(this.title);
    }
    if (this.isModified("date")) {
      this.date = normalizeDate(this.date as string);
    }
    if (this.isModified("time")) {
      this.time = normalizeTime(this.time as string);
    }
  } catch (err) {
    throw err;
  }
});

// ─── Model ────────────────────────────────────────────────────────────────────

/**
 * Guard against Next.js hot-reload re-registering the model.
 * If the model already exists in the registry, reuse it.
 */
const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", EventSchema);

export default Event;