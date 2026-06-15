import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ booking: null });
    }
    const user = await User.findOne({ email: session.user.email });
    const booking = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });
    if (!booking) {
      return NextResponse.json({ booking: "idle" });
    }
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { message: `booking active not found error ${error}` },
      { status: 500 }
    );
  }
}
