import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return Response.json({ message: "cant find  partner" }, { status: 400 });
    }

    const bookings = await Booking.find({
      driver: partner._id,
      bookingStatus: "requested",
    });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `fetch pending req error ${error}` },
      { status: 500 }
    );
  }
}
