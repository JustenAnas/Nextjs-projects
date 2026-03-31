import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/database";
import type { IEvent } from "@/database";

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Matches a valid URL slug: lowercase letters, digits, and hyphens only.
 * Must not start or end with a hyphen (mirrors generateSlug in event.model.ts).
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ─── Route Handler ────────────────────────────────────────────────────────────

/**
 * GET /api/events/[slug]
 *
 * Returns the event matching the given slug.
 *
 * Responses:
 *  200 – Event found and returned.
 *  400 – slug is missing or has an invalid format.
 *  404 – No event exists with the provided slug.
 *  500 – Unexpected server/database error.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // ── 1. Extract & sanitize slug ─────────────────────────────────────────────
  const { slug } = await params;

  // Sanitize slug — trim whitespace and lowercase (from tutorial)
  const sanitizedSlug = slug?.trim().toLowerCase();

  if (!sanitizedSlug || sanitizedSlug === "") {
    return NextResponse.json(
      { message: "slug parameter is required" },
      { status: 400 }
    );
  }

  // Validate slug format against allowed pattern
  if (!SLUG_REGEX.test(sanitizedSlug)) {
    return NextResponse.json(
      { message: "Invalid slug format. Only lowercase letters, digits, and hyphens are allowed." },
      { status: 400 }
    );
  }

  try {
    // ── 2. Connect to the database ─────────────────────────────────────────
    await connectDB();

    // ── 3. Query the event ─────────────────────────────────────────────────
    // .lean() returns a plain JS object instead of a full Mongoose Document,
    // which is more efficient for read-only API responses.
    const event = await Event.findOne({ slug: sanitizedSlug }).lean<IEvent>();

    if (!event) {
      return NextResponse.json(
        { message: `No event found with slug "${sanitizedSlug}"` },
        { status: 404 }
      );
    }

    // ── 4. Success ─────────────────────────────────────────────────────────
    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );

  } catch (error) {
    // ── 5. Unexpected errors ───────────────────────────────────────────────
    console.error("[GET /api/events/[slug]]", error);
    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}