import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    const { bookingId } = await req.json();

    const booking = await Booking.findById(bookingId).populate(
      "user vehicle driver"
    );
    return Response.json(booking, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `get active ride user error ${error}` },
      { status: 500 }
    );
  }
}
